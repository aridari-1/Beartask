import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import "../styles/globals.css";

const publicRoutes = [
  "/",
  "/login",
  "/collections",
  "/collections/[id]",
];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 🔓 Not logged in
      if (!session) {
        if (!publicRoutes.includes(router.pathname)) {
          await router.replace("/login");
        }
        if (mounted) setLoading(false);
        return;
      }

      // 🔍 Check profile (safe)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // 🚫 No profile → create profile
      if (!profile) {
        if (router.pathname !== "/create-profile") {
          await router.replace("/create-profile");
        }
        if (mounted) setLoading(false);
        return;
      }

      // 📘 Profile exists → check tutorial
      const hasSeenHowTo = localStorage.getItem("beartask_how_to_done");

      if (!hasSeenHowTo) {
        if (router.pathname !== "/how-to-use") {
          await router.replace("/how-to-use");
        }
        if (mounted) setLoading(false);
        return;
      }

      // 🚪 Prevent going back to auth/tutorial pages
      if (
        ["/login", "/create-profile", "/how-to-use"].includes(router.pathname)
      ) {
        await router.replace("/collections");
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading…
      </div>
    );
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
