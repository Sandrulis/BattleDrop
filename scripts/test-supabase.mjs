import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(join(process.cwd(), file), "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const env = loadEnv(".env.local");
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("ENV configured:", {
  url: Boolean(url && !url.includes("YOUR_")),
  anonKey: Boolean(anonKey && !anonKey.includes("YOUR_")),
  serviceKey: Boolean(serviceKey && !serviceKey.includes("YOUR_")),
});

const anonClient = createClient(url, anonKey);
const { error: sessionError } = await anonClient.auth.getSession();
console.log(
  "AUTH (anon):",
  sessionError ? `ERROR — ${sessionError.message}` : "OK",
);

const serviceClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = ["products", "battles", "profiles", "votes", "comments", "promoted_slots"];
for (const table of tables) {
  const { error } = await serviceClient.from(table).select("*", { count: "exact", head: true });
  console.log(`TABLE ${table}:`, error ? error.message : "OK — exists");
}

const { error: probeError } = await anonClient.from("products").select("id").limit(1);
if (probeError?.code === "PGRST205") {
  console.log("API: OK — project reachable, schema not migrated yet");
} else if (probeError) {
  console.log("API probe:", probeError.code, probeError.message);
} else {
  console.log("API: OK — products table reachable");
}
