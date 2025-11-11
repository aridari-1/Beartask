import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function CreateProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please choose a username.");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const email = user.email;

    const detectedSchool = email.includes("@cub.uca.edu")
      ? "University of Central Arkansas"
      : email.includes("@hendrix.edu")
      ? "Hendrix College"
      : "Unknown";

    // ✅ Get role from localStorage
    const role = localStorage.getItem("beartask_role");

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username: username.trim(),
          email: email,
          school: school || detectedSchool,
          role: role || null,
          created_at: new Date(),
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/how-to-use");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Error creating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4 text-white">
      <motion.div
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-4 text-center">
          Create Your Profile 🧩
        </h1>
        <p className="text-white/80 mb-6 text-center">
          Set up your BearTask profile before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="e.g., alex_uca"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              School (optional)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="e.g., University of Central Arkansas"
            />
          </div>

          {success && (
            <p className="text-green-400 text-sm text-center">
              ✅ Profile created! Redirecting...
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Saving..." : "Create Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
