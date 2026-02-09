import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";

const MAX_LEN = 180;
const PAGE_SIZE = 30;

function timeAgo(ts) {
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

export default function CollectChat() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const oldestRef = useRef(null);
  const lastPostAtRef = useRef(0);

  const trimmed = useMemo(() => content.trim(), [content]);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        localStorage.setItem("beartask_return_url", "/activities/chat");
        router.replace("/login");
        return;
      }
      setUser(data.user);
    });
  }, [router]);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    supabase
      .from("collect_posts")
      .select("id,user_id,content,created_at,is_anonymous")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data }) => {
        setPosts(data || []);
        setHasMore((data || []).length === PAGE_SIZE);
        oldestRef.current = data?.length ? data[data.length - 1].created_at : null;
        setLoading(false);
      });
  }, []);

  /* ---------- REALTIME ---------- */
  useEffect(() => {
    const channel = supabase
      .channel("collect_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "collect_posts" },
        (payload) => {
          setPosts((p) =>
            p.some((x) => x.id === payload.new.id)
              ? p
              : [payload.new, ...p]
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* ---------- POST ---------- */
  const post = async () => {
    if (!trimmed || posting) return;

    if (Date.now() - lastPostAtRef.current < 15000) {
      alert("Easy 🐻 take a breath");
      return;
    }

    setPosting(true);
    await supabase.from("collect_posts").insert({
      user_id: user.id,
      content: trimmed,
      is_anonymous: anonymous,
    });

    lastPostAtRef.current = Date.now();
    setContent("");
    setAnonymous(false);
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto border-x border-white/10">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-4">
          <h1 className="text-xl font-extrabold">💬 Collect Chat</h1>
          <p className="text-sm text-white/60">Campus thoughts, no pressure</p>
        </div>

        {/* COMPOSER */}
        <div className="flex gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center font-bold">
            🐻
          </div>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
              rows={3}
              placeholder="What’s happening?"
              className="w-full bg-transparent text-lg outline-none resize-none placeholder:text-white/40"
            />

            <div className="flex justify-between items-center mt-3">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="accent-amber-400"
                />
                Post anonymously
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">
                  {content.length}/{MAX_LEN}
                </span>
                <button
                  disabled={!trimmed || posting}
                  onClick={post}
                  className="bg-amber-400 text-black font-bold px-5 py-2 rounded-full disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FEED */}
        {loading ? (
          <div className="p-10 text-center text-white/50">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-white/60">
            🐻 Be the first to post
          </div>
        ) : (
          posts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 px-4 py-4 border-b border-white/10 hover:bg-white/5 transition"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-bold">
                {p.is_anonymous ? "👤" : "🐻"}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex gap-2 text-sm items-center">
                  <span className="font-semibold">
                    {p.is_anonymous ? "Anonymous Bear" : "Bear"}
                  </span>
                  <span className="text-white/40">· {timeAgo(p.created_at)}</span>
                </div>

                <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                  {p.content}
                </p>

                {/* Actions */}
                <div className="flex gap-6 mt-3 text-white/50 text-sm">
                  <span className="hover:text-amber-400 cursor-pointer">🔥</span>
                  <span className="hover:text-amber-400 cursor-pointer">😂</span>
                  <span className="hover:text-amber-400 cursor-pointer">🐻</span>
                  <span className="hover:text-amber-400 cursor-pointer">👀</span>

                  {p.user_id === user?.id && (
                    <button
                      onClick={() =>
                        supabase
                          .from("collect_posts")
                          .delete()
                          .eq("id", p.id)
                      }
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
