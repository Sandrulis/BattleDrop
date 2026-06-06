#!/usr/bin/env node
/**
 * Prints required migration files for production parity.
 * Does not connect to the database — use before deploy and after schema changes.
 */
import { readdirSync } from "fs";
import { join } from "path";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

console.log("Required Supabase migrations (apply in order):");
for (const file of files) {
  console.log(`  - supabase/migrations/${file}`);
}

console.log("\nApply locally: npm run db:migrate");
console.log("Apply in prod: Supabase Dashboard → SQL Editor (or CI deploy step)");
