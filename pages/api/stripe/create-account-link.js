import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    // 1️⃣ Get logged-in user from Supabase Auth cookie
    const {
      data: { user },
      error: authErr,
    } = await supabaseAdmin.auth.getUser(req.headers.authorization?.replace("Bearer ", ""));

    if (authErr || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2️⃣ Fetch profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, stripe_account_id")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      return res.status(500).json({ error: profileErr.message });
    }

    let stripeAccountId = profile.stripe_account_id;

    // 3️⃣ Create Stripe Express account if missing
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: profile.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id);
    }

    // 4️⃣ Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payouts?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payouts?success=true`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe onboarding error:", err);
    return res.status(500).json({ error: "Stripe onboarding failed" });
  }
}
