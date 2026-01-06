import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequested = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("payouts")
      .select(`
        id,
        role,
        amount,
        status,
        created_at,
        collection_id,
        profiles:user_id (
          id,
          email
        ),
        collections (
          id,
          title
        )
      `)
      .eq("status", "requested")
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPayouts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequested();
  }, []);

  const approvePayout = async (payoutId) => {
    const confirm = window.confirm(
      "Approve this payout? Money will be sent via Stripe."
    );
    if (!confirm) return;

    const res = await fetch("/api/payouts/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutId }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error || "Failed to approve payout");
      return;
    }

    alert("Payout approved and sent successfully.");
    fetchRequested();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
        Loading payouts…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Admin payouts</h1>
      <p className="text-slate-400 mb-6">
        Review payout requests and approve payments.
      </p>

      {error && <p className="text-red-400">{error}</p>}

      {payouts.length === 0 ? (
        <p className="text-slate-400">No payout requests.</p>
      ) : (
        <table className="w-full border border-slate-700 rounded-lg overflow-hidden">
          <thead className="bg-slate-800 text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Collection</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-700 hover:bg-slate-800"
              >
                <td className="p-3">{p.profiles?.email}</td>
                <td className="p-3 capitalize">{p.role}</td>
                <td className="p-3">{p.collections?.title}</td>
                <td className="p-3 font-semibold">${p.amount}</td>
                <td className="p-3">
                  <button
                    onClick={() => approvePayout(p.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
