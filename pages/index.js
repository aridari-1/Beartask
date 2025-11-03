import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Home() {
  console.log("Supabase connected:", !!supabase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white text-center p-6">
      <motion.h1
        className="text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        BearTask 🐻
      </motion.h1>

      <p className="text-lg mb-8 max-w-xl">
        College life made easier. Earn or request help from students around
        Conway.
      </p>

      <div className="flex space-x-4">
        <a
          href="/browse"
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-full shadow hover:bg-purple-200 transition"
        >
          Browse Tasks
        </a>
        <a
          href="/post"
          className="bg-purple-900 px-6 py-3 rounded-full shadow font-semibold hover:bg-purple-800 transition"
        >
          Post a Task
        </a>
      </div>
    </div>
  );
}
