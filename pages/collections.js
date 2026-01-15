import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, items(is_sold)")
        .in("status", ["active", "sold_out"])
        .order("created_at", { ascending: false });

      if (error) console.error("Load collections error:", error);
      setCollections(data || []);
      setLoading(false);
    };

    loadCollections();
  }, []);

  const getProgress = (c) => {
    const total = (c.items || []).length;
    const sold = (c.items || []).filter((x) => x.is_sold).length;
    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
    return { total, sold, pct };
  };

  const daysLeft = (end_date) => {
    if (!end_date) return null;
    const diff = new Date(end_date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen">

      {/* ================= FULL HERO ================= */}
      <div className="relative w-full h-[85vh] md:h-[85vh] overflow-hidden">

        {/* FULL IMAGE BACKGROUND */}
        <img
          src="/images/hero/ambassador-hero.png"
          alt="BearTask Ambassador"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* GRADIENT OVERLAY (STRONGER ON MOBILE) */}
        <div className="
          absolute inset-0
          bg-gradient-to-t md:bg-gradient-to-r
          from-purple-900/95 via-indigo-900/80 to-purple-700/60
        " />

        {/* HERO CONTENT */}
        <div className="
          relative z-10
          max-w-7xl mx-auto px-6
          h-full
          flex
          items-end md:items-center
        ">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              w-full md:max-w-2xl
              pb-10 md:pb-0
              text-center md:text-left
            "
          >
            <h1 className="
              text-4xl md:text-6xl
              font-extrabold
              text-white
              leading-tight
            ">
              Support Students <br className="hidden md:block" />
              Through Art
            </h1>

            <p className="
              mt-4 md:mt-6
              text-base md:text-xl
              text-white/85
            ">
              Every collection supports a student, rewards supporters with
              unique digital art, and gives one person a chance to win when the
              collection sells out.
            </p>

            <div className="
              mt-6 md:mt-8
              flex flex-col md:flex-row
              gap-4
              justify-center md:justify-start
            ">
              <a
                href="#collections"
                className="
                  px-8 py-4
                  rounded-xl
                  bg-gradient-to-r from-blue-500 to-indigo-500
                  text-white font-semibold
                  shadow-xl
                  hover:scale-[1.03]
                  transition
                "
              >
                Explore Collections
              </a>

              <Link
                href="/trust/winner-selection"
                className="
                  px-8 py-4
                  rounded-xl
                  border border-white/30
                  text-white font-medium
                  hover:bg-white/10
                  transition
                "
              >
                How the lottery works
              </Link>
            </div>

            <div className="mt-4 md:mt-6 text-sm text-white/70">
              🎓 Transparent • Student-powered • Real rewards
            </div>
          </motion.div>
        </div>
      </div>
      {/* ================================================= */}

      <div id="collections" className="max-w-6xl mx-auto px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold">Collections</h2>
          <p className="text-secondary mt-2 max-w-2xl">
            Support student dreams through art, community, and opportunity.
            Each collection is limited and may reward one supporter when sold out.
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-amber-300">
            Active & Completed Collections
          </h3>
          <Link
            href="/trust/winner-selection"
            className="text-sm text-white/80 hover:text-white underline"
          >
            How the winner is selected
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/70">
            Loading collections…
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16 text-white/60">
            No collections available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => {
              const { total, sold, pct } = getProgress(c);
              const left = daysLeft(c.end_date);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-white/5 backdrop-blur
                    p-5
                    flex flex-col justify-between
                    hover:scale-[1.02]
                    transition
                  "
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        c.status === "sold_out"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {c.status === "sold_out" ? "Sold out" : "Active"}
                    </span>
                  </div>

                  {c.description && (
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">
                      {c.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>{sold} / {total} sold</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 mt-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {left !== null && (
                      <div className="text-xs text-white/50 mt-2">
                        {left <= 0 ? "Ending soon" : `${left} day(s) left`}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/collections/${c.id}`}
                    className="button-primary text-center py-2 rounded-lg mt-auto"
                  >
                    View & Support
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
