"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { RowType } from "@/lib/warm-status";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be signed in to do that.");
  }
  return supabase;
}

function expandDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(endDate.getTime()) || cursor > endDate) {
    throw new Error("Invalid date range.");
  }
  while (cursor <= endDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export async function addDaysRange(formData: FormData) {
  const supabase = await requireUser();
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const dates = expandDateRange(start, end);

  const { error } = await supabase
    .from("warm_status_days")
    .upsert(
      dates.map((date) => ({ date })),
      { onConflict: "date", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Failed to add days: ${error.message}`);

  revalidatePath("/warm-status");
}

export async function deleteDay(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase.from("warm_status_days").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete day: ${error.message}`);

  revalidatePath("/warm-status");
}

export type DraftRowInput = {
  rowType: RowType;
  time: string | null;
  callsign: string | null;
  eta: string | null;
  etd: string | null;
};

function validateRow(row: DraftRowInput) {
  if (row.rowType === "flight") {
    if (!row.callsign?.trim()) throw new Error("Every flight row needs a callsign.");
    if (!row.eta && !row.etd) throw new Error(`Flight ${row.callsign}: at least one of ETA or ETD is required.`);
  } else if (!row.time) {
    throw new Error(`Every ${row.rowType} row needs a time.`);
  }
}

// Rebuilds a day's entire row list in one go - simpler and safer than
// diffing individual add/update/delete operations against whatever the
// editor did in the popup, since the whole day is edited as a unit.
export async function saveDayRows(dayId: string, rows: DraftRowInput[]) {
  const supabase = await requireUser();

  for (const row of rows) validateRow(row);

  const { error: deleteError } = await supabase.from("warm_status_rows").delete().eq("day_id", dayId);
  if (deleteError) throw new Error(`Failed to save day: ${deleteError.message}`);

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("warm_status_rows").insert(
      rows.map((row, index) => ({
        day_id: dayId,
        position: index,
        row_type: row.rowType,
        time: row.time,
        callsign: row.callsign,
        eta: row.eta,
        etd: row.etd,
      })),
    );
    if (insertError) throw new Error(`Failed to save day: ${insertError.message}`);
  }

  revalidatePath("/warm-status");
}
