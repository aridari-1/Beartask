import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user || null);
      setUserLoaded(true);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <motion.nav
      className="bg-white/10 backdrop-blur-md border-b border-white/20 text-white sticky top-0 z-50"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-wide"
        >
          <img src="/logo.png" alt="BearTask logo" className="h-8 w-8" />
          <span>BearTask</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link href="/community" className="hover:text-amber-300 transition">
            Community
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full bg-black text-white"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                👤
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg overflow-hidden text-sm"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-nfts"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My NFTs
                    </Link>
                    <Link
                      href="/trust"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Trust Center
                    </Link>
                    <Link
                      href="/about"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      About
                    </Link>
                    <div className="border-t" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden text-white/90"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white/10 backdrop-blur-md border-t border-white/10 px-4 pb-4 text-sm">
          <Link href="/community" className="block py-2">
            Community
          </Link>

          {!user && (
            <Link href="/login" className="block py-2 font-semibold">
              Login
            </Link>
          )}

          {user && (
            <>
              <Link href="/profile" className="block py-2">
                Profile
              </Link>
              <Link href="/my-nfts" className="block py-2">
                My NFTs
              </Link>
              <Link href="/trust" className="block py-2">
                Trust Center
              </Link>
              <Link href="/about" className="block py-2">
                About
              </Link>
              <button
                onClick={logout}
                className="block py-2 text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </motion.nav>
  );
}
