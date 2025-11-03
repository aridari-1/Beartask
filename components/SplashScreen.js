import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const forcedSplash = localStorage.getItem("beartask_show_now");
    const alreadyShown = localStorage.getItem("beartask_splash_shown");

    // Show splash if forced or not shown yet
    if (forcedSplash || !alreadyShown) {
      setShow(true);
      localStorage.setItem("beartask_splash_shown", "true");
      localStorage.removeItem("beartask_show_now"); // reset trigger

      const timer = setTimeout(() => setShow(false), 2000); // visible for 2s
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src="/logo.png"
            alt="BearTask logo"
            className="w-32 h-32 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
