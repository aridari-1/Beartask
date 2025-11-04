import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function PostTask() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [timePeriod, setTimePeriod] = useState("AM");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      setUser(user);
    };
    fetchUser();
  }, [router]);

  const taskOptions = {
    "Academic Support": [
      "Note swap",
      "Help with assignments",
      "Help with project",
      "Help with exams",
      "Help with labs",
      "Custom",
    ],
    "Quick Favors": [
      "Printing help",
      "Cafeteria swipe",
      "Item return to the library",
      "Custom",
    ],
    "Campus Life": [
      "Move in/out",
      "Decor help",
      "Graduation pics",
      "Tech help",
      "Custom",
    ],
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const username = profile?.username || user.email.split("@")[0];
    const finalTaskType = taskType === "Custom" ? customTask : taskType;
    const fullTime = `${taskTime} ${timePeriod}`;
    const finalTitle =
      title.trim() || (taskType === "Custom" ? customTask : finalTaskType);

    try {
      const { error } = await supabase.from("tasks").insert([
        {
          title: finalTitle,
          description,
          reward,
          category,
          task_type: finalTaskType,
          posted_by: username,
          status: "open",
          task_date: taskDate || null,
          task_time: fullTime || null,
          location,
          created_at: new Date(),
        },
      ]);
      if (error) throw error;

      setMessage("✅ Task posted successfully!");
      setTimeout(() => router.push("/poster-home"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center py-10 px-4">
      <motion.div
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-4">Post a Task 🧩</h1>

        {/* Step 1: Choose Category and Task Type */}
        {step === 1 && (
          <>
            <p className="text-center text-sm mb-4">
              Choose a category and a task type
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.keys(taskOptions).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setTaskType("");
                      setCustomTask("");
                    }}
                    className={`py-2 px-3 rounded-xl font-semibold transition ${
                      category === cat
                        ? "bg-amber-400 text-purple-900"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {category && (
                <div>
                  <p className="text-center font-semibold mb-2">
                    Task Type ({category})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {taskOptions[category].map((type) => (
                      <button
                        key={type}
                        onClick={() => setTaskType(type)}
                        className={`py-2 px-3 rounded-xl font-medium transition ${
                          taskType === type
                            ? "bg-amber-400 text-purple-900"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {taskType === "Custom" && (
                <div className="mt-4">
                  <label className="block text-sm mb-1">Custom Task Name</label>
                  <input
                    type="text"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Describe your custom task"
                    required
                  />
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!category || !taskType || (taskType === "Custom" && !customTask)}
                className="w-full mt-4 bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition disabled:bg-white/20 disabled:text-white/60"
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Fill Task Details */}
        {step === 2 && (
          <form onSubmit={handlePost} className="space-y-4">
            <p
              className="text-sm text-center mb-2 underline cursor-pointer"
              onClick={() => setStep(1)}
            >
              ← Go back
            </p>

            <h2 className="text-xl font-bold text-center mb-4">
              Describe your {category} task
            </h2>

            <div>
              <label className="block text-sm mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder={
                  taskType === "Custom" ? customTask : "e.g. Help me move boxes"
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Describe what you need help with..."
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Reward ($)</label>
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                min="1"
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm mb-1">Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-20 bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="e.g. Student Center"
              />
            </div>

            {message && (
              <p
                className={`text-center text-sm ${
                  message.startsWith("✅") ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Posting..." : "Post Task"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
