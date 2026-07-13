"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParkingOccupancyChart } from "@/components/parking-occupancy-chart";

// openseadragon touches `document` at module load, so it can't be part of
// the server-rendered bundle for this Client Component - load it in the
// browser only.
const ParkingMap = dynamic(() => import("@/components/parking-map").then((mod) => mod.ParkingMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] min-h-96 w-full items-center justify-center rounded-lg border border-[#444] bg-black text-sm text-gray-400">
      Loading map…
    </div>
  ),
});
import { assignAircraft, deleteAssignment, endAssignment } from "@/app/(app)/parking/actions";
import {
  currentAssignmentForSpot,
  type ParkingApron,
  type ParkingAssignment,
  type ParkingSpot,
} from "@/lib/parking";

export function ParkingBoard({
  dziUrl,
  aprons,
  spots,
  assignments,
  isEditor,
}: {
  dziUrl: string;
  aprons: ParkingApron[];
  spots: ParkingSpot[];
  assignments: ParkingAssignment[];
  isEditor: boolean;
}) {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId) ?? null;
  const selectedApron = selectedSpot ? (aprons.find((a) => a.id === selectedSpot.apron_id) ?? null) : null;
  const currentAssignment = selectedSpot ? currentAssignmentForSpot(assignments, selectedSpot.id) : null;

  async function handleAssign(formData: FormData) {
    try {
      await assignAircraft(formData);
      toast.success("Aircraft assigned");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign aircraft");
    }
  }

  async function handleEnd(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    try {
      await endAssignment(formData);
      toast.success("Assignment ended");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to end assignment");
    }
  }

  async function handleDelete(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    try {
      await deleteAssignment(formData);
      toast.success("Assignment removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove assignment");
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div className="relative flex items-center justify-center">
        <h1 className="text-center text-xl font-bold">Parking Map</h1>
        {!isEditor ? (
          <Link href="/login?next=/parking" className="absolute right-0 text-sm text-muted-foreground underline">
            Sign in to edit
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_18rem]">
        <ParkingMap
          dziUrl={dziUrl}
          aprons={aprons}
          spots={spots}
          assignments={assignments}
          selectedSpotId={selectedSpotId}
          onSelectSpot={setSelectedSpotId}
          isEditor={isEditor}
        />

        <div className="rounded-lg border border-[#444] bg-[#222] p-4 text-sm text-white">
          {selectedSpot ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs tracking-wide text-gray-400 uppercase">{selectedApron?.label ?? "Apron"}</p>
                <p className="text-lg font-semibold">{selectedSpot.label}</p>
              </div>

              {currentAssignment ? (
                <div className="flex flex-col gap-1 rounded-md bg-amber-950/40 p-3">
                  <p className="font-medium text-amber-200">{currentAssignment.aircraft}</p>
                  <p className="text-xs text-gray-400">
                    Since {new Date(currentAssignment.start_time).toLocaleString()}
                  </p>
                  {currentAssignment.notes ? (
                    <p className="text-xs text-gray-300">{currentAssignment.notes}</p>
                  ) : null}
                  {isEditor ? (
                    <div className="mt-2 flex gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => handleEnd(currentAssignment.id)}>
                        End
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(currentAssignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Vacant.</p>
              )}

              {isEditor && !currentAssignment ? (
                <form key={selectedSpot.id} action={handleAssign} className="flex flex-col gap-2">
                  <input type="hidden" name="spotId" value={selectedSpot.id} />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="aircraft">Aircraft</Label>
                    <Input id="aircraft" name="aircraft" required placeholder="Tail / callsign" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="startTime">Start time (optional)</Label>
                    <Input id="startTime" name="startTime" type="datetime-local" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea id="notes" name="notes" rows={2} />
                  </div>
                  <Button type="submit" size="sm">
                    Assign aircraft
                  </Button>
                </form>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select a spot on the map to see details.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-300">Today&apos;s occupancy</h2>
        <ParkingOccupancyChart aprons={aprons} spots={spots} assignments={assignments} />
      </div>
    </div>
  );
}
