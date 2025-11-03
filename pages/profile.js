import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [school, setSchool] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avgRating, setAvgRating] = useState("—"); // ✅ New: average rating
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, school, username")
          .eq("id", user.id)
          .single();

        if (profile) {
          setRole(profile.role);
          setSchool(profile.school);
          setUsername(profile.username || user.email.split("@")[0]);
        }

        setFullName(user.user_metadata?.full_name || "");

        // ✅ Fetch average rating
        const { data: reviews, error } = await supabase
          .from("feedback")
          .select("rating")
          .eq("to_user_username", username);

        if (!error && reviews && reviews.length > 0) {
          const avg =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setAvgRating(avg.toFixed(1));
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleSwitchRole = async () => {
    if (!user) return;
    const newRole = role === "poster" ? "performer" : "poster";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", user.id);
    if (!error) {
      setRole(newRole);
      window.location.href =
        newRole === "poster" ? "/poster-home" : "/performer-home";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const updates = {
      username: username.trim(),
      school: school.trim(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (fullName.trim() && fullName !== user.user_metadata?.full_name) {
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    }

    setSaving(false);
    setEditing(false);
    if (error) alert("Error saving changes.");
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
            {/* Display Info */}
            <div className="space-y-3 mb-8 text-left">
              <p>
                <span className="text-white/70 font-semibold">Full Name:</span>{" "}
                {fullName || "—"}
              </p>
              <p>
                <span className="text-white/70 font-semibold">Username:</span>{" "}
                {username || "—"}
              </p>
              <p>
                <span className="text-white/70 font-semibold">Email:</span>{" "}
                {user?.email}
              </p>
              <p>
                <span className="text-white/70 font-semibold">School:</span>{" "}
                {school ||
                  (user?.email.includes("@cub.uca.edu")
                    ? "University of Central Arkansas"
                    : user?.email.includes("@hendrix.edu")
                    ? "Hendrix College"
                    : "—")}
              </p>
              <p>
                <span className="text-white/70 font-semibold">Role:</span>{" "}
                <span className="capitalize">{role}</span>
              </p>
              {/* ✅ Show Average Rating */}
              <p>
                <span className="text-white/70 font-semibold">
                  Average Rating:
                </span>{" "}
                <span className="text-yellow-300 font-semibold">
                  ⭐ {avgRating}/5
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setEditing(true)}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg transition"
              >
                ✏️ Edit Info
              </button>

              <button
                onClick={handleSwitchRole}
                className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
              >
                🔄 Switch to {role === "poster" ? "Performer" : "Poster"} Mode
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
              >
                🚪 Logout
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-white/30 bg-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-300 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-white/30 bg-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-300 outline-none"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1">
                  School
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full border border-white/30 bg-white/10 text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-300 outline-none"
                  placeholder="Enter your school name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>

              <button
                onClick={() => setEditing(false)}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg transition"
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
