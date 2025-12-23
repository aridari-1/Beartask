import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Ambassador() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [activeCollection, setActiveCollection] = useState(null);
  const [draftCollections, setDraftCollections] = useState([]);
  const [openingId, setOpeningId] = useState(null);

  const canOpen = useMemo(() => {
    return (
      !!profile?.is_student &&
      !!profile?.is_ambassador &&
      !activeCollection
    );
  }, [profile, activeCollection]);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const u = authData?.user || null;

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      // Load profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      setProfile(prof || null);

      // Load ambassador's active collection
      const { data: active } = await supabase
        .from("collections")
        .select("*, items(is_sold)")
        .eq("opened_by", u.id)
        .eq("status", "active")
        .maybeSingle();

      if (active) {
        const soldCount = (active.items || []).filter((x) => x.is_sold).length;
        const totalCount = (active.items || []).length;
        setActiveCollection({
          ...active,
          soldCount,
          totalCount,
        });
      } else {
        setActiveCollection(null);
      }

      // Load draft collections
      const { data: closed } = await supabase
        .from("collections")
        .select("id, title, description, cover_image_url, created_at")
        .eq("status", "closed")
        .order("created_at", { ascending: true });

      setDraftCollections(closed || []);
      setLoading(false);
    };

    load();
  }, [router]);

  const openCollection = async (collectionId) => {
    try {
      setOpeningId(collectionId);

      const { data, error } = await supabase.rpc("open_collection", {
        p_collection_id: collectionId,
      });

      if (error) throw error;

      router.push(`/collections/${data.id}`);
    } catch (err) {
      console.error("Open collection error:", err);
      alert(err?.message || "Could not open collection. Try again.");
    } finally {
      setOpeningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading ambassador dashboard…
      </div>
    );
  }

  if (!profile?.is_student || !profile?.is_ambassador) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-2">Ambassador Dashboard</h1>
          <p className="text-gray-600">
            Only verified student ambassadors can open and run collections.
          </p>
          <div className="mt-4">
            <Link href="/collections" className="underline text-black">
              Go to Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Ambassador Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Open one collection at a time, promote it, and earn 5% when it sells out.
        </p>

        {/* Active Collection */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Active Collection</h2>

          {activeCollection ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-bold text-lg">{activeCollection.title}</div>
                  <div className="text-sm text-gray-600">
                    Progress: {activeCollection.soldCount} /{" "}
                    {activeCollection.totalCount} sold
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/collections/${activeCollection.id}`)
                    }
                    className="px-4 py-2 rounded-lg bg-black text-white"
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/collections/${activeCollection.id}`
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-gray-200"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                You must finish this collection before opening another one.
              </p>
            </>
          ) : (
            <p className="text-gray-500">
              You don’t have an active collection right now. Open one below.
            </p>
          )}
        </div>

        {/* Draft Collections */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Available Draft Collections
          </h2>

          {!canOpen && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              You already have an active collection. Finish it first to open
              another.
            </div>
          )}

          {draftCollections.length === 0 ? (
            <p className="text-gray-500">
              No draft collections available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftCollections.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-xl overflow-hidden bg-white"
                >
                  <div className="h-32 bg-gray-100">
                    {c.cover_image_url ? (
                      <img
                        src={c.cover_image_url}
                        alt={c.title}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="font-bold">{c.title}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {c.description || "Draft collection ready to open."}
                    </div>

                    <button
                      disabled={!canOpen || openingId === c.id}
                      onClick={() => openCollection(c.id)}
                      className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold ${
                        !canOpen
                          ? "bg-gray-200 text-gray-500"
                          : "bg-black text-white hover:opacity-90"
                      }`}
                    >
                      {openingId === c.id ? "Opening…" : "Open this collection"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-sm">
          <Link href="/collections" className="underline">
            View public collections
          </Link>
        </div>
      </div>
    </div>
  );
}
