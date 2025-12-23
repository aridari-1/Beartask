import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function MyNFTs() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          created_at,
          items (
            title,
            media_url
          ),
          collections (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setNfts(data || []);
      }

      setLoading(false);
    };

    loadNFTs();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your NFTs…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">My NFTs</h1>

      {nfts.length === 0 ? (
        <p className="text-gray-500">
          You haven’t supported any collections yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white rounded-xl shadow p-4"
            >
              {nft.items?.media_url && (
                <img
                  src={nft.items.media_url}
                  alt={nft.items.title}
                  className="rounded-lg mb-3"
                />
              )}

              <h2 className="font-semibold">
                {nft.items?.title}
              </h2>
              <p className="text-sm text-gray-500">
                Collection: {nft.collections?.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Acquired on{" "}
                {new Date(nft.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
