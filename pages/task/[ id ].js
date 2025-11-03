import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function TaskChat() {
  const router = useRouter();
  const { id } = router.query;

  const [userEmail, setUserEmail] = useState("");
  const [task, setTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false); // ✅ add sending state

  // Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUser();
  }, []);

  // Fetch task info + messages
  useEffect(() => {
    if (!id) return;
    fetchTask();
    fetchMessages();

    // Subscribe to new messages in realtime
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setTask(data);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: true });
    if (!error) setMessages(data);
  };

  // ✅ fixed message sender
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userEmail) return;
    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          task_id: id,
          sender: userEmail,
          body: newMessage.trim(),
        },
      ])
      .select("*"); // ✅ returns the message inserted

    if (error) {
      console.error("Message insert error:", error);
      alert("❌ Message not sent. Check console for details.");
    } else if (data && data.length > 0) {
      // ✅ instantly show new message
      setMessages((prev) => [...prev, data[0]]);
      setNewMessage("");
    }

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex flex-col items-center py-8 px-4">
      <motion.div
        className="bg-white text-gray-800 rounded-2xl shadow-lg w-full max-w-2xl flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="font-bold text-xl">
            💬 {task?.title || "Task Chat"}
          </h2>
          <button
            onClick={() => router.back()}
            className="text-sm text-indigo-600 underline"
          >
            ← Back
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 h-[60vh] bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`my-2 flex ${
                  msg.sender === userEmail ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm ${
                    msg.sender === userEmail
                      ? "bg-purple-200"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="border-t p-4 flex gap-2 bg-gray-100"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow border rounded-lg p-2 text-sm"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={sending}
            className={`${
              sending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-800"
            } text-white px-4 rounded-lg text-sm`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
