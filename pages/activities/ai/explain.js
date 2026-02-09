import { useState } from "react";
import { motion } from "framer-motion";

/* --------------------------------
   Helper: parse AI explanation
--------------------------------- */
function parseExplanation(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let title = "";
  const sections = [];
  const sources = [];

  let currentSection = null;
  let inSources = false;

  for (const line of lines) {
    if (line.startsWith("Title:")) {
      title = line.replace("Title:", "").trim();
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: line.replace(/^\d+\.\s*/, ""),
        content: "",
      };
      inSources = false;
      continue;
    }

    if (line.toLowerCase().startsWith("sources")) {
      if (currentSection) sections.push(currentSection);
      currentSection = null;
      inSources = true;
      continue;
    }

    if (inSources && line.startsWith("-")) {
      sources.push({
        title: line.replace("-", "").trim(),
        url: "#",
      });
      continue;
    }

    if (currentSection) {
      currentSection.content +=
        (currentSection.content ? " " : "") + line;
    }
  }

  if (currentSection) sections.push(currentSection);

  return { title, sections, sources };
}

/* --------------------------------
   Page
--------------------------------- */
export default function ExplainItBetter() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function explain() {
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "https://xkfcfweutussdnpbwyiw.functions.supabase.co/explain-concept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      const rawText = await res.text();
      console.log("RAW RESPONSE:", rawText);

      if (!res.ok) {
        throw new Error(rawText);
      }

      const data = JSON.parse(rawText);

      if (!data.explanation) {
        throw new Error("No explanation returned from AI");
      }

      setResult(parseExplanation(data.explanation));
    } catch (err) {
      console.error("AI ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1224] via-[#2A0E61] to-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold">🧠 Explain It Better</h1>
          <p className="text-white/70 mt-2">
            Friendly explanations for college students.  
            No pressure. Just clarity.
          </p>
        </motion.div>

        {/* Input */}
        <div className="bg-white/10 border border-white/20 rounded-3xl p-6 mb-8">
          <label className="block text-sm text-white/60 mb-2">
            What concept are you struggling with?
          </label>

          <textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is entropy in thermodynamics?"
            className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/40 outline-none resize-none"
          />

          <div className="flex justify-end mt-4">
            <button
              onClick={explain}
              disabled={loading || !question.trim()}
              className="px-6 py-3 rounded-2xl font-bold bg-amber-400 hover:bg-amber-500 text-purple-900 disabled:opacity-50"
            >
              {loading ? "Explaining…" : "Explain"}
            </button>
          </div>
        </div>

        {/* Output */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 border border-white/20 rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">
              {result.title || "Explanation"}
            </h2>

            <div className="space-y-6">
              {result.sections.map((sec, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-lg mb-1">
                    {idx + 1}. {sec.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {result.sources.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold mb-2 text-white/70">
                  Sources
                </h4>
                <ul className="text-sm text-white/60 space-y-1">
                  {result.sources.map((s, i) => (
                    <li key={i}>• {s.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 text-xs text-white/40">
              This tool is for learning support only.  
              Do not submit AI-generated content as your own academic work.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
