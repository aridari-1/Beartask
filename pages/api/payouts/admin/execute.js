import Stripe from "stripe";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getBearerToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

async function requireAdmin(req) {
  const token = getBearerToken(req);
  if (!token) return { error: "Missing Bearer token" };

  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userRes?.user) return { error: "Invalid token" };

  const user = userRes.user;

  const { data: prof, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();

  if (profErr) return { error: profErr.message };
  if (!prof?.is_admin) return { error: "Admin only" };

  return { user };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const admin = await requireAdmin(req);
  if (admin.error) return res.status(403).json({ error: admin.error });

  try {
    const { payoutId } = req.body || {};
    if (!payoutId) return res.status(400).json({ error: "Missing payoutId" });

    // Load payout
    const { data: payout, error: payErr } = await supabaseAdmin
      .from("payouts")
      .select("id, user_id, collection_id, role, amount, status, stripe_transfer_id")
      .eq("id", payoutId)
      .single();

    if (payErr) return res.status(500).json({ error: payErr.message });
    if (!payout) return res.status(404).json({ error: "Payout not found" });

    // Anti-double-pay guard #1
    if (payout.status === "paid" || payout.stripe_transfer_id) {
      return res.status(200).json({ ok: true, message: "Already paid", payout });
    }

    if (payout.status !== "approved") {
      return res.status(400).json({ error: "Payout must be approved before execution." });
    }

    // Get receiver stripe_account_id
    const { data: prof, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, stripe_account_id")
      .eq("id", payout.user_id)
      .single();

    if (profErr) return res.status(500).json({ error: profErr.message });
    if (!prof?.stripe_account_id) {
      return res.status(400).json({ error: "User has not completed Stripe onboarding (missing stripe_account_id)." });
    }

    // Verify Stripe account is ready (live)
    const acct = await stripe.accounts.retrieve(prof.stripe_account_id);
    if (!acct.payouts_enabled) {
      return res.status(400).json({ error: "User Stripe account not payout-enabled yet. They must finish onboarding." });
    }

    // Amount in cents (Stripe requires integer)
    const cents = Math.round(Number(payout.amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      return res.status(400).json({ error: "Invalid payout amount." });
    }

    const transferGroup = `collection_${payout.collection_id}`;
    const idempotencyKey = `payout_${payout.id}`; // stable, prevents duplicates

    // Create transfer (money moves)
    const transfer = await stripe.transfers.create(
      {
        amount: cents,
        currency: "usd",
        destination: prof.stripe_account_id,
        transfer_group: transferGroup,
        metadata: {
          payout_id: payout.id,
          role: payout.role,
          collection_id: payout.collection_id,
          user_id: payout.user_id,
        },
      },
      { idempotencyKey }
    );

    // Mark payout paid
    const { data: updated, error: updErr } = await supabaseAdmin
      .from("payouts")
      .update({
        status: "paid",
        stripe_transfer_id: transfer.id,
        stripe_transfer_group: transferGroup,
        paid_at: new Date().toISOString(),
        error: null,
      })
      .eq("id", payout.id)
      .select()
      .single();

    if (updErr) {
      // Worst case: transfer succeeded but DB update failed -> idempotency protects retries
      console.error("DB update after transfer failed:", updErr);
      return res.status(500).json({ error: "Transfer succeeded, but DB update failed. Do not retry blindly; check Stripe transfers.", transfer });
    }

    // Optional: mark commission paid if ambassador
    if (payout.role === "ambassador") {
      await supabaseAdmin
        .from("ambassador_commissions")
        .update({ paid: true })
        .eq("collection_id", payout.collection_id)
        .eq("ambassador_id", payout.user_id);
    }

    return res.status(200).json({ ok: true, payout: updated, transfer });
  } catch (err) {
    console.error("execute payout error:", err);
    // Record failure if possible
    const { payoutId } = req.body || {};
    if (payoutId) {
      await supabaseAdmin
        .from("payouts")
        .update({ status: "failed", error: err.message })
        .eq("id", payoutId);
    }
    return res.status(500).json({ error: "Payout execution failed" });
  }
}
