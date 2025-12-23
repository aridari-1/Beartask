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
        .select("*")
        .or("status.eq.active,is_active.eq.true")
        .order("created_at", { ascending: false });

      if (error) console.error("Load collections error:", error);
      setCollections(data || []);
      setLoading(false);
    };

    loadCollections();
  }, []);

  const getProgress = (c) => {
    const total = c.total_items || 5;
    const sold = c.sold_items || 0;
    const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
    return { total, sold, pct };
  };

  const daysLeft = (end_date) => {
    if (!end_date) return "—";
    const end = new Date(end_date).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ended";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Support students. Receive a digital collectible.
          </h1>
          <p className="text-center text-white/85 max-w-2xl mx-auto mb-8">
            BearTask connects supporters and students through curated digital
            collections.
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-amber-300">
            Active Collections
          </h2>
          <Link
            href="/trust-center"
            className="text-sm text-white/80 hover:text-white underline"
          >
            How BearTask works
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/80">
            Loading collections...
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12 text-white/80">
            No active collections right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((c) => {
              const { total, sold, pct } = getProgress(c);
              return (
                <motion.div
                  key={c.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/15"
                  whileHover={{ y: -3 }}
                >
                  <div className="h-40 w-full bg-white/10">
                    {c.cover_image_url ? (
                      <img
                        src={c.cover_image_url}
                        alt={c.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="h-40 w-full flex items-center justify-center text-white/60 text-sm">
                        Cover image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <p className="text-sm text-white/80 mt-1 line-clamp-2">
                      {c.description || "Supporting students through this collection."}
                    </p>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                        <span>
                          {sold} of {total} supported
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-white/80">
                      <span>Ends in {daysLeft(c.end_date)}</span>
                      <span className="text-amber-300 font-semibold">
                        Support from $5
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/collections/${c.id}`}
                        className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-4 py-2 rounded-xl transition"
                      >
                        Support this collection
                      </Link>
                      <Link
                        href={`/collections/${c.id}`}
                        className="text-sm text-white/80 hover:text-white underline"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
