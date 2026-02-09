import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* =========================================================
     ✅ PAYMENT COMPLETED
     ========================================================= */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.user_id;

    if (!userId) {
      console.error("❌ Missing user_id in metadata");
      return res.status(200).json({ received: true });
    }

    /* =========================================================
       🎨 COLLECT ART NFT LOGIC
       ========================================================= */
    if (metadata.type === "collect_art") {
      try {
        // 1️⃣ Select ONE unclaimed NFT
        const { data: nft, error: selectError } = await supabaseAdmin
          .from("collect_art_nfts")
          .select("id, image_url")
          .eq("is_claimed", false)
          .limit(1)
          .single();

        if (selectError || !nft) {
          console.error("❌ No unclaimed Collect Art NFTs left");
          return res.status(200).json({ received: true });
        }

        // 2️⃣ Claim NFT (atomic safety)
        const { error: updateError } = await supabaseAdmin
          .from("collect_art_nfts")
          .update({
            is_claimed: true,
            claimed_by: userId,
            claimed_at: new Date(),
          })
          .eq("id", nft.id)
          .eq("is_claimed", false);

        if (updateError) {
          throw updateError;
        }

        console.log("✅ Collect Art NFT assigned:", nft.id);
      } catch (err) {
        console.error("❌ Collect Art assignment failed:", err);
        return res.status(500).json({ error: "NFT assignment failed" });
      }
    }
  }

  return res.status(200).json({ received: true });
}
