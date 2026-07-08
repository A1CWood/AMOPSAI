// One-off seed script: loads scripts/seed-data/amops-contacts.csv into the
// Supabase `contacts` table using the service-role key. Not wired into any
// build/deploy step — run manually with `npx tsx scripts/migrate-contacts.ts`
// whenever the contacts table needs to be reseeded from the CSV.
import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/lib/supabase/types";

type CsvRow = {
  company: string;
  name: string;
  phone: string;
  "alt-phone": string;
  email: string;
  address: string;
};

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).",
    );
  }

  const csvPath = path.join(__dirname, "seed-data", "amops-contacts.csv");
  const csvContent = readFileSync(csvPath, "utf-8");

  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const contacts: Database["public"]["Tables"]["contacts"]["Insert"][] = rows.map((row) => ({
    company: toNullable(row.company),
    name: row.name.trim(),
    phone: toNullable(row.phone),
    alt_phone: toNullable(row["alt-phone"]),
    email: toNullable(row.email),
    address: toNullable(row.address),
  }));

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  // No natural unique key exists across rows (e.g. "OPS" repeats across
  // multiple companies), so this is a full replace rather than an upsert.
  // Safe as a one-off seed; do not schedule this to run automatically.
  const { error: deleteError } = await supabase
    .from("contacts")
    .delete()
    .not("id", "is", null);
  if (deleteError) {
    throw new Error(`Failed to clear contacts table: ${deleteError.message}`);
  }

  const { error: insertError, count } = await supabase
    .from("contacts")
    .insert(contacts, { count: "exact" });
  if (insertError) {
    throw new Error(`Failed to insert contacts: ${insertError.message}`);
  }

  console.log(`Seeded ${count ?? contacts.length} contacts from ${csvPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
