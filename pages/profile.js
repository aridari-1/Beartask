import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [avgRating, setAvgRating] = useState("—");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("school, username, is_student")
        .eq("id", user.id)
        .single();

      if (profile) {
        setSchool(profile.school);
        setUsername(profile.username || user.email.split("@")[0]);
        setIsStudent(profile.is_student === true);
      }

      setFullName(user.user_metadata?.full_name || "");

      const { data: reviews } = await supabase
        .from("feedback")
        .select("rating")
        .eq("to_user_username", profile?.username);

      if (reviews && reviews.length > 0) {
        const avg =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setAvgRating(avg.toFixed(1));
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        school: school.trim(),
      })
      .eq("id", user.id);

    if (fullName.trim()) {
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
    }

    setSaving(false);
    setEditing(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-indigo-600">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center py-10 px-4">
      <motion.div
        className="bg-white/10 backdrop-blur-md w-full max-w-md rounded-2xl shadow-lg p-8 text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-6">My Profile 👤</h1>

        {!editing ? (
          <>
            <div className="space-y-3 mb-8">
              <p><strong>Full Name:</strong> {fullName || "—"}</p>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>School:</strong> {school || "—"}</p>
              <p>
                <strong>Status:</strong>{" "}
                {isStudent ? "🎓 Student Ambassador" : "Supporter"}
              </p>
              <p>
                <strong>Average Rating:</strong>{" "}
                <span className="text-yellow-300">⭐ {avgRating}/5</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setEditing(true)}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg"
              >
                ✏️ Edit Info
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
              >
                🚪 Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/10 border border-white/30"
                placeholder="Full name"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/10 border border-white/30"
                placeholder="Username"
              />
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/10 border border-white/30"
                placeholder="School"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg"
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>

              <button
                onClick={() => setEditing(false)}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
