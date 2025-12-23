import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function CollectionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revealItem, setRevealItem] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadCollection = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Load collection error:", error);
      }

      setCollection(data || null);
      setLoading(false);
    };

    loadCollection();
  }, [id]);

  const supportNow = async (amount) => {
    setBusy(true);
    setRevealItem(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        localStorage.setItem("beartask_return_collection", id);
        router.push("/login");
        setBusy(false);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", id)
        .eq("is_sold", false)
        .order("created_at", { ascending: true })
        .limit(1);

      if (itemsError) throw itemsError;

      const chosen = items?.[0];
      if (!chosen) {
        alert("This collection is sold out.");
        setBusy(false);
        return;
      }

      const { error: soldError } = await supabase
        .from("items")
        .update({ is_sold: true })
        .eq("id", chosen.id);

      if (soldError) throw soldError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_student")
        .eq("id", user.id)
        .single();

      const isStudent = !!profile?.is_student;

      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: user.id,
            item_id: chosen.id,
            collection_id: id,
            price: amount,
            is_student: isStudent,
            eligible_for_lottery: isStudent,
          },
        ])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      await supabase.from("lottery_tickets").insert({
        collection_id: id,
        user_id: user.id,
      });

      setRevealItem(chosen);
      router.push(`/purchase-success/${purchase.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading collection...
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
      <div className="max-w-4xl mx-auto">
        <Link href="/collections" className="text-white/80 hover:text-white underline text-sm">
          ← Back to collections
        </Link>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="bg-white/10 border border-white/15 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-56 bg-white/10">
              {collection.cover_image_url ? (
                <img
                  src={collection.cover_image_url}
                  alt={collection.title}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="h-56 flex items-center justify-center text-white/60">
                  Cover image
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold">{collection.title}</h1>
              <p className="text-white/85 mt-2">
                {collection.description ||
                  "This collection supports students through curated digital collectibles."}
              </p>

              {/* ✅ ADDED: FAIR LOTTERY NOTICE */}
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white/90">
                <strong>Fair Lottery Rule:</strong> Student supporters receive
                <strong> one equal lottery entry per collection</strong>. Buying
                multiple items does not increase your chances. Winners are selected
                automatically and fairly once the collection sells out.
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <button
                  disabled={busy}
                  onClick={() => supportNow(5)}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-purple-900 font-semibold py-3 rounded-xl transition"
                >
                  $5 — Support & receive
                </button>
                <button
                  disabled={busy}
                  onClick={() => supportNow(15)}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-purple-900 font-semibold py-3 rounded-xl transition"
                >
                  $15 — Support & receive
                </button>
                <button
                  disabled={busy}
                  onClick={() => supportNow(30)}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-purple-900 font-semibold py-3 rounded-xl transition"
                >
                  $30 — Support & receive
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
