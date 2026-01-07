import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function CollectionDetail() {
  const router = useRouter();
  const { id, ref } = router.query; // ✅ ADD: read ambassador ref

  const [collection, setCollection] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadCollection = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Load collection error:", error);

      setCollection(data || null);
      setLoading(false);
    };

    loadCollection();
  }, [id]);

  // ✅ load profile (non-blocking)
  useEffect(() => {
    const loadProfile = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("is_ambassador")
        .eq("id", auth.user.id)
        .single();

      setProfile(prof || null);
    };

    loadProfile();
  }, []);

  const isSoldOut = collection?.status === "sold_out";
  const isAmbassador = profile?.is_ambassador === true;

  const supportNow = async (amount) => {
    if (busy || isSoldOut || isAmbassador) return;

    setBusy(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // ✅ ADD: preserve return URL + ambassador ref
        const returnUrl = `/collections/${id}${ref ? `?ref=${ref}` : ""}`;
        localStorage.setItem("beartask_return_url", returnUrl);
        router.push("/login");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error("Missing auth session");
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          supportAmount: amount,
          collectionId: id,
          ambassadorRef: ref || null, // ✅ ADD: pass ambassador ref
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stripe error");

      window.location.href = data.url;
    } catch (err) {
      console.error("Support error:", err);
      setErrorMsg(err.message || "Something went wrong.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading collection…
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Collection not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/collections"
          className="text-white/80 hover:text-white underline text-sm"
        >
          ← Back to collections
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="bg-white/10 border border-white/15 rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold">{collection.title}</h1>

            <p className="text-white/85 mt-3 leading-relaxed">
              {collection.description ||
                "This collection supports students through curated digital collectibles."}
            </p>

            {isAmbassador && (
              <div className="mt-5 bg-amber-500/20 border border-amber-400/40 rounded-xl p-4 text-sm text-amber-100">
                ⚠️ Ambassadors cannot support collections.
              </div>
            )}

            {isSoldOut && (
              <div className="mt-5 bg-red-500/20 border border-red-400/40 rounded-xl p-4 text-sm text-red-100">
                🚫 This collection is sold out. Thank you for the support!
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-sm text-red-100">
                {errorMsg}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[5, 8, 10, 15].map((amt) => (
                <button
                  key={amt}
                  disabled={busy || isSoldOut || isAmbassador}
                  onClick={() => supportNow(amt)}
                  className={`font-semibold py-3 rounded-xl transition
                    ${
                      isSoldOut || isAmbassador
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-500 text-purple-900"
                    }
                    disabled:opacity-60`}
                >
                  ${amt} Support
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
