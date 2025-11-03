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
          BearTask is built on trust, fairness, and safety. Every feature in the
          app is designed to help students connect, collaborate, and exchange
          tasks securely within a verified student community.
        </p>

        {/* Student Verification */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎓 Student Verification
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Every BearTask member must sign in using a verified school email
          address. This ensures that all users are real students with active
          university accounts. Verified access keeps the platform private, safe,
          and student-only.
        </p>

        {/* Community Standards */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🤝 Community Standards
        </h2>
        <p className="text-white/90 mb-2 leading-relaxed">
          We expect everyone in our community to:
        </p>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-1">
          <li>Communicate clearly and respectfully.</li>
          <li>Show up on time and follow through on commitments.</li>
          <li>Respect campus property and personal boundaries.</li>
          <li>
            Offer fair payment and fair effort for every task.
          </li>
          <li>
            Custom-created tasks must remain respectful and appropriate;{" "}
            <strong>
              BearTask does not support or promote harmful, illegal, or
              inappropriate behavior.
            </strong>
          </li>
        </ul>

        {/* Safety Guidelines */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🦺 Safety Guidelines
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-1">
          <li>Make sure to meet in public and safe campus areas.</li>
          <li>Never share passwords or personal financial information.</li>
          <li>Do not exchange payment until the task is confirmed complete.</li>
          <li>Trust your instincts, cancel or report anything that feels unsafe.</li>
        </ul>

        {/* Ratings & Feedback */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          ⭐ Ratings & Feedback
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          After each task, both posters and performers can leave a quick rating
          and feedback. This reputation system helps build accountability and
          promotes helpful behavior across the campus.
        </p>

        {/* Reporting */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🚨 Reporting & Moderation
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          If you encounter inappropriate behavior or uncompleted tasks, please
          report it directly in the app or email our support team. We review
          reports quickly to maintain a safe environment for all students.
        </p>

        {/* Fair Pay */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💰 Fair Pay Promise
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          BearTask encourages fair pricing for every student task. The app
          suggests recommended price ranges based on task type so that
          performers are never underpaid and posters are never overcharged.
        </p>

        {/* Future Payments */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🔒 Future Payment Protection
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          As BearTask grows, in-app payments will be handled through a secure
          provider. Funds will be safely held until a task is completed,
          protecting both posters and performers.
        </p>

        {/* Contact */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          📞 Contact & Support
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          Have questions, concerns, or feedback? Reach us anytime at{" "}
          <a
            href="mailto:support@beartask.app"
            className="text-amber-300 underline hover:text-amber-400"
          >
            support@beartask.app
          </a>
          . We’re here to keep BearTask a trusted, student-friendly space.
        </p>

        <div className="text-center">
          <Link
            href="/about"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-2 rounded-lg transition"
          >
            Learn About Our Mission →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
