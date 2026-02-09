import Link from "next/link";
import { motion } from "framer-motion";

export default function BearTaskActivity() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">
            🐻 BearTask Challenges
          </h1>
          <p className="text-white/70 max-w-xl">
            Join community trends, do fun things, and make memories together.
          </p>
        </motion.div>

        {/* Bear Sign Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col hover:border-amber-400/40 transition max-w-xl"
        >
          <span className="text-xs uppercase tracking-wide text-amber-300 mb-3">
            🔥 Trending
          </span>

          <h3 className="text-2xl font-semibold mb-3">
            🐻 Bear Sign Selfie
          </h3>

          <p className="text-sm text-white/70 mb-6">
           
          Upload a selfie of you doing the bear sign, and be part of the trend.
          </p>

          <div className="text-sm text-white/60 mb-6">
            📸 Photo upload only <br />
            👥 Students participating
          </div>

          <Link
            href="/activities/beartask/bear-sign"
            className="mt-auto bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-3 rounded-xl text-center"
          >
            Join the trend
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
