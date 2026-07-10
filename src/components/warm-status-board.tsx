"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarmStatusDayRangeForm } from "@/components/warm-status-day-range-form";
import { WarmStatusEntryDialog } from "@/components/warm-status-entry-dialog";
import { deleteDay, deleteEntry } from "@/app/(app)/warm-status/actions";
import { sortEntries } from "@/lib/warm-status";
import type { Database } from "@/lib/supabase/types";

type Day = Database["public"]["Tables"]["warm_status_days"]["Row"] & {
  warm_status_entries: Database["public"]["Tables"]["warm_status_entries"]["Row"][];
};

function formatDayHeading(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function TimeField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span className="text-sm">
      <span className="text-muted-foreground">{label} </span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

export function WarmStatusBoard({ days, isEditor }: { days: Day[]; isEditor: boolean }) {
  async function handleDeleteDay(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    try {
      await deleteDay(formData);
      toast.success("Day removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove day");
    }
  }

  async function handleDeleteEntry(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    try {
      await deleteEntry(formData);
      toast.success("Entry removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove entry");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      {isEditor ? <WarmStatusDayRangeForm /> : null}

      {days.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No upcoming warm status days scheduled.
        </p>
      ) : (
        days.map((day) => {
          const entries = sortEntries(day.warm_status_entries);
          return (
            <Card key={day.id}>
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">{formatDayHeading(day.date)}</h2>
                  {isEditor ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="min-h-11 min-w-11 text-destructive hover:text-destructive"
                      aria-label="Remove day"
                      onClick={() => handleDeleteDay(day.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No flights scheduled.</p>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md border p-3"
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="font-mono font-semibold">{entry.callsign}</span>
                          <TimeField label="ETA" value={entry.eta} />
                          <TimeField label="ETD" value={entry.etd} />
                          <TimeField label="Show" value={entry.show_time} />
                          <TimeField label="Open" value={entry.airfield_open} />
                          <TimeField label="Close" value={entry.airfield_close} />
                        </div>
                        {isEditor ? (
                          <div className="flex items-center gap-1">
                            <WarmStatusEntryDialog mode="edit" entry={entry} />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="min-h-11 min-w-11 text-destructive hover:text-destructive"
                              aria-label="Remove entry"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                {isEditor ? <WarmStatusEntryDialog mode="add" dayId={day.id} /> : null}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
