import Stripe from "stripe";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // ✅ Correct way to get user in redirect-based API routes
  const supabase = createServerSupabaseClient({ req, res });

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("stripe_account_id, email")
      .eq("id", user.id)
      .single();

    if (profErr) {
      return res.status(500).json({ error: profErr.message });
    }

    let accountId = profile.stripe_account_id;

    // 🧾 Create Stripe Express account if missing
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        business_type: "individual",
        email: profile.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });

      accountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    // 🔗 Create onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payouts/claim`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payouts/claim`,
      type: "account_onboarding",
    });

    // 🔁 Redirect user to Stripe onboarding
    return res.redirect(link.url);
  } catch (err) {
    console.error("Stripe connect error:", err);
    return res.status(500).json({
      error: "Stripe onboarding failed",
    });
  }
}
