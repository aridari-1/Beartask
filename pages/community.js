import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

const ACTIVITIES = [
  {
    id: "beartask",
    title: "🐻 BearTask",
    description: "Complete fun, real-life challenges with other students.",
    tag: "Fun Tasks",
    href: "/activities/beartask",
  },
  {
    id: "collect-art",
    title: "🎨 Collect Art",
    description: "Explore unique BearTask digital art made by the community.",
    tag: "Collect",
    href: "/activities/collect-art",
  },
  {
    id: "chat",
    title: "💬 Collect Chat",
    description: "Post thoughts, jokes, and moments — student-only.",
    tag: "Social",
    href: "/activities/chat",
  },
  {
    id: "ai-explain",
    title: "🧠 Bear AI",
    description: "Get friendly explanations for tough college concepts.",
    tag: "AI Tool",
    href: "/activities/ai/explain",
    badge: "NEW",
  },
  {
    id: "gifts",
    title: "🎁 Gifts",
    description: "Surprises and rewards just for being part of the community.",
    tag: "Gifts",
    href: "/activities/gifts",
  },
];

export default function Community() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  const handleEnter = (href) => {
    if (!user) {
      localStorage.setItem("beartask_return_url", href);
      window.location.href = "/login";
      return;
    }
    window.location.href = href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">
            What’s happening in the BearTask community 🐻
          </h1>
          <p className="text-white/70 max-w-xl">
            Explore activities, trends, and tools built by students — just for fun.
          </p>

          {!user && (
            <p className="mt-4 text-amber-300 text-sm">
              👀 You’re exploring as a guest. Sign in to join activities.
            </p>
          )}
        </motion.div>

        {/* Activities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {ACTIVITIES.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col"
            >
              <span className="text-xs uppercase tracking-wide text-amber-300 mb-3">
                {a.tag}
              </span>

              <h3 className="text-2xl font-semibold mb-3">
                {a.title}
                {a.badge && (
                  <span className="ml-2 text-xs bg-amber-400 text-purple-900 px-2 py-1 rounded-full">
                    {a.badge}
                  </span>
                )}
              </h3>

              <p className="text-sm text-white/70 mb-8">
                {a.description}
              </p>

              <button
                onClick={() => handleEnter(a.href)}
                className="mt-auto bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-3 rounded-xl transition"
              >
                Enter
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
