import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRouting = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      /* ------------------------------------------------------------
         1️⃣ PUBLIC ROUTES (no auth required)
         ------------------------------------------------------------ */
      const publicRoutes = [
        "/",
        "/login",
        "/success",
      ];

      if (!user) {
        if (!publicRoutes.includes(router.pathname)) {
          router.replace("/login");
        }
        setLoading(false);
        return;
      }

      /* ------------------------------------------------------------
         2️⃣ FETCH PROFILE (membership truth)
         ------------------------------------------------------------ */
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, has_joined")
        .eq("id", user.id)
        .maybeSingle();

      /* ------------------------------------------------------------
         3️⃣ NO PROFILE YET → CREATE PROFILE
         ------------------------------------------------------------ */
      if (!profile) {
        if (router.pathname !== "/create-profile") {
          router.replace("/create-profile");
        }
        setLoading(false);
        return;
      }

      /* ------------------------------------------------------------
         4️⃣ AUTH / SETUP PAGES GUARD
         ------------------------------------------------------------ */
      const setupPages = [
        "/login",
        "/create-profile",
        "/how-to-use",
      ];

      if (setupPages.includes(router.pathname)) {
        if (profile.has_joined) {
          router.replace("/community");
        }
        setLoading(false);
        return;
      }

      /* ------------------------------------------------------------
         5️⃣ PROTECTED COMMUNITY ACCESS
         ------------------------------------------------------------ */
      if (
        router.pathname.startsWith("/community") &&
        !profile.has_joined
      ) {
        router.replace("/create-profile");
        setLoading(false);
        return;
      }

      /* ------------------------------------------------------------
         6️⃣ LEGACY COLLECTIONS (ALLOWED, READ-ONLY)
         ------------------------------------------------------------ */
      // /collections and /collections/[id] are intentionally NOT gated

      setLoading(false);
    };

    handleRouting();
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading…
      </div>
    );
  }

  // Pages where we HIDE navbar/footer (optional)
  const hideLayout = ["/login"].includes(router.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <Component {...pageProps} />
      {!hideLayout && <Footer />}
    </>
  );
}
