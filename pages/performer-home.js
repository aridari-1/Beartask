import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { motion } from "framer-motion";
import FeedbackForm from "../components/FeedbackForm";
import MessageBox from "../components/MessageBox";

export default function PerformerHome() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({ accepted: 0, ongoing: 0, completed: 0 });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ongoing");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!session?.user?.id) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();
      setUsername(profile?.username || session.user.email.split("@")[0]);
    };
    loadUser();
  }, [session, supabase]);

  useEffect(() => {
    if (username) fetchTasks(username);
  }, [username]);

  const fetchTasks = async (uname) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("accepted_by", uname)
      .order("created_at", { ascending: false });

    if (error) return console.error(error);

    const accepted = data.length;
    const completed = data.filter((t) => t.status === "completed").length;
    const ongoing = data.filter(
      (t) => t.status === "accepted" || t.status === "in_progress"
    ).length;
    setStats({ accepted, ongoing, completed });
    setTasks(data);
  };

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

  const toggleTask = (id) => {
    setSelectedTask(selectedTask === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center text-white text-center py-10 px-3">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">
          Hey, {username || "Performer"} 👋
        </h1>
        <p className="text-white/80 mb-6">
          Here’s your current activity. Keep helping others!
        </p>

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
        </div>

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
                  className={`bg-white/10 rounded-lg p-3 text-sm space-y-2 ${
                    selectedTask === t.id ? "shadow-lg" : "hover:bg-white/20"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="w-full flex justify-between items-center font-semibold text-left"
                  >
                    <div>
                      <p>{t.title}</p>
                      <p className="text-white/70 text-xs">@{t.posted_by}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        t.status === "completed"
                          ? "bg-green-500"
                          : t.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-yellow-400 text-purple-900"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </button>

                  {selectedTask === t.id && (
                    <div className="mt-2 text-sm text-white/90 space-y-2">
                      <p><strong>Type:</strong> {t.task_type}</p>
                      <p><strong>Description:</strong> {t.description}</p>
                      <p><strong>Location:</strong> {t.location || "Not specified"}</p>
                      <p><strong>Reward:</strong> ${t.reward}</p>

                      <div className="flex gap-2 flex-wrap">
                        {t.status === "accepted" && (
                          <button
                            onClick={() => startTask(t.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs"
                          >
                            🚀 Start
                          </button>
                        )}
                        {t.status === "in_progress" && !t.performer_confirmed && (
                          <button
                            onClick={() => markCompleted(t.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs"
                          >
                            ✅ Mark Completed
                          </button>
                        )}
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
