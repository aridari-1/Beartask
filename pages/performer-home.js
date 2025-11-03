import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import FeedbackForm from "../components/FeedbackForm";
import MessageBox from "../components/MessageBox";

export default function PerformerHome() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({ accepted: 0, ongoing: 0, completed: 0 });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ongoing");

  // 🧠 Load performer info
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      setUsername(profile?.username || user.email.split("@")[0]);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (username) fetchTasks(username);
  }, [username]);

  const fetchTasks = async (uname) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("accepted_by", uname)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const accepted = data.length;
    const completed = data.filter((t) => t.status === "completed").length;
    const ongoing = data.filter(
      (t) => t.status === "accepted" || t.status === "in_progress"
    ).length;
    setStats({ accepted, ongoing, completed });
    setTasks(data);
  };

  // 🟢 Mark task as started
  const startTask = async (taskId) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error starting task:", error);
      alert("Something went wrong while starting the task.");
    } else {
      alert("🚀 Task marked as In Progress!");
      if (username) fetchTasks(username);
    }
  };

  // 🟣 Mark task as completed
  const markCompleted = async (taskId) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "completed",
        performer_confirmed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Error marking task completed:", error);
      alert("❌ Could not mark task as completed. Check console for details.");
    } else {
      alert("✅ Task marked as completed!");
      if (username) fetchTasks(username);
    }
  };

  const filteredTasks =
    filter === "accepted"
      ? tasks.filter((t) => t.status === "accepted")
      : filter === "ongoing"
      ? tasks.filter((t) => t.status === "in_progress")
      : tasks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen flex flex-col items-center text-white text-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">
          Hey, {username || "Performer"} 👋
        </h1>
        <p className="text-white/80 mb-6">
          Here’s your current campus activity. Keep helping others!
        </p>

        {/* Task filters */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {["accepted", "ongoing", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`p-4 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-amber-400 text-purple-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {f === "accepted"
                ? "Accepted"
                : f === "ongoing"
                ? "Ongoing"
                : "Completed"}
              <div className="text-2xl font-bold">
                {f === "accepted"
                  ? stats.accepted
                  : f === "ongoing"
                  ? stats.ongoing
                  : stats.completed}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link
            href="/browse"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-3 rounded-lg transition"
          >
            🔍 Find Tasks
          </Link>
          <Link
            href="/profile"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition"
          >
            👤 My Profile
          </Link>
        </div>

        {/* Task display */}
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-3 capitalize">
            {filter === "accepted"
              ? "🟡 Accepted Tasks"
              : filter === "ongoing"
              ? "🕓 In Progress Tasks"
              : "✅ Completed Tasks"}
          </h2>

          {filteredTasks.length === 0 ? (
            <p className="text-white/80">No tasks to show here.</p>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white/10 rounded-lg p-3 text-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-white/70">Posted by @{t.posted_by}</p>
                    </div>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        t.status === "in_progress"
                          ? "bg-blue-200 text-blue-700"
                          : t.status === "accepted"
                          ? "bg-yellow-200 text-yellow-700"
                          : "bg-green-200 text-green-700"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {t.status === "accepted" && (
                      <button
                        onClick={() => startTask(t.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        🚀 Start
                      </button>
                    )}

                    {/* ✅ Button to mark completed */}
                    {t.status === "in_progress" && !t.performer_confirmed && (
                      <button
                        onClick={() => markCompleted(t.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        ✅ Mark as Completed
                      </button>
                    )}

                    <Link
                      href={`/task/${t.id}`}
                      className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      View Task
                    </Link>
                  </div>

                  {(t.status === "accepted" || t.status === "in_progress") && (
                    <MessageBox
                      taskId={t.id}
                      currentUser={username}
                      otherUser={t.posted_by}
                    />
                  )}

                  {t.status === "completed" && (
                    <FeedbackForm
                      taskId={t.id}
                      toUserUsername={t.posted_by}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
