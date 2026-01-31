import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col items-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">About BearTask 🐻</h1>

        <p className="text-white/90 mb-8 leading-relaxed">
          <strong>BearTask</strong> is a campus-first community where digital art
          unlocks fun challenges, shared moments, and inside jokes.
          It’s less about buying, but more about being part of something.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎯 Our Mission
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          To create a fun, fair, and student-powered space where creativity,
          community, and campus culture come together.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🌱 Our Vision
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          A future where students connect through shared experiences,
          not pressure, hype, or speculation.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💬 What We Stand For
        </h2>
        <ul className="text-left list-disc list-inside text-white/90 mb-10 space-y-2">
          <li> students and verified participants.</li>
          <li>Clear rules and transparent systems.</li>
          <li>Fun first; always optional.</li>
          <li>Respectful, community-driven interaction.</li>
        </ul>

        <p className="text-white/80 mb-6">
          BearTask is about moments, memories, and campus energy —
          not promises or guarantees.
        </p>

        <Link
          href="/trust"
          className="inline-block bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-2 rounded-lg transition"
        >
          Visit the Trust Center →
        </Link>
      </motion.div>
    </div>
  );
}
