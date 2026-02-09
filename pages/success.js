import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

export default function Success() {
  const router = useRouter();
  const triesRef = useRef(0);

  const [status, setStatus] = useState("Finalizing your collection…");
  const [nft, setNft] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;
      triesRef.current += 1;

      // 1️⃣ Must be authenticated
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.replace("/create-profile");
        return;
      }

      setStatus("Unlocking your artwork…");

      // 2️⃣ Try to fetch the most recent collected NFT
      const { data: latestNFT } = await supabase
        .from("collect_art_nfts")
        .select("image_url, claimed_at")
        .eq("claimed_by", user.id)
        .order("claimed_at", { ascending: false })
        .limit(1)
        .single();

      if (latestNFT) {
        setNft(latestNFT);

        // Reveal after short pause
        setTimeout(() => setRevealed(true), 900);
        return;
      }

      // 3️⃣ Retry while webhook finishes
      if (triesRef.current < 20) {
        setTimeout(check, 1200);
      } else {
        setStatus(
          "Still processing. You can continue to the community and your NFT will appear shortly."
        );
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#111827] to-[#020617] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* HEADER */}
        <h1 className="text-3xl font-semibold mb-2">
          Welcome to BearTask
        </h1>
        <p className="text-white/60 mb-10">
          {nft ? "This artwork is now yours." : status}
        </p>

        {/* NFT REVEAL */}
        <div className="relative w-72 h-72 mx-auto mb-10">
          <AnimatePresence>
            {!revealed && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <span className="text-sm text-white/60">
                  Preparing your NFT…
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {nft && (
            <motion.img
              src={nft.image_url}
              alt="Your collected NFT"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{
                opacity: revealed ? 1 : 0,
                scale: revealed ? 1 : 0.92,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
            />
          )}
        </div>

        {/* ACTIONS */}
        {revealed && (
          <div className="space-y-4">
            <button
              onClick={() => router.push("/my-nfts")}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-3 rounded-xl transition"
            >
              View My NFTs
            </button>

            <button
              onClick={() => router.push("/activities/collect-art")}
              className="w-full border border-white/20 hover:bg-white/5 text-white py-3 rounded-xl transition"
            >
              Collect another artwork
            </button>

            <button
              onClick={() => router.push("/community")}
              className="block mx-auto text-sm text-white/60 hover:text-white mt-2"
            >
              Continue to community →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
