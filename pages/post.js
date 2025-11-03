import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function PostTask() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("");
  const [taskType, setTaskType] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [timePeriod, setTimePeriod] = useState("AM"); // ✅ AM/PM selector
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);
    };
    fetchUser();
  }, []);

  // ✅ Task options with "Custom" included
  const taskOptions = {
    "Academic Support": [
      "Note swap",
      "Help with assignments",
      "Help with project",
      "Help with exams",
      "Help with labs",
      "Custom", // new
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
      "Custom", // new
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const username = profile?.username || user.email.split("@")[0];

    // ✅ Combine hour and AM/PM into one string
    const fullTime = `${taskTime} ${timePeriod}`;

    // ✅ Handle custom tasks
    const finalTaskType =
      taskType === "Custom" ? customTask || "Custom Task" : taskType;

    try {
      const { error } = await supabase.from("tasks").insert([
        {
          title,
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
      setTitle("");
      setDescription("");
      setReward("");
      setCategory("");
      setTaskType("");
      setCustomTask("");
      setTaskDate("");
      setTaskTime("");
      setLocation("");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while posting. Try again.");
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
        <h1 className="text-3xl font-bold text-center mb-4">Post a Task 📝</h1>
        <p className="text-white/80 text-center mb-6">
          Describe what you need help with.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task title */}
          <div>
            <label className="block text-sm mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              placeholder="e.g. Help me move boxes"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setTaskType("");
                setCustomTask("");
              }}
              className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              required
            >
              <option value="">-- Select Category --</option>
              {Object.keys(taskOptions).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type */}
          {category && (
            <div>
              <label className="block text-sm mb-1">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                required
              >
                <option value="">-- Select Task Type --</option>
                {taskOptions[category].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Task Input */}
          {(taskType === "Custom") && (
            <div>
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

          {/* Description */}
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

          {/* Reward */}
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

          {/* Date and Time */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm mb-1">Task Date</label>
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

          {/* Location */}
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
      </motion.div>
    </div>
  );
}
