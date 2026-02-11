import { motion } from "framer-motion";
import Link from "next/link";

export default function Trust() {
  return (
    <div className="relative min-h-screen bg-[#070B18] text-white overflow-hidden">

      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-32 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-20">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Trust & Transparency
          </h1>

          <p className="text-white/70 text-lg max-w-2xl">
            BearTask is built for students, with clarity and fairness at its core.
            Here’s how things work behind the scenes.
          </p>
        </motion.div>

        <div className="space-y-10">

          {/* Section */}
          <GlassSection
            title="🧩 Digital Collectibles"
            text="Collectible art on BearTask represents participation in the community. It unlocks experiences, fun tasks, and moments — not financial promises."
          />

          <GlassSection
            title="💰 Transparent Payments"
            text="When purchases exist, funds are processed securely through Stripe. Platform fees are handled automatically, and community splits are defined clearly in the system."
          />

          <GlassSection
            title="🎯 Fair Participation"
            text="Every verified student has equal access to activities. No hidden boosts. No secret advantages. Participation is always optional and community-driven."
          />

          <GlassSection
            title="⚠️ Important Notes"
            text="BearTask is not an investment platform. Digital collectibles are for fun, creativity, and community culture only."
          />

          <GlassSection
            title="🤝 Community Standards"
            text="We expect respect, creativity, and good energy. This is a student-first space built on positive campus culture."
          />

        </div>

        <div className="mt-16 text-center">
          <Link
            href="/about"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-3 rounded-xl transition shadow-lg"
          >
            Learn more about BearTask →
          </Link>
        </div>

      </div>
    </div>
  );
}

function GlassSection({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 transition duration-300">
      <h2 className="text-2xl font-semibold text-amber-400 mb-4">
        {title}
      </h2>
      <p className="text-white/75 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
