// scripts/seed_items_200.js

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // keep secret (server-side only)
const BUCKET = "nft-images";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function publicUrl(fullPath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fullPath)}`;
}

// List root files (your case: images are directly inside the bucket)
async function listRootFilesAll() {
  const limit = 100;
  let offset = 0;
  let all = [];

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw error;
    if (!data || data.length === 0) break;

    // Keep only files (ignore folders)
    const files = data.filter((x) => x.name && x.metadata && x.metadata.size != null);
    all.push(...files.map((f) => f.name));

    if (data.length < limit) break;
    offset += limit;
  }

  return all;
}

async function main() {
  // 1) Load collections (first 40)
  const { data: collections, error: cErr } = await supabase
    .from("collections")
    .select("id,title,created_at")
    .order("created_at", { ascending: true })
    .limit(40);

  if (cErr) throw cErr;
  if (!collections || collections.length !== 40) {
    throw new Error(`Expected 40 collections, found ${collections?.length || 0}`);
  }

  // 2) List all root images from storage
  const names = await listRootFilesAll();
  const images = names
    .filter((n) => /\.(png|jpg|jpeg|webp)$/i.test(n))
    // Important: numeric sort helps "0054.png" come before "0100.png"
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  if (images.length < 200) {
    throw new Error(`Not enough images in bucket root. Found ${images.length}, need 200.`);
  }

  // 3) Pick first 200 images
  const chosen = images.slice(0, 200);

  // 4) OPTIONAL: clear existing seeded items for these collections (recommended for testing)
  // If you already have real sales data, comment this out.
  const collectionIds = collections.map((c) => c.id);
  const { error: delErr } = await supabase.from("items").delete().in("collection_id", collectionIds);
  if (delErr) throw delErr;

  // 5) Build 200 item rows: 5 per collection
  const rows = [];
  let idx = 0;

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];
    for (let j = 0; j < 5; j++) {
      const filename = chosen[idx++];

      rows.push({
        collection_id: collection.id,
        title: `NFT ${String(i + 1).padStart(2, "0")}-${j + 1}`,
        media_url: publicUrl(filename),
        price: 10,
        is_sold: false,
      });
    }
  }

  // 6) Insert in chunks
  const chunkSize = 100;
  for (let k = 0; k < rows.length; k += chunkSize) {
    const chunk = rows.slice(k, k + chunkSize);
    const { error } = await supabase.from("items").insert(chunk);
    if (error) throw error;
    console.log(`Inserted ${k + chunk.length}/${rows.length}`);
  }

  console.log("✅ Done: 200 items inserted (5 per collection) across 40 collections.");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
