import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Login() {
  const [step, setStep] = useState(1); // 1 = select school, 2 = enter email, 3 = verify code
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("beartask_role");
    setRole(storedRole || "");
    if (storedRole === "poster") {
      setStep(2); // Skip school selection for posters
      setSchool("General");
    }
  }, []);

  // 🏫 Allowed school and testing domains
  const allowedDomains = {
    "University of Central Arkansas": "@cub.uca.edu",
    "Hendrix College": "@hendrix.edu",
  };

  // 🔹 Step 1: Send verification code
  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const normalizedEmail = email.toLowerCase().trim();
    const requiredDomain = allowedDomains[school];

    if (role === "performer") {
      if (!normalizedEmail.endsWith(requiredDomain)) {
        setError(
          `❌ Please use your valid ${school} email (must end with ${requiredDomain})`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      setShowVerifyCode(true);
      setMessage("✅ A verification code has been sent to your email.");
    } catch (err) {
      console.error("Send code error:", err);
      setError("Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2: Verify code & check profile
  const verifyCodeNow = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: verifyCode,
        type: "email",
      });

      if (error) throw error;
      if (!data?.user) throw new Error("Verification failed");

      const user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(profileError);
        throw new Error("Error checking profile");
      }

      if (!profile) {
        setMessage("✨ First time here! Redirecting to profile setup...");
        setTimeout(() => {
          window.location.href = "/create-profile";
        }, 1500);
      } else {
        setMessage("✅ Verified successfully! Redirecting...");
        setTimeout(() => {
          window.location.href = "/role-select";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Could not verify code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center px-4">
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome to BearTask 🐻
        </h1>
        <p className="text-white/80 mb-6 text-center">
          Log in with your {role === "poster" ? "email" : "verified school email"} to continue.
        </p>

        {/* Step 1: Choose School */}
        {step === 1 && role === "performer" && (
          <div className="space-y-4">
            <p className="text-center mb-2 font-semibold">Select Your School:</p>
            {Object.keys(allowedDomains).map((schoolName) => (
              <button
                key={schoolName}
                onClick={() => {
                  setSchool(schoolName);
                  setStep(2);
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
              >
                {schoolName}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Enter Email & Request Code */}
        {step === 2 && !showVerifyCode && (
          <form onSubmit={sendCode} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                {role === "performer" ? `${school} Email Address` : "Your Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder={role === "performer" ? `you${allowedDomains[school]}` : "you@email.com"}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>

            {role === "performer" && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-white/80 underline text-sm mt-2"
              >
                ← Back to school selection
              </button>
            )}
          </form>
        )}

        {/* Step 3: Enter Verification Code */}
        {step === 2 && showVerifyCode && (
          <form onSubmit={verifyCodeNow} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Enter Verification Code</label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-amber-400 outline-none tracking-widest text-center text-lg"
                placeholder="6-digit code"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowVerifyCode(false);
                setEmail("");
                setStep(2);
              }}
              className="w-full text-white/80 underline text-sm mt-2"
            >
              ← Back to email entry
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
