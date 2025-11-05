import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  const handleSelectRole = async (selectedRole) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 🧠 Check if profile exists first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(profileError);
        alert("Error checking your profile. Please try again.");
        return;
      }

      if (!profile) {
        alert("Please create your BearTask profile first!");
        router.push("/create-profile");
        return;
      }

      // ✅ Update role in profile if missing or changed
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", user.id);

      if (updateError) {
        console.error(updateError);
        alert("Could not update role.");
        return;
      }

      // 🌟 Verify the update worked
      const { data: verify } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("Updated role:", verify?.role || selectedRole);

      // 🚀 Redirect to correct dashboard
      if (selectedRole === "poster") router.push("/poster-home");
      else router.push("/performer-home");
    } catch (err) {
      console.error("Role update error:", err);
      alert("Something went wrong.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-indigo-600">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white px-4">
      <motion.div
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center max-w-md w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-4">Choose Your Role 🧭</h1>
        <p className="text-white/80 mb-8">
          Select how you want to use BearTask. You can switch roles later from your profile.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSelectRole("poster")}
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-3 rounded-lg transition"
          >
            📝 Post Tasks (Poster)
          </button>

          <button
            onClick={() => handleSelectRole("performer")}
            className="bg-indigo-400 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
          >
            💪 Perform Tasks (Performer)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
