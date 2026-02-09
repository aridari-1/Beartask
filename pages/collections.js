import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);

      const { data, error } = await supabase
        .from("collections")
        .select("*, items(is_sold)")
        .in("status", ["active", "sold_out"])
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setCollections(data || []);
      setLoading(false);
    };

    loadCollections();
  }, []);

  const getStats = (c) => {
    const total = (c.items || []).length;
    const joined = (c.items || []).filter((x) => x.is_sold).length;
    return { total, joined };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] to-[#3A0CA3]">
      {/* ================= HERO ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-14 text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            What’s happening in the <br /> BearTask community 🐻
          </h1>

          <p className="mt-5 text-lg text-white/80">
            Fun activities, collectible NFT memories, digital art, and surprises.
            Join for $1. No pressure. Just vibes.
          </p>

          <div className="mt-6 text-sm text-white/60">
            🎉 Fun-first · 🖼️ Collect memories · 🎁 Community powered
          </div>
        </motion.div>
      </div>

      {/* ================= ACTIVITY GRID ================= */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-20 text-white/70">
            Loading community activities…
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 text-white/70">
            {!isLoggedIn ? (
              <>
                <p className="mb-3 text-lg font-semibold">
                  Sign in to see what’s happening
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 rounded-xl bg-amber-400 text-purple-900 font-semibold"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <p>No activities yet — be the first to start one.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => {
              const { joined } = getStats(c);
              const isEnded = c.status === "sold_out";

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 border border-white/20 rounded-3xl p-6 flex flex-col hover:scale-[1.02] transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-200">
                      🎉 Community Activity
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        isEnded
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {isEnded ? "Ended" : "Happening now"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2">
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">
                    {c.description ||
                      "A fun community experience. Join in and collect a memory."}
                  </p>

                  {/* Meta */}
                  <div className="text-sm text-white/60 mb-5">
                    👥 {joined} people joined <br />
                    🎁 NFT memory unlocked
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/collections/${c.id}`}
                    className="mt-auto text-center py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold transition"
                  >
                    {isEnded ? "See what happened" : "Join the fun · $1"}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
