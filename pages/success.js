import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function SuccessRedirect() {
  const router = useRouter();
  const { purchase_id } = router.query;
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!purchase_id) return;

    let cancelled = false;

    const tryRedirect = () => {
      if (cancelled) return;

      attemptsRef.current += 1;

      router.replace(`/success/${purchase_id}`);

      // Retry a few times in case webhook is still processing
      if (attemptsRef.current < 5) {
        setTimeout(tryRedirect, 1200);
      }
    };

    const t = setTimeout(tryRedirect, 1200);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [purchase_id, router]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>You’re in 🐻</h2>
        <p>Finalizing your NFT and unlocking your BearTask…</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  card: {
    background: "#020617",
    padding: 24,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
};
