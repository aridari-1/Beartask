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
          BearTask is built on transparency, fairness, and responsible student
          support. This page explains how the platform works and what users can
          expect.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎓 Verified Students & Ambassadors
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Student contributors and ambassadors are verified using approved
          academic email addresses.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🧩 Digital Collections & Support
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Supporting a collection grants access to a curated digital item while
          contributing to student financial support initiatives.
        </p>

        {/* ✅ ADDED: FAIR LOTTERY RULES */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎟️ Lottery Rules
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-2">
          <li>Each student receives <strong>one equal lottery entry per collection</strong>.</li>
          <li>Purchasing multiple items does not increase winning chances.</li>
          <li>Lottery winners are selected automatically by a secure system once a collection sells out.</li>
          <li>Only verified students are eligible for lottery rewards.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          ⚠️ Important Notice
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-2">
          <li>Supporting a collection does not guarantee financial returns.</li>
          <li>Digital items are not investments or financial instruments.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🤝 Community Standards
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Participation must remain respectful, and appropriate.
        </p>

        <div className="text-center">
          <Link
            href="/about"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-2 rounded-lg transition"
          >
            Learn About BearTask →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
