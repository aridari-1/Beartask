import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import "../styles/globals.css";

import { SessionContextProvider } from "@supabase/auth-helpers-react";

const publicRoutes = [
  "/",
  "/login",
  "/collections",
  "/collections/[id]",
  "/success",
  "/trust-center",
];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 🔐 Wait for auth to be ready
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setAuthReady(true);

      // 🔓 Not logged in
      if (!session) {
        if (!publicRoutes.includes(router.pathname)) {
          // ✅ ADD: preserve full return URL (including ambassador ref)
          if (typeof window !== "undefined") {
            const fullPath =
              router.asPath || `${router.pathname}${window.location.search}`;
            localStorage.setItem("beartask_return_url", fullPath);
          }

          await router.replace("/login");
        }
        setLoading(false);
        return;
      }

      // 🔍 Check profile ONLY after auth is ready
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      // ❗ IMPORTANT FIX:
      // If Supabase cannot read the profile (RLS / transient issue),
      // do NOT redirect to create-profile.
      if (profileErr) {
        console.error("Profile select error:", profileErr.message);
        setLoading(false);
        return;
      }

      // 🚫 Profile truly does not exist → create profile
      if (!profile) {
        if (router.pathname !== "/create-profile") {
          await router.replace("/create-profile");
        }
        setLoading(false);
        return;
      }

      // 📘 Check tutorial
      const hasSeenHowTo =
        typeof window !== "undefined" &&
        localStorage.getItem("beartask_how_to_done");

      if (!hasSeenHowTo) {
        if (router.pathname !== "/how-to-use") {
          await router.replace("/how-to-use");
        }
        setLoading(false);
        return;
      }

      // 🚪 Prevent returning to auth/setup pages
      if (
        ["/login", "/create-profile", "/how-to-use"].includes(router.pathname)
      ) {
        await router.replace("/collections");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      if (!authReady) return;
      init();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router.pathname, authReady]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading…
      </div>
    );
  }

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  );
}
