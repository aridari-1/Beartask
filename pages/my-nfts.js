import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function MyNFTs() {
  const [loading, setLoading] = useState(true);
  const [nfts, setNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

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

      const { data, error } = await supabase
        .from("collect_art_nfts")
        .select(`
          id,
          image_url,
          claimed_at
        `)
        .eq("claimed_by", user.id)
        .order("claimed_at", { ascending: false });

      if (error) {
        console.error("Error loading NFTs:", error);
        setLoading(false);
        return;
      }

      setNFTs(data || []);
      setLoading(false);
    };

    loadNFTs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading your collection…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#111827] to-[#020617] p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">My NFTs</h1>

        {nfts.length === 0 && (
          <p className="text-white/60">
            You haven’t collected any NFTs yet.
          </p>
        )}

        {/* NFT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer"
              onClick={() => setSelectedNFT(nft)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={nft.image_url}
                  alt="Collect Art NFT"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3">
                <h2 className="text-sm font-medium truncate">
                  Collect Art NFT
                </h2>

                <p className="text-xs text-white/50 mt-1">
                  BearTask Collection
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULL VIEW MODAL */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={selectedNFT.image_url}
                  alt="Collect Art NFT"
                  className="w-full h-auto object-contain bg-black"
                />
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-lg font-semibold">
                  Collect Art NFT
                </h2>

                <p className="text-sm text-white/60 mt-1">
                  Collected on{" "}
                  {new Date(
                    selectedNFT.claimed_at
                  ).toLocaleDateString()}
                </p>

                <button
                  onClick={() => setSelectedNFT(null)}
                  className="mt-4 text-sm text-white/60 hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
