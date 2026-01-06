import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { useSession, useUser } from "@supabase/auth-helpers-react";

export default function ClaimPayoutPage() {
  const router = useRouter();
  const session = useSession();
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [payout, setPayout] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady || !session || !user) return;

    const rawCollectionId = router.query.collection;
    const collectionId = Array.isArray(rawCollectionId)
      ? rawCollectionId[0]
      : rawCollectionId;

    if (!collectionId) {
      setError("Invalid claim link.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      // 1️⃣ Profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, stripe_account_id")
        .eq("id", user.id)
        .single();

      if (profErr) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setProfile(prof);

      // 2️⃣ Collection
      const { data: col, error: colErr } = await supabase
        .from("collections")
        .select("id, title, status")
        .eq("id", collectionId)
        .single();

      if (colErr || !col) {
        setError("Collection not found.");
        setLoading(false);
        return;
      }

      setCollection(col);

      // 3️⃣ Payout (ROLE IS TRUSTED FROM DB)
      const { data: payoutRow, error: payoutErr } = await supabase
        .from("payouts")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("user_id", user.id)
        .single();

      if (payoutErr || !payoutRow) {
        setError("No payout available for you.");
        setLoading(false);
        return;
      }

      setPayout(payoutRow);
      setLoading(false);
    };

    load();
  }, [router.isReady, session, user]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading payout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#ff6b6b" }}>{error}</p>
      </div>
    );
  }

  const requestPayout = async () => {
    const res = await fetch("/api/payouts/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutId: payout.id }),
    });

    if (!res.ok) {
      alert("Failed to request payout.");
      return;
    }

    alert("Payout requested. Awaiting admin approval.");
    router.reload();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Claim your payout</h2>

        <div style={styles.row}>
          <span>Collection</span>
          <strong>{collection?.title}</strong>
        </div>

        <div style={styles.row}>
          <span>Role</span>
          <strong style={{ textTransform: "capitalize" }}>
            {payout.role}
          </strong>
        </div>

        <div style={styles.row}>
          <span>Amount</span>
          <strong>${payout.amount}</strong>
        </div>

        <div style={styles.row}>
          <span>Status</span>
          <strong>{payout.status}</strong>
        </div>

        {!profile.stripe_account_id && (
          <a href="/api/stripe/create-account-link">
            <button style={styles.primaryBtn}>
              Connect Stripe to get paid
            </button>
          </a>
        )}

        {profile.stripe_account_id && payout.status === "pending" && (
          <button style={styles.primaryBtn} onClick={requestPayout}>
            Request payout
          </button>
        )}

        {payout.status === "requested" && (
          <p style={styles.info}>
            Your payout request has been sent. Admin approval pending.
          </p>
        )}

        {payout.status === "paid" && (
          <p style={styles.success}>
            ✅ Payout completed. Funds sent to your Stripe account.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------ styles ------------------ */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  center: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: 24,
    color: "#e5e7eb",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    marginTop: 16,
    padding: "12px 16px",
    background: "#2563eb",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },
  info: {
    marginTop: 16,
    color: "#93c5fd",
    fontSize: 14,
    textAlign: "center",
  },
  success: {
    marginTop: 16,
    color: "#4ade80",
    fontSize: 14,
    textAlign: "center",
  },
};
