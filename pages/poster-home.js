import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import FeedbackForm from "../components/FeedbackForm";
import MessageBox from "../components/MessageBox";

export default function PosterHome() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({ total: 0, ongoing: 0, completed: 0 });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // 🧠 Load poster info
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

  // 🔁 Fetch tasks
  useEffect(() => {
    if (username) fetchTasks(username);
  }, [username]);

  const fetchTasks = async (uname) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("posted_by", uname)
      .order("created_at", { ascending: false });
    if (error) return console.error(error);
    const total = data.length;
    const completed = data.filter((t) => t.status === "completed").length;
    const ongoing = data.filter(
      (t) => t.status === "accepted" || t.status === "in_progress"
    ).length;
    setStats({ total, ongoing, completed });
    setTasks(data);
  };

  // 🔔 NEW: Realtime subscription to listen for task status changes
  useEffect(() => {
    if (!username) return;

    const channel = supabase
      .channel("tasks-realtime-poster")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `posted_by=eq.${username}`,
        },
        (payload) => {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === payload.new.id ? payload.new : task
            )
          );
          fetchTasks(username); // refresh stats
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const filteredTasks =
    filter === "ongoing"
      ? tasks.filter(
          (t) => t.status === "accepted" || t.status === "in_progress"
        )
      : filter === "completed"
      ? tasks.filter((t) => t.status === "completed")
      : tasks;

  return (
    <div className="min-h-screen flex flex-col items-center text-white text-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {username || "Poster"} 👋
        </h1>
        <p className="text-white/80 mb-6">
          Track your posted tasks and stay connected with your campus helpers.
        </p>

        {/* Filter Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {["all", "ongoing", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`p-4 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-amber-400 text-purple-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "ongoing"
                ? "Ongoing"
                : "Completed"}
              <div className="text-2xl font-bold">
                {f === "all"
                  ? stats.total
                  : f === "ongoing"
                  ? stats.ongoing
                  : stats.completed}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link
            href="/post"
            className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-6 py-3 rounded-lg transition"
          >
            📝 Create New Task
          </Link>
          <Link
            href="/browse"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition"
          >
            🔍 Browse Performers
          </Link>
        </div>

        {/* Task list */}
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-3">
            {filter === "all"
              ? "📋 All Tasks"
              : filter === "ongoing"
              ? "🕓 Ongoing Tasks"
              : "✅ Completed Tasks"}
          </h2>

          {filteredTasks.length === 0 ? (
            <p className="text-white/80">No tasks found.</p>
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
                      <p className="text-white/70">
                        {t.status === "open"
                          ? "Open"
                          : t.status === "accepted"
                          ? `Accepted by @${t.accepted_by}`
                          : t.status === "in_progress"
                          ? `🕓 In Progress by @${t.accepted_by}`
                          : `✅ Completed by @${t.accepted_by}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        t.status === "open"
                          ? "bg-green-100 text-green-700"
                          : t.status === "accepted"
                          ? "bg-yellow-100 text-yellow-700"
                          : t.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {(t.status === "accepted" || t.status === "in_progress") && (
                    <MessageBox
                      taskId={t.id}
                      currentUser={username}
                      otherUser={t.accepted_by}
                    />
                  )}

                  {t.status === "completed" && (
                    <FeedbackForm
                      taskId={t.id}
                      toUserUsername={t.accepted_by}
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
