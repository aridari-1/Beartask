import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function NFTReveal() {
  const router = useRouter();
  const { id } = router.query;

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const loadNFT = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace("/create-profile");
        return;
      }

      const { data, error } = await supabase
        .from("user_nfts")
        .select("id, title, image_url, nft_type")
        .eq("id", id)
        .eq("user_id", auth.user.id)
        .single();

      if (error || !data) {
        router.replace("/community");
        return;
      }

      setNft(data);
      setLoading(false);

      // ⏳ Auto-redirect after reveal
      setTimeout(() => {
        router.replace("/community");
      }, 6000);
    };

    loadNFT();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Revealing your NFT…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center p-6 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-bold mb-4">
          🎉 Your BearTask NFT
        </h1>

        <div className="rounded-2xl overflow-hidden mb-4 shadow-xl">
          <img
            src={nft.image_url}
            alt={nft.title}
            className="w-full object-cover"
          />
        </div>

        <p className="text-white/80 mb-6">
          {nft.title}
        </p>

        <button
          onClick={() => router.push("/community")}
          className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-bold py-3 rounded-xl transition"
        >
          Enter the community
        </button>

        <p className="text-xs text-white/50 mt-4">
          Redirecting automatically…
        </p>
      </motion.div>
    </div>
  );
}
