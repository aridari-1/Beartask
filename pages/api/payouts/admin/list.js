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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  const admin = await requireAdmin(req);
  if (admin.error) {
    return res.status(403).json({ error: admin.error });
  }

  const { data, error } = await supabaseAdmin
    .from("payouts")
    .select(`
      id,
      role,
      amount,
      status,
      created_at,
      user_id,
      collection_id,
      profiles!payouts_user_id_fkey (
        id,
        email,
        full_name
      ),
      collections!payouts_collection_id_fkey (
        id,
        title
      )
    `)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Admin payouts list error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ payouts: data || [] });
}
