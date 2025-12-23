import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPurchase = async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          created_at,
          items (
            title,
            media_url
          ),
          collections (
            title
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Purchase fetch error:", error);
      } else {
        setPurchase(data);
      }

      setLoading(false);
    };

    fetchPurchase();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading your NFT…
      </div>
    );
  }

  if (!purchase) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Purchase not found.
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          🎉 You received an NFT!
        </h1>

        {purchase.items?.media_url && (
          <img
            src={purchase.items.media_url}
            alt={purchase.items.title}
            style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600 }}>
          {purchase.items?.title}
        </h2>

        <p style={{ color: "#666", marginBottom: 20 }}>
          Collection: {purchase.collections?.title}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => router.push("/collections")}
            style={{ padding: "10px 16px", borderRadius: 8, background: "#e5e5e5" }}
          >
            Back to collections
          </button>

          <button
            onClick={() => router.push("/my-nfts")}
            style={{ padding: "10px 16px", borderRadius: 8, background: "#000", color: "#fff" }}
          >
            My NFTs
          </button>
        </div>
      </div>
    </div>
  );
}
