import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function CreateProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // 🔒 FINAL SAFETY CHECK
      if (!user.email?.toLowerCase().endsWith("@cub.uca.edu")) {
        alert("Only UCA students can join BearTask.");
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      setUser(user);
    };

    init();
  }, [router]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please choose a username.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,              // 🔑 LINK TO AUTH USER
        email: user.email,
        username: username.trim(),
        school: "University of Central Arkansas",
        is_student: true,
        has_joined: true,
        created_at: new Date(),
      });

    if (profileError) {
      setError("Username may already be taken.");
      setLoading(false);
      return;
    }

    router.replace("/community");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-lg max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-3">
          Join the BearTask community 🐻
        </h1>

        <p className="text-white/80 text-center mb-6">
          You’re signing in as a UCA student.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full bg-white/20 border border-white/30 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-amber-400"
          />

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-bold py-3 rounded-xl transition"
          >
            {loading ? "Joining…" : "Enter the community"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
