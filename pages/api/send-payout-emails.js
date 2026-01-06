import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔐 Inline admin check (no external file)
async function requireAdmin(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return { error: "Missing authorization token" };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: "Invalid token" };

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();

  if (profErr || !profile?.is_admin) {
    return { error: "Admin access required" };
  }

  return { user: data.user };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // 🔐 Admin-only
  const admin = await requireAdmin(req);
  if (admin.error) {
    return res.status(403).json({ error: admin.error });
  }

  try {
    const { collectionId } = req.body;

    if (!collectionId) {
      return res.status(400).json({ error: "Missing collectionId" });
    }

    // 1️⃣ Load collection
    const { data: collection, error: colErr } = await supabaseAdmin
      .from("collections")
      .select(`
        id,
        title,
        status,
        lottery_drawn,
        lottery_winner_id,
        opened_by,
        creator_id,
        notification_sent
      `)
      .eq("id", collectionId)
      .single();

    if (colErr || !collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.status !== "sold_out" || collection.lottery_drawn !== true) {
      return res.status(400).json({
        error: "Collection not finalized or lottery not drawn",
      });
    }

    if (collection.notification_sent === true) {
      return res.status(400).json({
        error: "Payout notification emails already sent",
      });
    }

    // 2️⃣ Winner
    const { data: winner } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", collection.lottery_winner_id)
      .single();

    // 3️⃣ Ambassador
    const { data: ambassador } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", collection.opened_by)
      .single();

    // 4️⃣ Creator
    const { data: creator } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", collection.creator_id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 🎉 Winner email
    await resend.emails.send({
      from: "BearTask <support@beartask.org>",
      to: winner.email,
      subject: "🎉 You won the BearTask lottery!",
      html: `
        <p>Congratulations!</p>
        <p>You won the lottery for <strong>${collection.title}</strong>.</p>
        <p>
          <a href="${baseUrl}/payouts/claim?collection=${collection.id}">
            Claim your payout
          </a>
        </p>
      `,
    });

    // 🤝 Ambassador email
    await resend.emails.send({
      from: "BearTask <support@beartask.org>",
      to: ambassador.email,
      subject: "💰 Ambassador payout ready",
      html: `
        <p>Your ambassador commission for <strong>${collection.title}</strong> is ready.</p>
        <p>
          <a href="${baseUrl}/payouts/claim?collection=${collection.id}">
            Claim your payout
          </a>
        </p>
      `,
    });

    // 🧑‍💼 Creator email
    await resend.emails.send({
      from: "BearTask <support@beartask.org>",
      to: creator.email,
      subject: "💰 Creator payout ready",
      html: `
        <p>Your creator share for <strong>${collection.title}</strong> is ready.</p>
        <p>
          <a href="${baseUrl}/payouts/claim?collection=${collection.id}">
            Claim your payout
          </a>
        </p>
      `,
    });

    // ✅ Mark notifications as sent
    await supabaseAdmin
      .from("collections")
      .update({ notification_sent: true })
      .eq("id", collection.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-payout-emails error:", err);
    return res.status(500).json({ error: "Failed to send payout emails" });
  }
}
