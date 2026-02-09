import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1️⃣ Authenticate user
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const { data: auth } = await supabaseAdmin.auth.getUser(token);
    if (!auth?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2️⃣ Create $1 checkout (NO NFT KEY)
    const origin = req.headers.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100,
            product_data: {
              name: "Collect Art · BearTask",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "collect_art",
        user_id: auth.user.id,
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/community`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
