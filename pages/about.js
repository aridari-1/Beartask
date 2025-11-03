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
          <strong>BearTask</strong> is a student-built platform designed to make
          college life simpler, safer, and more connected. We help students
          support one another through small, meaningful tasks from academic
          help and quick favors to campus life activities.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎯 Our Mission
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          To empower students to collaborate and help each other through a
          trusted, fair, and transparent task-sharing network. BearTask makes it
          easy to find help when you need it and to earn by offering your time,
          skills, or energy all within your own college community.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🌱 Our Vision
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          We imagine a future where students on every campus can depend on one
          another. Building a student-powered economy based on trust,
          cooperation, and fairness. BearTask begins with local campuses and
          aims to grow into a trusted network of helpful students across
          universities everywhere.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💬 Our Promise
        </h2>
        <ul className="text-left list-disc list-inside text-white/90 mb-10 space-y-2">
          <li>Verified student accounts for a safe, trusted community.</li>
          <li>
            Fair pricing guidance for every task. No overcharging, no
            underpaying.
          </li>
          <li>
            Respect, reliability, and collaboration at the heart of every
            exchange.
          </li>
          <li>
            Opportunities to earn, assist, and connect through real
            student interactions.
          </li>
        </ul>

        <p className="text-white/80 mb-6">
          BearTask isn’t just about completing tasks, it’s about creating a
          community where students grow, share, and succeed together.
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
