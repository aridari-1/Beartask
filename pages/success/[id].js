import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchPurchase = async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          created_at,
          fun_tasks (
            title,
            description
          ),
          items (
            title,
            media_url
          ),
          collections (
            title
          )
        `)
        .eq("id", id)
        .limit(1);

      if (!cancelled) {
        if (data && data.length > 0) {
          setPurchase(data[0]);
          setLoading(false);
        } else {
          // Retry a few times to allow webhook + RLS to settle
          if (attempts < 5) {
            setAttempts((a) => a + 1);
            setTimeout(fetchPurchase, 1200);
          } else {
            setLoading(false);
          }
        }
      }
    };

    fetchPurchase();

    return () => {
      cancelled = true;
    };
  }, [id, attempts]);

  if (loading) {
    return (
      <div style={styles.container}>
        Loading your NFT…
      </div>
    );
  }

  if (!purchase) {
    return (
      <div style={styles.container}>
        Purchase not found.
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>🎉 You received an NFT!</h1>

        <div style={styles.nftBox}>
          <img
            src={purchase.items?.media_url}
            alt={purchase.items?.title}
            style={styles.nftImage}
          />
        </div>

        <h2 style={styles.nftTitle}>{purchase.items?.title}</h2>
        <p style={styles.collectionText}>
          Collection: {purchase.collections?.title}
        </p>

        {purchase.fun_tasks && (
          <div style={styles.taskBox}>
            <h3 style={styles.taskTitle}>🔥 Your BearTask</h3>
            <p style={styles.taskLabel}>{purchase.fun_tasks.title}</p>
            <p style={styles.taskDesc}>{purchase.fun_tasks.description}</p>
          </div>
        )}

        <a
          href="https://discord.gg/J2JfGuV56a"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.discordBtn}
        >
          🐻 Want to show it off?  
          Post your BearTask in our Discord and see what others did 🚀
        </a>

        <div style={styles.buttonRow}>
          <button
            onClick={() => router.push("/collections")}
            style={styles.backBtn}
          >
            Back to collections
          </button>

          <button
            onClick={() => router.push("/my-nfts")}
            style={styles.nftBtn}
          >
            My NFTs
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #0f172a, #1e293b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    background: "#0f172a",
    fontSize: 16,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    maxWidth: 440,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    animation: "scaleFadeIn 0.6s ease-out",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  nftBox: {
    animation: "bounceFade 0.8s ease",
    marginBottom: 16,
  },
  nftImage: {
    width: "100%",
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  nftTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginTop: 8,
  },
  collectionText: {
    color: "#666",
    marginBottom: 20,
  },
  taskBox: {
    background: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    textAlign: "left",
    marginBottom: 24,
    border: "1px solid #e5e7eb",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 14,
    color: "#374151",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  backBtn: {
    padding: "10px 16px",
    borderRadius: 8,
    background: "#e5e5e5",
  },
  nftBtn: {
    padding: "10px 16px",
    borderRadius: 8,
    background: "#000",
    color: "#fff",
  },
  discordBtn: {
    display: "inline-block",
    marginTop: 12,
    padding: "10px 16px",
    background: "#5865F2",
    color: "#fff",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center",
  },
};
