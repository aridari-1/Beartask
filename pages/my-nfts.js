import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MyNFTs() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      /* ---------------- Ambassador Gifts ---------------- */

      const { data: gifts, error: giftError } = await supabase
        .from("ambassador_gifts")
        .select(`
          id,
          received_at,
          nft_url,
          gift: ambassador_gift_items (
            title,
            nft_url
          ),
          collections (
            title
          )
        `)
        .eq("ambassador_id", user.id)
        .order("received_at", { ascending: false });

      if (giftError) {
        console.error("Gift error:", giftError);
      }

      const normalizedGifts = (gifts || []).map((g) => ({
        id: `gift-${g.id}`,
        created_at: g.received_at,
        items: {
          title: g.gift?.title || "Legendary Ambassador NFT",
          media_url: g.gift?.nft_url || g.nft_url,
        },
        collections: {
          title: g.collections?.title || "Ambassador Reward",
        },
      }));

      /* ---------------- Purchased NFTs (FIXED) ---------------- */

      const { data: purchases, error: purchaseError } = await supabase
        .from("purchases")
        .select(`
          id,
          created_at,
          items (
            title,
            media_url
          ),
          collections (
            title
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (purchaseError) {
        console.error("Purchase error:", purchaseError);
      }

      const normalizedPurchases = (purchases || []).map((p) => ({
        id: `purchase-${p.id}`,
        created_at: p.created_at,
        items: {
          title: p.items?.title || "NFT",
          media_url: p.items?.media_url,
        },
        collections: {
          title: p.collections?.title || "Collection",
        },
      }));

      setItems([...normalizedGifts, ...normalizedPurchases]);
      setLoading(false);
    };

    loadNFTs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading NFTs…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">My NFTs</h1>

      {items.length === 0 && (
        <p className="text-white/70">You don’t own any NFTs yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((nft) => (
          <div
            key={nft.id}
            className="relative rounded-2xl bg-white/10 border border-white/20 overflow-hidden"
          >
            <div className="relative z-10 h-56 w-full overflow-hidden">
              <img
                src={nft.items.media_url}
                alt={nft.items.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold">
                {nft.items.title}
              </h2>
              <p className="text-sm text-white/70">
                {nft.collections.title}
              </p>
              <p className="text-xs text-white/50 mt-1">
                Acquired on{" "}
                {new Date(nft.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
