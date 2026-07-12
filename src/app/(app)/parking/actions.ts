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

export async function assignAircraft(formData: FormData) {
  const supabase = await requireUser();
  const spotId = String(formData.get("spotId") ?? "");
  const aircraft = String(formData.get("aircraft") ?? "").trim();
  const startInput = String(formData.get("startTime") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!spotId) throw new Error("Missing spot.");
  if (!aircraft) throw new Error("Aircraft tail/callsign is required.");

  const startTime = startInput ? new Date(startInput) : new Date();
  if (Number.isNaN(startTime.getTime())) throw new Error("Invalid start time.");

  const { error } = await supabase.from("parking_assignments").insert({
    spot_id: spotId,
    aircraft,
    start_time: startTime.toISOString(),
    notes: notes || null,
  });
  if (error) throw new Error(`Failed to assign aircraft: ${error.message}`);

  revalidatePath("/parking");
}

export async function endAssignment(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing assignment.");

  const { error } = await supabase
    .from("parking_assignments")
    .update({ end_time: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to end assignment: ${error.message}`);

  revalidatePath("/parking");
}

export async function deleteAssignment(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing assignment.");

  const { error } = await supabase.from("parking_assignments").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete assignment: ${error.message}`);

  revalidatePath("/parking");
}
