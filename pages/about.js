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
          <strong>BearTask</strong> is a local help platform powered by verified
          college students. It connects people who need quick assistance with
          reliable, trusted student helpers who are ready to lend a hand. from
          home help and errands to academic support and tutoring.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎯 Our Mission
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          To make everyday life easier by connecting communities with verified students. BearTask bridges the gap between
          those who need help and those willing to help, creating value for
          everyone.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🌱 Our Vision
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          We aim to build a network where local people can rely on college
          students for real-world assistance; from everyday chores to learning
          support. BearTask envisions a future where students grow through
          experience while making a positive impact in their communities.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💬 Our Promise
        </h2>
        <ul className="text-left list-disc list-inside text-white/90 mb-10 space-y-2">
          <li>
            Verified student performers to ensure safety, reliability, and
            authenticity.
          </li>
          <li>
            Transparent, fair pricing for every task. No overcharging, no
            underpaying.
          </li>
          <li>
            Respectful communication at every step of the
            process.
          </li>
          <li>
            Real-world opportunities for students to earn, learn, and contribute
            meaningfully.
          </li>
        </ul>

        <p className="text-white/80 mb-6">
          BearTask isn’t just about tasks, it’s about connecting people,
          building trust, and creating opportunities through simple acts of help
          and collaboration.
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
