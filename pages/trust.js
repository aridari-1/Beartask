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
          BearTask is built on trust, fairness, and safety. The app connects
          locals who need help with verified college students offering reliable
          and respectful assistance. Every feature is designed to keep
          interactions simple, secure, and transparent.
        </p>

        {/* Verification */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🎓 Verified Performers
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          All BearTask performers must sign in using a verified school email.
          This ensures that helpers are genuine college students who meet our
          trust and reliability standards. Posters from the public can use any
          valid email to post tasks safely.
        </p>

        {/* Community Standards */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🤝 Community Standards
        </h2>
        <p className="text-white/90 mb-2 leading-relaxed">
          We expect everyone on BearTask to:
        </p>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-1">
          <li>Communicate clearly, kindly, and respectfully.</li>
          <li>Show up on time and complete tasks as agreed.</li>
          <li>Respect others’ property and personal boundaries.</li>
          <li>Offer fair payment and fair effort for every task.</li>
          <li>
            Custom-created tasks must remain appropriate and lawful;{" "}
            <strong>
              BearTask does not support or promote harmful, illegal, or
              disrespectful activities.
            </strong>
          </li>
        </ul>

        {/* Safety */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🦺 Safety Guidelines
        </h2>
        <ul className="list-disc list-inside text-white/90 mb-6 space-y-1">
          <li>Meet in public or well-lit areas whenever possible.</li>
          <li>Never share private passwords or financial information.</li>
          <li>Confirm details and payment before starting the task.</li>
          <li>Trust your instincts, report or cancel anything unsafe.</li>
        </ul>

        {/* Ratings */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          ⭐ Ratings & Feedback
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          After each task, both posters and performers can rate and review each
          other. This builds accountability and helps the community recognize
          reliable, respectful members.
        </p>

        {/* Reporting */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🚨 Reporting & Moderation
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          If you encounter inappropriate behavior, uncompleted tasks, or safety
          concerns, you can report it directly within the app or by emailing our
          support team. Reports are reviewed promptly to maintain a secure and
          respectful environment.
        </p>

        {/* Fair Pay */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          💰 Fair Pay Promise
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          BearTask promotes fair pricing for every type of task. Recommended
          price ranges help ensure that students are paid fairly and posters
          receive honest, quality help.
        </p>

        {/* Future Payments */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          🔒 Future Payment Protection
        </h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          In the future, BearTask will include secure in-app payments through a
          trusted provider. Payments will be held safely until both parties
          confirm that a task has been completed successfully.
        </p>

        {/* Contact */}
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">
          📞 Contact & Support
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">
          Have questions or concerns? Reach our team anytime at{" "}
          <a
            href="mailto:support@beartask.app"
            className="text-amber-300 underline hover:text-amber-400"
          >
            beartaskapp@gmail.com
          </a>
          . We’re here to keep BearTask a trustworthy and positive experience
          for everyone.
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
