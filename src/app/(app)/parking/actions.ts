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

function numberField(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value)) throw new Error(`Invalid ${key}.`);
  return value;
}

export async function createApron(formData: FormData) {
  const supabase = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!code) throw new Error("Apron code is required.");
  if (!label) throw new Error("Apron label is required.");

  const { data, error } = await supabase
    .from("parking_aprons")
    .insert({
      code,
      label,
      x: numberField(formData, "x"),
      y: numberField(formData, "y"),
      width: numberField(formData, "width"),
      height: numberField(formData, "height"),
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create apron: ${error.message}`);

  revalidatePath("/parking");
  return data;
}

export async function deleteApron(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing apron.");

  const { error } = await supabase.from("parking_aprons").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete apron: ${error.message}`);

  revalidatePath("/parking");
}

export async function createSpot(formData: FormData) {
  const supabase = await requireUser();
  const apronId = String(formData.get("apronId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!apronId) throw new Error("Missing apron.");
  if (!label) throw new Error("Spot label is required.");

  const { error } = await supabase.from("parking_spots").insert({
    apron_id: apronId,
    label,
    x: numberField(formData, "x"),
    y: numberField(formData, "y"),
  });
  if (error) throw new Error(`Failed to create spot: ${error.message}`);

  revalidatePath("/parking");
}

export async function deleteSpot(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing spot.");

  const { error } = await supabase.from("parking_spots").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete spot: ${error.message}`);

  revalidatePath("/parking");
}
