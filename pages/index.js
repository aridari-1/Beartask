import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#2A0E61] to-black text-white">

      {/* ================= HERO ================= */}
      <section className="px-6 pt-32 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            A student community where
            <br />
            things actually happen 🐻
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-xl max-w-2xl mx-auto mb-10"
          >
            BearTask is a fun, creative space for students to join challenges,
            start trends, collect digital memories, and just enjoy being part
            of something together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link
              href="/community"
              className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-8 py-4 rounded-2xl transition"
            >
              See what’s happening
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= ACTIVITIES VISUAL ================= */}
      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto space-y-28">

          {/* BearTask */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <img
              src="/activities/beartask.png"
              alt="BearTask challenges"
              className="rounded-3xl w-full object-cover shadow-xl"
            />
            <div>
              <h3 className="text-2xl font-bold mb-4">
                🐻 BearTask Challenges
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Fun, real-life challenges created for students.
                Join trends, take simple selfies, or participate in community
                moments — no competition, just vibes.
              </p>
            </div>
          </div>

          {/* Collect Chat */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="md:order-2">
              <img
                src="/activities/collect-chat.png"
                alt="Collect Chat"
                className="rounded-3xl w-full object-cover shadow-xl"
              />
            </div>
            <div className="md:order-1">
              <h3 className="text-2xl font-bold mb-4">
                💬 Collect Chat
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                A tweet-style space where students post thoughts,
                jokes, and moments.
                Less noise, less pressure — just people being real.
              </p>
            </div>
          </div>

          {/* AI Tools */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <img
              src="/activities/ai-tools.png"
              alt="Student AI tools"
              className="rounded-3xl w-full object-cover shadow-xl"
            />
            <div>
              <h3 className="text-2xl font-bold mb-4">
                🧠 Student-Built AI Tools
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Friendly AI tools designed to explain hard concepts clearly
                and in the right context — made for real college struggles.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COLLECT ART (KEEP YOUR EXISTING SECTION) ================= */}
      {/* ⚠️ DO NOT CHANGE THIS PART IF IT ALREADY LOOKS GOOD */}
      {/* Your existing Collect Art section stays here */}

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 py-28 bg-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            How BearTask works
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-left">
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <h4 className="font-semibold mb-2">1. Explore freely</h4>
              <p className="text-white/70">
                See what the community is doing without signing up.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <h4 className="font-semibold mb-2">2. Join when ready</h4>
              <p className="text-white/70">
                Create an account only when you want to participate.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <h4 className="font-semibold mb-2">3. Have fun</h4>
              <p className="text-white/70">
                Join challenges, post, collect memories, and enjoy the vibe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to be part of it?
          </h2>
          <p className="text-white/70 text-lg mb-10">
            BearTask is open. Explore first. Join when it feels right.
          </p>

          <Link
            href="/community"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-10 py-4 rounded-2xl transition"
          >
            Enter the community
          </Link>
        </div>
      </section>

    </div>
  );
}
