import Stripe from "stripe";
import { buffer } from "micro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session?.metadata?.user_id;
      const itemId = session?.metadata?.item_id;
      const collectionId = session?.metadata?.collection_id;
      const supportAmount = Number(session?.metadata?.support_amount || 0);

      if (
        !userId ||
        !itemId ||
        !collectionId ||
        ![5, 8, 10, 15].includes(supportAmount)
      ) {
        console.error("❌ Missing/invalid metadata:", session?.metadata);
        return res.status(200).json({ received: true });
      }

      // Idempotency: if purchase already paid, do nothing
      const { data: existingPurchase, error: purchaseReadErr } =
        await supabaseAdmin
          .from("purchases")
          .select("id,status")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

      if (purchaseReadErr) {
        console.error("❌ purchases read error:", purchaseReadErr.message);
        return res.status(200).json({ received: true });
      }

      if (existingPurchase?.status === "paid") {
        return res.status(200).json({ received: true });
      }

      const creatorAmount = supportAmount * 0.3;
      const ambassadorAmount = supportAmount * 0.1;
      const lotteryAmount = supportAmount * 0.6;

      // 1) Mark item sold
      const { error: itemErr } = await supabaseAdmin
        .from("items")
        .update({ is_sold: true })
        .eq("id", itemId);

      if (itemErr) console.error("❌ item update error:", itemErr.message);

      // 2) Update purchase as paid
      const { error: purchaseUpdErr } = await supabaseAdmin
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent: session.payment_intent,
          support_amount: supportAmount,
          price: supportAmount, // keeps your NOT NULL price constraint satisfied
          creator_amount: creatorAmount,
          ambassador_amount: ambassadorAmount,
          lottery_amount: lotteryAmount,
        })
        .eq("stripe_session_id", session.id);

      if (purchaseUpdErr)
        console.error("❌ purchase update error:", purchaseUpdErr.message);

      // 3) Add ONLY lottery amount to cagnotte_total (60%)
      const { data: col, error: colErr } = await supabaseAdmin
        .from("collections")
        .select("cagnotte_total")
        .eq("id", collectionId)
        .single();

      if (colErr) {
        console.error("❌ collections read error:", colErr.message);
      } else {
        const currentTotal = Number(col?.cagnotte_total || 0);
        const { error: colUpdErr } = await supabaseAdmin
          .from("collections")
          .update({ cagnotte_total: currentTotal + lotteryAmount })
          .eq("id", collectionId);

        if (colUpdErr)
          console.error("❌ collections update error:", colUpdErr.message);
      }

      // 4) Student-only lottery ticket (FIXED LOGIC)
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
        .select("is_student, is_ambassador")
        .eq("id", userId)
        .single();

      if (profErr) {
        console.error("❌ profiles read error:", profErr.message);
      } else {
        const isEligibleStudent =
          prof?.is_student === true || prof?.is_ambassador === true;

        if (isEligibleStudent) {
          const { error: ticketErr } = await supabaseAdmin
            .from("lottery_tickets")
            .upsert(
              { collection_id: collectionId, user_id: userId },
              { onConflict: "collection_id,user_id" }
            );

          if (ticketErr)
            console.error("❌ ticket upsert error:", ticketErr.message);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler crash:", err);
    return res.status(200).json({ received: true });
  }
}
