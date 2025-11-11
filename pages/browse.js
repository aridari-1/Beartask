import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        setUserInfo({
          id: user.id,
          username: profile?.username || user.email.split("@")[0],
        });
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setTasks(data);
      setLoading(false);
    };
    fetchUserAndTasks();
  }, []);

  // 🔔 NEW: realtime subscription for newly posted tasks (no other logic changed)
  useEffect(() => {
    // Ensure the table is in the Realtime publication on the DB (see instructions below)
    const channel = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new;
          // avoid duplicates if list already includes it
          setTasks((prev) => {
            if (prev.some((t) => t.id === newTask.id)) return prev;
            // keep your newest-first order
            return [newTask, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptTask = async (taskId) => {
    if (!userInfo) {
      alert("Please log in before accepting a task.");
      return;
    }

    const { data: pendingTasks, error: pendingError } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("accepted_by", userInfo.username)
      .eq("performer_confirmed", false)
      .eq("status", "in_progress");

    if (pendingError) {
      console.error("Error checking pending tasks:", pendingError);
      alert("Error checking your current tasks. Please try again.");
      setLoading(false);
      return;
    }

    if (pendingTasks.length > 0) {
      alert(
        `⚠️ You must confirm completion of your last task ("${pendingTasks[0].title}") before accepting new ones.`
      );
      setLoading(false);
      return;
    }

    const { data: completedTasks, error: completedError } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("accepted_by", userInfo.username)
      .eq("status", "completed");

    if (completedError) {
      console.error("Error checking completed tasks:", completedError);
      alert("Error verifying completed tasks. Please try again.");
      return;
    }

    if (completedTasks.length > 0) {
      const completedIds = completedTasks.map((t) => t.id);
      const { data: feedbacks, error: feedbackError } = await supabase
        .from("feedback")
        .select("task_id")
        .in("task_id", completedIds)
        .eq("from_user_username", userInfo.username);

      if (feedbackError) {
        console.error("Feedback check error:", feedbackError);
        alert("Error verifying your feedback records.");
        return;
      }

      const ratedIds = feedbacks?.map((f) => f.task_id) || [];
      const unrated = completedTasks.filter((t) => !ratedIds.includes(t.id));

      if (unrated.length > 0) {
        alert(
          `⚠️ You must rate your last completed task ("${unrated[0].title}") before accepting new ones.`
        );
        return;
      }
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        accepted_by: userInfo.username,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Supabase error:", error);
      alert("Error: " + (error.message || "Check console for details."));
    } else {
      alert("✅ Task accepted! Check your performer dashboard.");
      const { data: updatedTasks } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "completed")
        .order("created_at", { ascending: false });
      setTasks(updatedTasks || []);
    }
  };

  // ✅ Your grouping logic remains unchanged
  const grouped = {
    "Home & Everyday Help": tasks.filter(
      (t) => t.category === "Home & Everyday Help"
    ),
    "Campus Life": tasks.filter((t) => t.category === "Campus Life"),
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        Loading tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col items-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Available Tasks 🧾
        </h1>

        {tasks.length === 0 ? (
          <p className="text-center text-white/80">
            No tasks available right now.
          </p>
        ) : (
          <>
            {Object.keys(grouped).map((cat) => (
              <div key={cat} className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-amber-300">
                  {cat}
                </h2>
                {grouped[cat].length === 0 ? (
                  <p className="text-white/60 text-sm mb-4">
                    No {cat.toLowerCase()} tasks right now.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {grouped[cat].map((t) => (
                      <div
                        key={t.id}
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">{t.title}</h2>
                          <span className="text-sm text-white/70">
                            Posted by{" "}
                            <span className="text-amber-300 font-semibold">
                              @{t.posted_by}
                            </span>
                          </span>
                        </div>

                        <p className="text-white/90 mb-2">{t.description}</p>
                        <p className="text-sm text-white/70">
                          Task Type: {t.task_type} | Reward: ${t.reward}
                        </p>

                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm text-white/70">
                            {t.location} • {t.task_date}
                          </p>

                          {t.status === "open" ? (
                            userInfo?.username === t.posted_by ? (
                              <span className="text-xs text-white/50 italic">
                                (Your task)
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAcceptTask(t.id)}
                                className="bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-3 py-1 rounded-lg text-sm transition"
                              >
                                Accept Task →
                              </button>
                            )
                          ) : (
                            <span className="text-sm text-green-300">
                              Accepted by @{t.accepted_by}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}
