"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

function readEntryFields(formData: FormData) {
  const callsign = String(formData.get("callsign") ?? "").trim();
  const eta = String(formData.get("eta") ?? "").trim() || null;
  const etd = String(formData.get("etd") ?? "").trim() || null;
  const showTime = String(formData.get("showTime") ?? "").trim() || null;
  const airfieldOpen = String(formData.get("airfieldOpen") ?? "").trim() || null;
  const airfieldClose = String(formData.get("airfieldClose") ?? "").trim() || null;

  if (!callsign) throw new Error("Callsign is required.");
  if (!eta && !etd) throw new Error("At least one of ETA or ETD is required.");

  return { callsign, eta, etd, showTime, airfieldOpen, airfieldClose };
}

export async function addEntry(formData: FormData) {
  const supabase = await requireUser();
  const dayId = String(formData.get("dayId") ?? "");
  const { callsign, eta, etd, showTime, airfieldOpen, airfieldClose } = readEntryFields(formData);

  const { error } = await supabase.from("warm_status_entries").insert({
    day_id: dayId,
    callsign,
    eta,
    etd,
    show_time: showTime,
    airfield_open: airfieldOpen,
    airfield_close: airfieldClose,
  });
  if (error) throw new Error(`Failed to add entry: ${error.message}`);

  revalidatePath("/warm-status");
}

export async function updateEntry(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  const { callsign, eta, etd, showTime, airfieldOpen, airfieldClose } = readEntryFields(formData);

  const { error } = await supabase
    .from("warm_status_entries")
    .update({
      callsign,
      eta,
      etd,
      show_time: showTime,
      airfield_open: airfieldOpen,
      airfield_close: airfieldClose,
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to update entry: ${error.message}`);

  revalidatePath("/warm-status");
}

export async function deleteEntry(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase.from("warm_status_entries").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete entry: ${error.message}`);

  revalidatePath("/warm-status");
}
