import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";

const TREND_SLUG = "bear-sign";

export default function BearSignTrend() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        localStorage.setItem("beartask_return_url", router.asPath);
        router.replace("/login");
        return;
      }
      setUser(data.user);
    };
    loadUser();
  }, [router]);

  /* ---------------- LOAD SUBMISSIONS ---------------- */
  const loadSubmissions = async () => {
    const { data } = await supabase
      .from("trend_submissions")
      .select("*")
      .eq("trend_slug", TREND_SLUG)
      .order("created_at", { ascending: false });

    setSubmissions(data || []);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  /* ---------------- CHECK IF USER ALREADY JOINED ---------------- */
  useEffect(() => {
    if (!user) return;

    const check = async () => {
      const { data } = await supabase
        .from("trend_submissions")
        .select("id")
        .eq("trend_slug", TREND_SLUG)
        .eq("user_id", user.id)
        .single();

      if (data) setAlreadyJoined(true);
    };

    check();
  }, [user]);

  /* ---------------- FILE HANDLING ---------------- */
  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ---------------- UPLOAD ---------------- */
  const uploadSelfie = async () => {
    if (!file || !user) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${TREND_SLUG}/${user.id}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("bear-trends")
      .upload(path, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("bear-trends")
      .getPublicUrl(path);

    await supabase.from("trend_submissions").insert({
      trend_slug: TREND_SLUG,
      user_id: user.id,
      image_url: publicUrl.publicUrl,
    });

    setAlreadyJoined(true);
    setFile(null);
    setPreview(null);
    await loadSubmissions();
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-purple-900 to-black text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER (UNCHANGED, GOOD) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-3">
            🐻 Bear Sign Selfie
          </h1>
          <p className="text-white/70 max-w-xl">
            Show us your Bear sign.
            One photo. One vibe.
          </p>
        </motion.div>

        {/* UPLOAD AREA */}
        {!alreadyJoined && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
            <div
              className="relative border-2 border-dashed border-white/30 rounded-3xl p-10 text-center bg-white/5 hover:border-amber-400/60 transition cursor-pointer"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {!preview ? (
                <>
                  <div className="text-5xl mb-4">📸</div>
                  <p className="text-lg font-semibold mb-1">
                    Upload your Bear Sign selfie
                  </p>
                  <p className="text-white/60 text-sm">
                    Click or drag & drop a photo
                  </p>
                </>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-80 rounded-2xl object-cover"
                />
              )}

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <button
              onClick={uploadSelfie}
              disabled={!file || uploading}
              className="mt-6 w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-bold py-4 rounded-2xl transition disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload & Join"}
            </button>
          </motion.div>
        )}

        {alreadyJoined && (
          <div className="mb-14 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-emerald-100">
            You’re officially part of the trend 🐻
          </div>
        )}

        {/* SELFIE GRID */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-white/80">
            Community selfies
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {submissions.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square rounded-2xl overflow-hidden bg-white/10 border border-white/20 hover:scale-[1.02] transition"
              >
                <img
                  src={s.image_url}
                  alt="Bear sign selfie"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
