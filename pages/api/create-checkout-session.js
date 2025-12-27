import Stripe from "stripe";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getBearerToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { supportAmount, collectionId } = req.body || {};
    const amount = Number(supportAmount);

    if (![5, 8, 10, 15].includes(amount)) {
      return res.status(400).json({ error: "Invalid support amount" });
    }

    if (!collectionId) {
      return res.status(400).json({ error: "Missing collectionId" });
    }

    // 🔐 Authenticate user
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    const { data: userRes, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userRes?.user) {
      return res.status(401).json({ error: "Invalid user token" });
    }

    const user = userRes.user;

    // 🎯 Get first unsold item in collection
    const { data: item, error: itemErr } = await supabaseAdmin
      .from("items")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("is_sold", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (itemErr) {
      return res.status(500).json({ error: itemErr.message });
    }

    if (!item) {
      return res.status(400).json({ error: "Collection sold out" });
    }

    // 1️⃣ Create purchase FIRST
    const { data: purchase, error: purchaseErr } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        item_id: item.id,
        collection_id: collectionId,
        support_amount: amount,
        price: amount,
        status: "pending",
      })
      .select()
      .single();

    if (purchaseErr) {
      return res.status(500).json({ error: purchaseErr.message });
    }

    // 2️⃣ Create Stripe checkout session WITH purchase ID
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: {
              name: "BearTask Student Support",
              description:
                "Support students and receive a BearTask digital collectible.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        user_id: user.id,
        item_id: item.id,
        collection_id: collectionId,
        support_amount: String(amount),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?purchase_id=${purchase.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collectionId}`,
    });

    // 3️⃣ Store Stripe session ID
    await supabaseAdmin
      .from("purchases")
      .update({ stripe_session_id: session.id })
      .eq("id", purchase.id);

    // 4️⃣ Redirect user to Stripe
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
