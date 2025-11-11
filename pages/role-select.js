import { useRouter } from "next/router";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const router = useRouter();

  useEffect(() => {
    // Clear any previous role
    localStorage.removeItem("beartask_role");
  }, []);

  const handleRole = (role) => {
    localStorage.setItem("beartask_role", role);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center px-4 text-white text-center">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        What would you like to do?
      </motion.h1>

      <p className="mb-10 text-white/80 max-w-md text-sm sm:text-base">
        Choose whether you want to post a task or earn money by helping others.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => handleRole("poster")}
          className="bg-white/10 hover:bg-white/20 transition px-6 py-4 rounded-xl text-lg font-semibold shadow-md"
        >
          📝 request a service
        </button>

        <button
          onClick={() => handleRole("performer")}
          className="bg-white/10 hover:bg-white/20 transition px-6 py-4 rounded-xl text-lg font-semibold shadow-md"
        >
          💵 perform
        </button>
      </div>
    </div>
  );
}
