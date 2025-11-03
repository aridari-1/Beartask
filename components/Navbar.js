import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const loadUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role) setRole(profile.role);
      }
      setUserLoaded(true);
    };
    loadUserRole();
  }, []);

  const defaultLinks = [
    { name: "Browse Tasks", path: "/browse" },
    { name: "Profile", path: "/profile" },
  ];

  const posterLinks = [
    { name: "Browse Tasks", path: "/browse" },
    { name: "Post Task", path: "/post" },
    { name: "Profile", path: "/profile" },
  ];

  const performerLinks = [
    { name: "Browse Tasks", path: "/browse" },
    { name: "Perform Task", path: "/performer-home" },
    { name: "Profile", path: "/profile" },
  ];

  const linksToShow =
    role === "poster"
      ? posterLinks
      : role === "performer"
      ? performerLinks
      : defaultLinks;

  return (
    <motion.nav
      className="bg-white/10 backdrop-blur-md border-b border-white/20 text-white sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-wide"
        >
          <img src="/logo.png" alt="BearTask logo" className="h-8 w-8" />
          <span>BearTask</span>
        </Link>

        {/* Dynamic Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {userLoaded ? (
            <>
              {linksToShow.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="hover:text-amber-300 transition"
                >
                  {link.name}
                </Link>
              ))}

              {/* Static informational links */}
              <Link
                href="/about"
                className="hover:text-amber-300 transition font-medium"
              >
                About
              </Link>
              <Link
                href="/trust"
                className="hover:text-amber-300 transition font-medium"
              >
                Trust Center
              </Link>
            </>
          ) : (
            <span className="text-white/70">Loading...</span>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
