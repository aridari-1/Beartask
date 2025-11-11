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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      validateEmail(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        validateEmail(session);
        if (
          !session &&
          !["/login", "/", "/role-select", "/how-to-use", "/create-profile"].includes(
            router.pathname
          )
        )
          router.push("/login");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // ✅ Validate allowed student email domains — only for performers
  const validateEmail = async (session) => {
    if (!session) return;
    const email = session.user?.email?.toLowerCase() || "";
    const allowedDomains = ["cub.uca.edu", "hendrix.edu"];
    const domain = email.split("@")[1];
    const isValid = allowedDomains.includes(domain);
    setValidEmail(isValid);

    const role = localStorage.getItem("beartask_role");

    // 🚨 Auto sign out only if invalid performer
    if (role === "performer" && !isValid) {
      await supabase.auth.signOut();
      localStorage.removeItem("beartask_splash_shown");
      router.push("/login");
    }
  };

  // 🔀 Redirect logged-in users away from "/" ONLY after they’ve completed the tutorial
  useEffect(() => {
    const redirectByRole = async () => {
      if (!session || router.pathname !== "/") return;

      const hasSeenTutorial =
        typeof window !== "undefined" &&
        localStorage.getItem("beartask_tutorial_done") === "true";

      // ⛔ Do not redirect from "/" until the tutorial is completed
      if (!hasSeenTutorial) return;

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
    };
    redirectByRole();
  }, [session, router]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (
        !session ||
        ["/login", "/create-profile", "/role-select", "/how-to-use"].includes(
          router.pathname
        )
      )
        return;

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

  const publicRoutes = ["/", "/login", "/role-select", "/how-to-use", "/create-profile"];
  if (!session && !publicRoutes.includes(router.pathname)) return null;

  return (
    <>
      <Head>
        <title>BearTask</title>
        <meta
          name="description"
          content="A student-to-student campus task marketplace."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <>
          <AnimatePresence>{showSplash && <SplashScreen visible />}</AnimatePresence>
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
