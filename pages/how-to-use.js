import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function HowToUse() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userRole, setUserRole] = useState("");

  // 🧠 Tutorial slides
  const slides = [
    {
      title: "Welcome to BearTask 🐻",
      text: "BearTask connects college students to help each other with everyday tasks.",
      icon: "🎓",
    },
    {
      title: "Post or Accept Tasks ✍️",
      text: "Posters describe what they need help with. Performers browse available tasks and choose the ones they can complete.",
      icon: "🧾",
    },
    {
      title: "Meet, Complete & Rate 🤝",
      text: "After the task is done, the performer marks it as completed. Both sides should leave ratings to build their campus reputation. Performers must rate the poster after completing each task, otherwise they won’t be able to accept another task",
      icon: "⭐",
    },
    {
      title: "Important Guidelines ⚠️",
      text: "All payments and exchanges are handled by hand, outside of BearTask; the app does not process any money.",
      icon: "💵",
    },
  ];

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ Skip tutorial if already seen
      if (localStorage.getItem("beartask_tutorial_done")) {
        redirectByRole();
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) setUserRole(profile.role);
    };

    init();
  }, [router]);

  const redirectByRole = () => {
    if (userRole === "poster") router.push("/poster-home");
    else if (userRole === "performer") router.push("/performer-home");
    else router.push("/role-select");
  };

  const handleFinish = () => {
    localStorage.setItem("beartask_tutorial_done", "true");
    redirectByRole();
  };

  const next = () => setStep((prev) => Math.min(prev + 1, slides.length - 1));
  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white px-6 py-10 relative overflow-hidden">
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

          {/* Navigation */}
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

          {/* Progress dots */}
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
