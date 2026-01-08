import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function MyNFTs() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 🔒 EXISTING LOGIC (UNCHANGED)
      // Only PAID purchases represent real NFTs
      const { data: purchases, error } = await supabase
        .from("purchases")
        .select(`
          id,
          created_at,
          items (
            id,
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

      if (error) {
        console.error("Load NFTs error:", error);
      }

      // 🆕 ADD: Ambassador Gift NFTs
      const { data: gifts, error: giftError } = await supabase
        .from("ambassador_gifts")
        .select(`
          id,
          received_at,
          nft_url,
          gift:ambassador_gift_items (
            title
          ),
          collections (
            title
          )
        `)
        .eq("ambassador_id", user.id)
        .order("received_at", { ascending: false });

      if (giftError) {
        console.error("Load gift NFTs error:", giftError);
      }

      // 🔗 Normalize gifts to match existing NFT shape
      const normalizedGifts = (gifts || []).map((g) => ({
        id: `gift-${g.id}`, // avoid key collision
        created_at: g.received_at,
        items: {
  title: g.gift?.title || "Legendary Ambassador NFT",
  media_url: g.gift?.nft_url || g.nft_url,
},

        collections: {
          title: g.collections?.title || "Ambassador Reward",
        },
      }));

      // 🔗 Merge (no logic removed)
      const merged = [...(purchases || []), ...normalizedGifts].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setNfts(merged);
      setLoading(false);
    };

    loadNFTs();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading your NFTs…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">My NFTs</h1>

      {nfts.length === 0 ? (
        <p className="text-white/80">
          You don’t own any NFTs yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() =>
                alert(
                  `NFT: ${nft.items?.title}\nCollection: ${nft.collections?.title}`
                )
              }
            >
              <div className="h-56 bg-white/5 flex items-center justify-center">
                {nft.items?.media_url ? (
                  <img
                    src={nft.items.media_url}
                    alt={nft.items.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <span className="text-white/60">
                    No image
                  </span>
                )}
              </div>

              <div className="p-4">
                <h2 className="font-semibold text-lg">
                  {nft.items?.title}
                </h2>

                <p className="text-sm text-white/70">
                  {nft.collections?.title}
                </p>

                <p className="text-xs text-white/50 mt-1">
                  Acquired on{" "}
                  {new Date(nft.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
