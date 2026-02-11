import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  const [step, setStep] = useState("email"); // email | code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================
     1️⃣ REDIRECT IF ALREADY LOGGED IN
     ====================================================== */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.replace("/community");
      }
    });
  }, [router]);

  /* ======================================================
     2️⃣ SEND OTP
     ====================================================== */
  const sendCode = async (e) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@cub.uca.edu")) {
      setError("Only @cub.uca.edu emails are allowed.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("code");
  };

  /* ======================================================
     3️⃣ VERIFY OTP
     ====================================================== */
  const verifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error || !data?.session) {
      setError("Invalid or expired code.");
      setLoading(false);
      return;
    }

    // Check profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.session.user.id)
      .single();

    if (!profile) {
      router.replace("/create-profile");
    } else {
      router.replace("/community");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold mb-4 text-center">
          Sign in to BearTask 🐻
        </h1>

        <p className="text-white/70 text-center mb-6">
          UCA students only — <strong>@cub.uca.edu</strong>
        </p>

        {/* ================= EMAIL STEP ================= */}
        {step === "email" && (
          <form onSubmit={sendCode} className="space-y-4">
            <input
              type="email"
              placeholder="you@cub.uca.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send verification code"}
            </button>
          </form>
        )}

        {/* ================= CODE STEP ================= */}
        {step === "code" && (
          <form onSubmit={verifyCode} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-amber-400 text-center tracking-widest"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-purple-900 font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & continue"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-white/60 hover:text-white mt-2"
            >
              Change email
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-red-300 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
