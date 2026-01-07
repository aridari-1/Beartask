import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

function CollapsibleCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
        <span className="text-white/50 text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

export default function Ambassador() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [activeCollection, setActiveCollection] = useState(null);
  const [draftCollections, setDraftCollections] = useState([]);
  const [completedCollections, setCompletedCollections] = useState([]);
  const [payouts, setPayouts] = useState([]);

  const [openingId, setOpeningId] = useState(null);
  const [copied, setCopied] = useState(false); // ✅ ADD

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: { user: u },
      } = await supabase.auth.getUser();

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      setProfile(prof || null);

      const { data: active } = await supabase
        .from("collections")
        .select("*, items(is_sold)")
        .eq("opened_by", u.id)
        .eq("status", "active")
        .maybeSingle();

      if (active) {
        const soldCount = (active.items || []).filter((x) => x.is_sold).length;
        const totalCount = (active.items || []).length;
        setActiveCollection({ ...active, soldCount, totalCount });
      }

      const { data: drafts } = await supabase
        .from("collections")
        .select("id, title, description, created_at, opened_by, status")
        .eq("status", "closed")
        .or(`opened_by.is.null,opened_by.eq.${u.id}`)
        .order("created_at", { ascending: true });

      setDraftCollections(drafts || []);

      const { data: completed } = await supabase
        .from("collections")
        .select("id, title, cagnotte_total, completed_at")
        .eq("opened_by", u.id)
        .eq("status", "sold_out")
        .order("completed_at", { ascending: false });

      setCompletedCollections(completed || []);

      const { data: payoutRows } = await supabase
        .from("payouts")
        .select("amount, status")
        .eq("user_id", u.id)
        .eq("role", "ambassador");

      setPayouts(payoutRows || []);
      setLoading(false);
    };

    load();
  }, [router]);

  const openCollection = async (collectionId) => {
    try {
      setOpeningId(collectionId);

      const { data: updated, error } = await supabase
        .from("collections")
        .update({
          status: "active",
          opened_by: user.id,
        })
        .eq("id", collectionId)
        .select("id")
        .single();

      if (error) throw error;

      router.push(`/collections/${updated.id}`);
    } catch (err) {
      console.error(err);
      alert("Could not open collection.");
    } finally {
      setOpeningId(null);
    }
  };

  // ✅ ADD: shareable link
  const shareLink = useMemo(() => {
    if (!activeCollection || !user) return null;
    return `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${activeCollection.id}?ref=${user.id}`;
  }, [activeCollection, user]);

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const earnings = useMemo(() => {
    let total = 0,
      paid = 0,
      pending = 0;

    payouts.forEach((p) => {
      const amt = Number(p.amount || 0);
      total += amt;
      p.status === "paid" ? (paid += amt) : (pending += amt);
    });

    return { total, paid, pending };
  }, [payouts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background-start)] to-[var(--background-end)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Ambassador Dashboard
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Promote collections and earn commissions
          </p>
        </header>

        <CollapsibleCard title="Active Collection" defaultOpen>
          {activeCollection ? (
            <>
              <h3 className="text-xl font-semibold">{activeCollection.title}</h3>
              <p className="text-white/50 text-sm mt-1">
                {activeCollection.soldCount}/{activeCollection.totalCount} sold
              </p>

              <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-4">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{
                    width: `${
                      (activeCollection.soldCount /
                        activeCollection.totalCount) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* ✅ ADD: Share link */}
              {shareLink && (
                <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/70 mb-2">
                    Share this link to promote your collection:
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareLink}
                      className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-xs text-white/80"
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-2 rounded-lg bg-amber-400 text-black font-semibold text-sm"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-white/50">No active collection</p>
          )}
        </CollapsibleCard>

        <CollapsibleCard title="Available Collections">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {draftCollections.map((c) => (
              <div
                key={c.id}
                className="bg-neutral-800/60 border border-white/10 rounded-xl p-4"
              >
                <h3 className="font-semibold">{c.title}</h3>
                <button
                  disabled={openingId === c.id}
                  onClick={() => openCollection(c.id)}
                  className="mt-4 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold hover:opacity-90"
                >
                  {openingId === c.id ? "Opening…" : "Open"}
                </button>
              </div>
            ))}
          </div>
        </CollapsibleCard>

        <Link href="/collections" className="text-sm underline text-white/60">
          View public collections
        </Link>
      </div>
    </div>
  );
}
