import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email"); // email | verify
  const [loading, setLoading] = useState(false);

  // STEP 1 — SEND CODE
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
      });
      if (error) throw error;

      // Move to verification step
      setStep("verify");
    } catch (err) {
      console.error(err);
      alert("Failed to send login code.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — VERIFY CODE
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "email",
      });

      if (error) throw error;

      // ✅ ADD: return to original page (collection + ambassador ref)
      const returnUrl = localStorage.getItem("beartask_return_url");

      if (returnUrl) {
        localStorage.removeItem("beartask_return_url");
        router.push(returnUrl);
      } else {
        // Default fallback
        router.push("/collections");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 px-4">
      <form
        onSubmit={step === "email" ? handleSendCode : handleVerifyCode}
        className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full text-white"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Sign in</h1>

        <p className="text-sm text-white/80 mb-4 text-center">
          {step === "email"
            ? "Enter your email to receive a login code."
            : "Enter the 6-digit code sent to your email."}
        </p>

        {step === "email" && (
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white/60 focus:outline-none mb-4"
          />
        )}

        {step === "verify" && (
          <input
            type="text"
            required
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white/60 focus:outline-none mb-4 text-center tracking-widest"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-purple-900 font-semibold py-3 rounded-xl transition"
        >
          {loading
            ? "Please wait..."
            : step === "email"
            ? "Send login code"
            : "Verify & continue"}
        </button>
      </form>
    </div>
  );
}
