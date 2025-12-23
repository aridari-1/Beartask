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
          <strong>BearTask</strong> is a student-powered support platform that
          connects the public with verified college students through curated
          digital collections. By supporting these collections, individuals
          help students financially while receiving meaningful digital items in
          return.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎯 Our Mission
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          To empower college students financially by creating ethical,
          transparent ways for communities to support them through digital
          products and shared opportunities.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🌱 Our Vision
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          We envision a future where students are supported beyond traditional
          jobs — through creativity, community engagement, and responsible
          digital ownership.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💬 Our Commitment
        </h2>
        <ul className="text-left list-disc list-inside text-white/90 mb-10 space-y-2">
          <li>Verified student ambassadors and contributors.</li>
          <li>Transparent collection structures and clear participation rules.</li>
          <li>No misleading promises or hidden conditions.</li>
          <li>Respectful, ethical use of digital products.</li>
        </ul>

        <p className="text-white/80 mb-6">
          BearTask is about trust, creativity, and collective support — not
          speculation or financial guarantees.
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
