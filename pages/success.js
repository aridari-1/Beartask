import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * ⚠️ IMPORTANT SECURITY NOTE
 * This page MUST remain read-only.
 * - It does NOT confirm payment
 * - It does NOT mint NFTs
 * - It does NOT update Supabase
 *
 * Payment confirmation is handled ONLY by Stripe Webhooks.
 */
export default function Success() {
  const router = useRouter();
  const { purchase_id } = router.query;

  useEffect(() => {
    // Optional: clean URL, but do NOTHING else
    if (purchase_id) {
      // We deliberately DO NOT trust purchase_id
      // and DO NOT trigger any side effects here.
      console.log("Stripe redirect received for purchase:", purchase_id);
    }
  }, [purchase_id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6d28d9, #4338ca)",
        color: "white",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
        Finalizing your purchase…
      </h1>

      <p style={{ marginTop: "12px", maxWidth: "420px", opacity: 0.9 }}>
        Your payment is being securely verified by Stripe.
        <br />
        <strong>
          Your NFT and lottery entry will appear automatically once payment is
          confirmed.
        </strong>
      </p>

      <p style={{ marginTop: "20px", fontSize: "0.9rem", opacity: 0.75 }}>
        You can safely close this page.
      </p>
    </div>
  );
}
