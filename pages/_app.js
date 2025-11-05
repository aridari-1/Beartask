import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import SplashScreen from "../components/SplashScreen";
import { AnimatePresence } from "framer-motion";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(undefined);
  const [validEmail, setValidEmail] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";

  // 🧠 Fetch current session & listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      validateEmail(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        validateEmail(session);
        if (!session && router.pathname !== "/login") router.push("/login");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // ✅ Validate allowed student email domains
  const validateEmail = async (session) => {
    if (!session) return;
    const email = session.user?.email?.toLowerCase() || "";
    const allowedDomains = ["cub.uca.edu", "hendrix.edu"];
    const domain = email.split("@")[1];
    const isValid = allowedDomains.includes(domain);

    setValidEmail(isValid);

    // 🚨 Auto sign out if invalid email detected
    if (!isValid) {
      await supabase.auth.signOut();
      localStorage.removeItem("beartask_splash_shown");
      router.push("/login");
    }
  };

  // 🚀 Redirect root users to correct dashboard
  useEffect(() => {
    const redirectByRole = async () => {
      if (session && router.pathname === "/") {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error checking role:", error);
          return;
        }

        if (profile?.role === "poster") router.push("/poster-home");
        else if (profile?.role === "performer") router.push("/performer-home");
      }
    };
    redirectByRole();
  }, [session, router]);

  // ✅ NEW: Auto-check for users without a role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!session || router.pathname === "/login" || router.pathname === "/create-profile" || router.pathname === "/role-select") return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error verifying user role:", error);
          return;
        }

        if (!profile?.role) {
          console.warn("User missing role, redirecting to role-select...");
          router.push("/role-select");
        }
      } catch (err) {
        console.error("Error checking user role:", err);
      }
    };

    checkUserRole();
  }, [session, router]);

  // 🎬 Show splash screen once per login
  useEffect(() => {
    const alreadyShown = localStorage.getItem("beartask_splash_shown");
    if (!alreadyShown && session) {
      setShowSplash(true);
      localStorage.setItem("beartask_splash_shown", "true");

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // 🕓 Loading screen while session loads
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // 🔒 Hide content until logged in (except login page)
  if (!session && !isLoginPage) return null;

  // 🌈 Global layout wrapper (mobile-friendly)
  return (
    <>
      <Head>
        <title>BearTask</title>
        <meta
          name="description"
          content="A student-to-student campus task marketplace."
        />
        {/* ✅ Ensures proper scaling on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <>
          <AnimatePresence>
            {showSplash && <SplashScreen visible />}
          </AnimatePresence>
          <Layout>
            <div className="min-h-screen w-full flex flex-col items-center justify-start px-3 sm:px-4 md:px-8">
              <Component {...pageProps} />
            </div>
          </Layout>
        </>
      )}
    </>
  );
}
