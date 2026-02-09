import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    // 🔒 ENFORCE UCA EMAIL ONLY
    if (!normalizedEmail.endsWith("@cub.uca.edu")) {
      alert("BearTask is currently only available to UCA students (@cub.uca.edu).");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your UCA email for the login code.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      // 🔁 Return user to intended page if exists
      const returnUrl = localStorage.getItem("beartask_return_url");
      if (returnUrl) {
        localStorage.removeItem("beartask_return_url");
        router.replace(returnUrl);
        return;
      }

      // 🔍 Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        router.replace("/create-profile");
      } else {
        router.replace("/community");
      }
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Sign in to BearTask 🐻
        </h1>

        <p className="text-white/70 text-center mb-6">
          UCA students only — use your <strong>@cub.uca.edu</strong> email.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Sending code..." : "Send login code"}
          </button>
        </form>
      </div>
    </div>
  );
}
