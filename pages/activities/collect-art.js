import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CollectArt() {
  const [loading, setLoading] = useState(false);

  async function handleCollect() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please sign in first");
        return;
      }

      const res = await fetch("/api/create-collectible-checkout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // simple placeholders for locked preview
  const previewNFTs = Array.from({ length: 12 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#2A0E61] to-[#3A0CA3] text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-3">🎨 Collect Art</h1>
          <p className="text-white/80 max-w-xl">
            Unlock a unique BearTask digital artwork.
            <br />$1 · Yours forever.
          </p>
        </motion.div>

        {/* HOW IT WORKS */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            "Pay $1 to collect",
            "Receive a unique NFT",
            "See it in My NFTs",
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white/10 border border-white/20 rounded-2xl p-5 text-sm"
            >
              <span className="block text-amber-400 font-semibold mb-2">
                Step {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        {/* NFT PREVIEW GRID */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-4">
            Available artworks
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {previewNFTs.map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/10 border border-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center text-xs text-white/70">
                  Unlock to reveal
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleCollect}
            disabled={loading}
            className={`w-full font-bold py-4 rounded-2xl transition
              ${loading
                ? "bg-white/30 cursor-not-allowed"
                : "bg-amber-400 hover:bg-amber-500 text-purple-900"
              }`}
          >
            {loading ? "Redirecting…" : "Collect & Get NFT · $1"}
          </button>

          <p className="text-xs text-white/60 text-center mt-3">
            One NFT per payment · Unlimited collects · Just for fun
          </p>
        </div>

        {/* BACK */}
        <div className="text-center mt-10">
          <Link
            href="/community"
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to community
          </Link>
        </div>
      </div>
    </div>
  );
}
