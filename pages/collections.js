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
        .in("status", ["active", "sold_out"])
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

  const daysLeft = (end_date, status) => {
    if (status === "sold_out") return "Completed";
    if (!end_date) return "—";
    const end = new Date(end_date).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ending today";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Support students. Receive a digital collectible.
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            Every open collection supports a student. When a collection
            sells out, one student is selected automatically through a fair
            lottery.
          </p>
        </motion.div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-amber-300">
            Open Collections
          </h2>
          <Link
            href="/trust-center"
            className="text-sm text-white/80 hover:text-white underline"
          >
            How winners are chosen
          </Link>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-16 text-white/80">
            Loading collections…
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16 text-white/80">
            No collections are open right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => {
              const { total, sold, pct } = getProgress(c);
              const isSoldOut = c.status === "sold_out";

              return (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -4 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/15 shadow-xl flex flex-col"
                >
                  {/* Cover */}
                  <div className="relative h-44 w-full bg-white/10">
                    {c.cover_image_url ? (
                      <img
                        src={c.cover_image_url}
                        alt={c.title}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="h-44 flex items-center justify-center text-white/50 text-sm">
                        Collection cover
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          isSoldOut
                            ? "bg-gray-800 text-gray-300"
                            : "bg-amber-400 text-purple-900"
                        }`}
                      >
                        {isSoldOut ? "Sold out" : "Open"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-1">{c.title}</h3>
                    <p className="text-sm text-white/80 mb-4 line-clamp-2">
                      {c.description ||
                        "Support students through this curated digital collection."}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
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

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-white/75 mb-5">
                      <span>{daysLeft(c.end_date, c.status)}</span>
                      <span className="text-amber-300 font-semibold">
                        From $5
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto flex gap-3">
                      {isSoldOut ? (
                        <button
                          disabled
                          className="flex-1 bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-xl cursor-not-allowed"
                        >
                          Collection completed
                        </button>
                      ) : (
                        <Link
                          href={`/collections/${c.id}`}
                          className="flex-1 bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-4 py-2 rounded-xl text-center transition"
                        >
                          Support this collection
                        </Link>
                      )}
                      <Link
                        href={`/collections/${c.id}`}
                        className="text-sm text-white/80 hover:text-white underline self-center"
                      >
                        Details
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
