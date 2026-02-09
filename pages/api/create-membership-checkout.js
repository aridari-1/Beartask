import Stripe from "stripe";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    /* ------------------------------------------------------------
       1️⃣ Authenticate user (via Supabase JWT)
       ------------------------------------------------------------ */
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    /* ------------------------------------------------------------
       2️⃣ Check membership state
       ------------------------------------------------------------ */
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("has_joined")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: "Profile lookup failed" });
    }

    if (profile?.has_joined) {
      return res
        .status(400)
        .json({ error: "User already joined the community" });
    }

    /* ------------------------------------------------------------
       3️⃣ Create Stripe checkout session ($1 membership)
       ------------------------------------------------------------ */
    const origin =
      req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100, // $1.00
            product_data: {
              name: "BearTask Community Membership",
              description:
                "Unlock fun activities, digital art, gifts, and community experiences.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "membership",
        user_id: user.id,
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/join`,
    });

    /* ------------------------------------------------------------
       4️⃣ Return Stripe redirect URL
       ------------------------------------------------------------ */
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Membership checkout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
