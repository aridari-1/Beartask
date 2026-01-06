import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // ✅ COOKIE-BASED AUTH
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { payoutId } = req.body;

  if (!payoutId) {
    return res.status(400).json({ error: "Missing payoutId" });
  }

  // 🔒 Load payout (authoritative)
  const { data: payout, error: payoutErr } = await supabaseAdmin
    .from("payouts")
    .select("*")
    .eq("id", payoutId)
    .single();

  if (payoutErr || !payout) {
    return res.status(404).json({ error: "Payout not found" });
  }

  // 🔐 Ownership check
  if (payout.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // ⛔ Prevent duplicate or invalid requests
  if (payout.status !== "pending") {
    return res
      .status(400)
      .json({ error: "Payout already requested or processed" });
  }

  // 🔎 Ensure Stripe account is connected (LIVE REQUIREMENT)
  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profErr || !profile?.stripe_account_id) {
    return res.status(400).json({
      error: "Stripe account not connected",
    });
  }

  // ✅ Update status
  const { error: updateErr } = await supabaseAdmin
    .from("payouts")
    .update({ status: "requested" })
    .eq("id", payoutId);

  if (updateErr) {
    return res.status(500).json({ error: updateErr.message });
  }

  return res.status(200).json({ ok: true });
}
