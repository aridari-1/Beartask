import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function HowToUse() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      title: "Welcome to BearTask 🐻",
      text: "BearTask connects college students with people who want to support them by purchasing digital collectibles.",
      icon: "🤝",
    },
    {
      title: "How It Works 🔁",
      text: "Each collection supports students. When you support a collection, you receive a unique digital item.",
      icon: "🎨",
    },
    {
      title: "Direct Support 💛",
      text: "Your support helps students financially. Digital items may be collectible or resellable in the future.",
      icon: "💼",
    },
    {
      title: "Fair Use ⭐",
      text: "Please use BearTask respectfully. Each collection exists to support students.",
      icon: "⭐",
    },
  ];

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const hasSeen = localStorage.getItem("beartask_how_to_done");

      if (hasSeen === "true") {
        router.replace("/collections");
        return;
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleFinish = () => {
    localStorage.setItem("beartask_how_to_done", "true");
    router.replace("/collections");
  };

  const next = () => setStep((prev) => Math.min(prev + 1, slides.length - 1));
  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center text-white px-6 py-10 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">{slides[step].icon}</div>
          <h1 className="text-2xl font-bold mb-2">{slides[step].title}</h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {slides[step].text}
          </p>

          <div className="flex justify-between items-center mt-6">
            {step > 0 ? (
              <button
                onClick={back}
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < slides.length - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold px-3 py-1 rounded-lg text-sm"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center justify-center w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
              >
                Start Using BearTask →
              </button>
            )}
          </div>

          <div className="flex justify-center mt-5 space-x-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === step ? "bg-amber-400" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
