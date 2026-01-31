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
    /* ------------------------------------------------------------------
       ✅ NEW: Handle cancelled / expired / failed checkouts
       ------------------------------------------------------------------ */
    if (
      event.type === "checkout.session.expired" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const session = event.data.object;

      if (session?.id) {
        await supabaseAdmin
          .from("purchases")
          .update({ status: "cancelled" })
          .eq("stripe_session_id", session.id);
      }

      return res.status(200).json({ received: true });
    }

    /* ------------------------------------------------------------------
       EXISTING LOGIC — UNTOUCHED
       ------------------------------------------------------------------ */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // 🔐 Only accept PAID sessions
      if (session.payment_status !== "paid") {
        return res.status(200).json({ received: true });
      }

      const userId = session?.metadata?.user_id;
      const itemId = session?.metadata?.item_id;
      const collectionId = session?.metadata?.collection_id;
      const supportAmount = Number(session?.metadata?.support_amount || 0);

      // ❌ HARD REQUIREMENTS
      if (
        !userId ||
        !itemId ||
        !collectionId ||
        ![1, 2, 3, 5].includes(supportAmount)
      ) {
        console.error("❌ Missing or invalid metadata:", session?.metadata);
        return res.status(200).json({ received: true });
      }

      // 🔎 Check if purchase already exists
      const { data: existingPurchase, error: readErr } =
        await supabaseAdmin
          .from("purchases")
          .select("id,status")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

      if (readErr) {
        console.error("❌ purchases read error:", readErr.message);
        return res.status(200).json({ received: true });
      }

      // 🛠️ Self-healing: insert purchase if missing
      if (!existingPurchase) {
        await supabaseAdmin.from("purchases").insert({
          stripe_session_id: session.id,
          user_id: userId,
          collection_id: collectionId,
          item_id: itemId,
          status: "pending",
        });
      } else if (existingPurchase.status === "paid") {
        return res.status(200).json({ received: true });
      }

      // 🔎 Pull revenue split
      const { data: colMeta, error: colErr } = await supabaseAdmin
        .from("collections")
        .select("creator_share_pct, ambassador_share_pct, lottery_share_pct")
        .eq("id", collectionId)
        .single();

      if (colErr) {
        console.error("❌ collections read error:", colErr.message);
        return res.status(200).json({ received: true });
      }

      const creatorPct = Number(colMeta?.creator_share_pct ?? 30);
      const ambassadorPct = Number(colMeta?.ambassador_share_pct ?? 10);
      const lotteryPct = Number(colMeta?.lottery_share_pct ?? 60);

      const creatorAmount = (supportAmount * creatorPct) / 100;
      const ambassadorAmount = (supportAmount * ambassadorPct) / 100;
      const lotteryAmount = (supportAmount * lotteryPct) / 100;

      // ✅ Mark item as sold
      const { error: itemErr } = await supabaseAdmin
        .from("items")
        .update({ is_sold: true })
        .eq("id", itemId);

      if (itemErr) {
        console.error("❌ item update error:", itemErr.message);
      }

      // ✅ Finalize purchase
      const { error: updErr } = await supabaseAdmin
        .from("purchases")
        .update({
          status: "paid",
          stripe_payment_intent: session.payment_intent,
          support_amount: supportAmount,
          price: supportAmount,
          creator_amount: creatorAmount,
          ambassador_amount: ambassadorAmount,
          lottery_amount: lotteryAmount,
        })
        .eq("stripe_session_id", session.id);

      if (updErr) {
        console.error("❌ purchases update error:", updErr.message);
        return res.status(200).json({ received: true });
      }
// 🎯 Assign a random fun task (if any active)
const { data: tasks, error: taskErr } = await supabaseAdmin
  .from("fun_tasks")
  .select("id")
  .eq("is_active", true);

if (taskErr) {
  console.error("❌ fun_tasks read error:", taskErr.message);
} else if (tasks && tasks.length > 0) {
  const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

  const { error: taskUpdateErr } = await supabaseAdmin
    .from("purchases")
    .update({ fun_task_id: randomTask.id })
    .eq("stripe_session_id", session.id);

  if (taskUpdateErr) {
    console.error(
      "❌ fun_task assignment error:",
      taskUpdateErr.message
    );
  }
}

      // 🔄 Recalculate cagnotte_total (source of truth)
      const { data: paidRows, error: sumErr } = await supabaseAdmin
        .from("purchases")
        .select("support_amount")
        .eq("collection_id", collectionId)
        .eq("status", "paid");

      if (sumErr) {
        console.error("❌ cagnotte sum error:", sumErr.message);
        return res.status(200).json({ received: true });
      }

      const trueTotal = (paidRows || []).reduce(
        (acc, r) => acc + Number(r.support_amount || 0),
        0
      );

      await supabaseAdmin
        .from("collections")
        .update({ cagnotte_total: trueTotal })
        .eq("id", collectionId);

      // 🎓 Lottery eligibility — STUDENTS ONLY
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
        .select("is_student")
        .eq("id", userId)
        .single();

      if (profErr) {
        console.error("❌ profile read error:", profErr.message);
        return res.status(200).json({ received: true });
      }

      if (prof?.is_student === true) {
        await supabaseAdmin
          .from("lottery_tickets")
          .upsert(
            { collection_id: collectionId, user_id: userId },
            { onConflict: "collection_id,user_id" }
          );

        await supabaseAdmin
          .from("purchases")
          .update({
            is_student: true,
            eligible_for_lottery: true,
          })
          .eq("stripe_session_id", session.id);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler crash:", err);
    return res.status(200).json({ received: true });
  }
}
