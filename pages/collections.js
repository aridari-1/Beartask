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
      <div className="max-w-6xl mx-auto px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-secondary mt-2 max-w-2xl">
            Support student dreams by purchasing digital collectibles.  
            Each collection is limited and may reward one student when sold out.
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-amber-300">
            Active & Completed Collections
          </h2>
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
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 flex flex-col justify-between"
                >
                  {/* Header */}
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

                  {/* Progress */}
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

                  {/* Action */}
                  <Link
                    href={`/collections/${c.id}`}
                    className="button-primary text-center py-2 rounded-lg mt-auto"
                  >
                    View collection
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
