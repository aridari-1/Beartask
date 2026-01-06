import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function date(v) {
  if (!v) return "";
  return new Date(v).toLocaleString();
}

const ROLE_ORDER = ["winner", "ambassador", "creator"];

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [collections, setCollections] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  async function requireSession() {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      router.push("/login");
      return null;
    }
    return token;
  }

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return false;

    const { data: prof } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    return !!prof?.is_admin;
  }

  async function fetchPayouts() {
    setError(null);

    const { data, error } = await supabase
      .from("payouts")
      .select(`
        id,
        role,
        amount,
        status,
        created_at,
        collection_id,
        stripe_transfer_id,
        profiles:user_id ( email ),
        collections (
          id,
          title,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    const grouped = {};
    data.forEach((p) => {
      if (!grouped[p.collection_id]) {
        grouped[p.collection_id] = {
          collection: p.collections,
          payouts: [],
        };
      }
      grouped[p.collection_id].payouts.push(p);
    });

    // 🔑 enforce role order
    Object.values(grouped).forEach((g) => {
      g.payouts.sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
      );
    });

    setCollections(Object.values(grouped));
  }

  async function sendEmail(collectionId, role) {
    setToast(null);
    setError(null);

    const token = await requireSession();
    if (!token) return;

    const res = await fetch("/api/send-payout-emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ collectionId }),
    });

    if (!res.ok) {
      setError("Failed to send email");
      return;
    }

    setToast(`✅ ${role} email sent`);
  }

  // ✅ OPTION A: approve + pay in ONE STEP
  async function approve(payoutId) {
    setError(null);
    setToast(null);

    const token = await requireSession();
    if (!token) return;

    const res = await fetch("/api/payouts/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payoutId }),
    });

    if (!res.ok) {
      const j = await res.json();
      setError(j.error || "Approval failed");
      return;
    }

    setToast("💸 Payout approved & sent");
    fetchPayouts();
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ok = await checkAdmin();
      setIsAdmin(ok);
      if (ok) await fetchPayouts();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
        Loading payouts…
      </div>
    );
  }

  if (!isAdmin) {
    return <div className="p-6 text-red-500">Not authorized</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Payouts</h1>

      {toast && (
        <div className="mb-4 bg-green-500/20 border border-green-400 p-3 rounded-lg">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {collections.map(({ collection, payouts }) => (
          <div
            key={collection.id}
            className="bg-white/10 border border-white/20 rounded-xl p-4"
          >
            <div
              className="cursor-pointer flex justify-between items-center"
              onClick={() =>
                setExpanded(expanded === collection.id ? null : collection.id)
              }
            >
              <div>
                <h2 className="text-lg font-semibold">{collection.title}</h2>
                <p className="text-sm text-white/70">
                  Sold out • {date(collection.created_at)}
                </p>
              </div>
              <span>{expanded === collection.id ? "▲" : "▼"}</span>
            </div>

            {expanded === collection.id && (
              <div className="mt-4 space-y-3">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-white/5 p-3 rounded-lg"
                  >
                    <div>
                      <div className="capitalize font-semibold">{p.role}</div>
                      <div className="text-xs text-white/70">
                        {p.profiles?.email}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">{money(p.amount)}</div>
                      <div className="text-xs text-white/70">{p.status}</div>
                    </div>

                    <div className="ml-4">
                      {p.status === "pending" && (
                        <button
                          onClick={() =>
                            sendEmail(collection.id, p.role)
                          }
                          className="bg-indigo-500 px-3 py-2 rounded-lg text-xs"
                        >
                          Send email
                        </button>
                      )}

                      {p.status === "requested" && (
                        <button
                          onClick={() => approve(p.id)}
                          className="bg-green-600 px-3 py-2 rounded-lg text-xs"
                        >
                          Approve & Pay
                        </button>
                      )}

                      {p.status === "paid" && (
                        <span className="text-green-400 font-semibold">
                          Paid ✔
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
