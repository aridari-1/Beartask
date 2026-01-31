import { motion } from "framer-motion";
import Link from "next/link";

export default function Trust() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col items-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-4xl font-bold mb-4 text-center">
          BearTask Trust Center
        </h1>

        <p className="text-white/90 mb-6 text-center">
          BearTask is designed to be simple, fair, and community-first.
          This page explains how things work. 
        </p>


        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🧩 Digital Collections
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Each collection is a creative, limited digital drop.
          Collecting is about participation and community —
          not financial guarantees.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎟️ Fair Lottery System
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-2">
          <li>Each verified student gets <strong>one equal chance</strong>.</li>
          <li>Collecting multiple items does not increase odds.</li>
          <li>Winners are selected automatically when a collection ends.</li>
          <li>Only verified students are eligible.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          ⚠️ Important Notes
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-2">
          <li>Collections are not investments.</li>
          <li>Participation does not guarantee financial returns.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🤝 Community Standards
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          BearTask is about respect, creativity, and good vibes.
          We expect everyone to treat the community the same way.
        </p>

        <div className="text-center">
          <Link
            href="/about"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-2 rounded-lg transition"
          >
            Learn More About BearTask →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
