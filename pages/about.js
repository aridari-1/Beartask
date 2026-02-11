import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
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
            About BearTask 🐻
          </h1>

          <p className="text-white/70 text-lg max-w-2xl">
            BearTask is a campus-first community built around fun,
            creativity, and student culture.
          </p>
        </motion.div>

        <div className="space-y-12">

          <GlassSection
            title="🎯 Our Mission"
            text="To create a fun, fair, and student-powered space where creativity, digital art, and campus energy connect."
          />

          <GlassSection
            title="🌱 Our Vision"
            text="A university experience where students connect through shared trends, challenges, and creative moments — not pressure or speculation."
          />

          <GlassSection
            title="💡 What Makes BearTask Different"
            text="We focus on participation, not hype. Community, not competition. Experiences, not promises."
          />

          <GlassSection
            title="💬 What We Stand For"
            text="Respectful interaction. Transparent systems. Optional participation. Student-first design."
          />

        </div>

        <div className="mt-16 text-center">
          <Link
            href="/trust"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-3 rounded-xl transition shadow-lg"
          >
            Visit the Trust Center →
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
