import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SuccessRedirect() {
  const router = useRouter();
  const { purchase_id } = router.query;

  useEffect(() => {
    if (purchase_id) {
      router.replace(`/success/${purchase_id}`);
    }
  }, [purchase_id, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Finalizing your purchase…
    </div>
  );
}
