import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE URL:", supabaseUrl ? "✅ LOADED" : "❌ MISSING");
console.log("SERVICE KEY:", serviceKey ? "✅ LOADED" : "❌ MISSING");

if (!supabaseUrl || !serviceKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 1️⃣ List buckets
const { data: buckets, error: bucketError } =
  await supabase.storage.listBuckets();

console.log("BUCKETS:", buckets);
console.log("BUCKET ERROR:", bucketError);

// 2️⃣ Try listing objects in ALL buckets
if (buckets) {
  for (const b of buckets) {
    const { data, error } = await supabase.storage
      .from(b.name)
      .list("", { limit: 10 });

    console.log(`\nBUCKET: ${b.name}`);
    console.log("FILES:", data);
    console.log("ERROR:", error);
  }
}
