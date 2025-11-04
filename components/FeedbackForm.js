import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeedbackForm({ taskId, toUserUsername, taskTitle, feedbackType = "performer" }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reportSent, setReportSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const fromUsername = profile?.username || user.email.split("@")[0];

    try {
      // check if already left feedback
      const { data: existing } = await supabase
        .from("feedback")
        .select("id")
        .eq("task_id", taskId)
        .eq("from_user_username", fromUsername);

      if (existing && existing.length > 0) {
        setErrorMsg("You already left feedback for this task.");
        return;
      }

      // insert feedback
      const { error: insertError } = await supabase.from("feedback").insert([
        {
          task_id: taskId,
          task_title: taskTitle || null,
          from_user_username: fromUsername,
          to_user_username: toUserUsername,
          rating,
          comment,
          feedback_type: feedbackType,
          reviewed: true,
        },
      ]);
      if (insertError) throw insertError;

      // update avg_rating
      const { data: avg } = await supabase
        .from("feedback")
        .select("rating")
        .eq("to_user_username", toUserUsername);

      const ratings = avg?.map((r) => r.rating) || [];
      const newAvg =
        ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
          : rating;

      await supabase
        .from("profiles")
        .update({ avg_rating: newAvg })
        .eq("username", toUserUsername);

      setSubmitted(true);
    } catch (err) {
      console.error("Feedback error:", err);
      setErrorMsg(err.message);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportComment.trim()) {
      setErrorMsg("Please describe the issue before submitting.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const fromUsername = profile?.username || user.email.split("@")[0];

      const { error } = await supabase.from("feedback_issues").insert([
        {
          task_id: taskId,
          reported_user: toUserUsername,
          reported_by: fromUsername,
          issue_type: "General report",
          description: reportComment,
          created_at: new Date(),
        },
      ]);
      if (error) throw error;

      setReportSent(true);
      setShowReport(false);
    } catch (err) {
      console.error("Report issue error:", err);
      setErrorMsg(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/10 rounded-xl p-3 mt-3 text-center text-sm text-green-400">
        ✅ Thanks for your feedback! You just helped make BearTask more trusted.
        {rating < 3 && !reportSent && (
          <div className="mt-3">
            <button
              onClick={() => setShowReport(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold"
            >
              ⚠️ Report an Issue
            </button>
          </div>
        )}

        {showReport && (
          <form onSubmit={handleReport} className="mt-3 space-y-3 text-left">
            <textarea
              rows="3"
              placeholder="Describe the issue..."
              value={reportComment}
              onChange={(e) => setReportComment(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-red-400 outline-none"
              required
            />
            {errorMsg && (
              <p className="text-red-400 text-xs text-center">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Submit Report
            </button>
          </form>
        )}

        {reportSent && (
          <p className="text-red-400 text-xs mt-3">
            ⚠️ Your report has been submitted. Thank you for helping keep BearTask safe.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mt-3 text-white">
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm font-semibold">Rate your experience with @{toUserUsername}</p>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-yellow-400" : "text-white/40"
              } hover:text-yellow-400 transition`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="2"
          placeholder="Leave a quick comment..."
          className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-sm text-white placeholder-white/60 focus:ring-2 focus:ring-amber-400 outline-none"
        />

        {errorMsg && (
          <p className="text-red-400 text-xs text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
        >
          {rating === 0 ? "Select Rating" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
