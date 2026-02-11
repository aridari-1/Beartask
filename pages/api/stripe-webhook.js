import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

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
    console.error("❌ Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.user_id;

      if (!userId) {
        console.error("❌ Missing user_id in Stripe metadata");
        return res.status(200).json({ received: true });
      }

      /* ======================================================
         💳 INSERT PAYMENT (SOURCE OF TRUTH)
         ====================================================== */
      const { error } = await supabaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          amount_cents: session.amount_total,
          currency: session.currency,
          status: "paid",
          paid_at: new Date(),
        });

      // Stripe retries webhooks → ignore duplicates safely
      if (error && !error.message.includes("duplicate")) {
        console.error("❌ Failed to insert payment:", error);
        throw error;
      }

      console.log("✅ Payment recorded for user:", userId);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
