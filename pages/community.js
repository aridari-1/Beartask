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
    <div className="relative min-h-screen bg-[#070B18] text-white overflow-hidden">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-32 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            The BearTask Community 🐻
          </h1>

          <p className="text-white/70 max-w-2xl text-lg">
            Trends, digital art, student posts, and smart tools — all in one place.
            Built for students. Built for fun.
          </p>

          {!user && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-amber-300">
              👀 You’re browsing as a guest. Sign in to participate.
            </div>
          )}
        </motion.div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {ACTIVITIES.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 overflow-hidden transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-white/10 to-transparent" />

              {/* Tag */}
              <span className="text-xs uppercase tracking-wider text-amber-400">
                {a.tag}
              </span>

              {/* Title */}
              <h3 className="text-2xl font-semibold mt-3 mb-3 flex items-center">
                {a.title}
                {a.badge && (
                  <span className="ml-3 text-xs bg-amber-400 text-purple-900 px-2 py-1 rounded-full font-bold">
                    {a.badge}
                  </span>
                )}
              </h3>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed mb-10">
                {a.description}
              </p>

              {/* Button */}
              <button
                onClick={() => handleEnter(a.href)}
                className="mt-auto w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
              >
                Enter Activity
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
