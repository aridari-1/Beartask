import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

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

  const { payoutId } = req.body || {};
  if (!payoutId) return res.status(400).json({ error: "Missing payoutId" });

  const { data, error } = await supabaseAdmin
    .from("payouts")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
    .eq("status", "pending_approval")
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(400).json({ error: "Payout not found or already approved/paid." });

  return res.status(200).json({ payout: data });
}
