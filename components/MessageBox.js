import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessageBox({ taskId, currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🧠 Fetch messages once on mount
  useEffect(() => {
    if (!taskId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        setErrorMsg(error.message);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // 🧩 Real-time subscription only for this task
    const channel = supabase
      .channel(`messages:task:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  // 📨 Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        task_id: taskId,
        from_user: currentUser,
        to_user: otherUser,
        message: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error("Send message error:", error);
      setErrorMsg(error.message);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl mt-3 p-3 text-white">
      {errorMsg && (
        <p className="text-red-400 text-xs text-center mb-2">
          ⚠️ {errorMsg}
        </p>
      )}

      <div className="max-h-60 overflow-y-auto mb-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-white/70 text-center">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from_user === currentUser
                  ? "justify-end text-right"
                  : "justify-start text-left"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
                  msg.from_user === currentUser
                    ? "bg-purple-600 text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-[10px] text-white/50 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-white/20 border border-white/30 rounded-lg p-2 text-sm text-white placeholder-white/60 focus:ring-2 focus:ring-amber-400 outline-none"
        />
        <button
          type="submit"
          className="bg-amber-400 hover:bg-amber-500 text-purple-900 px-3 rounded-lg text-sm font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}
