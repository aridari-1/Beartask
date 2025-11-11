import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import icon from "../public/favicon.ico.ico"; // ✅ Make sure the file is in /public folder

export default function Home() {
  console.log("Supabase connected:", !!supabase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white text-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <Image
          src={icon}
          alt="BearTask logo"
          width={45}
          height={45}
          className="rounded-md"
        />
        <h1 className="text-5xl font-bold">BearTask</h1>
      </motion.div>

      <p className="text-lg mb-4 max-w-xl">
        <strong>BearTask</strong> is a local help platform that connects people
        who need assistance with verified college students ready to lend a
        hand. From errands and cleaning to tutoring and tech support, BearTask
        makes getting help easy and reliable.
      </p>

      <p className="text-sm mb-10 max-w-md text-white/80">
        Whether you need a quick favor or want to earn extra money helping your
        community, BearTask is here for that.
      </p>

      <a
        href="/role-select"
        className="bg-amber-400 text-purple-900 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-amber-500 transition"
      >
        Get Started
      </a>
    </div>
  );
}
