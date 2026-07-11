"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarmStatusDayRangeForm } from "@/components/warm-status-day-range-form";
import { WarmStatusEntryDialog } from "@/components/warm-status-entry-dialog";
import { deleteDay, deleteEntry } from "@/app/(app)/warm-status/actions";
import { buildEntryTimeline, sortEntries } from "@/lib/warm-status";
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
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
      {isEditor ? <WarmStatusDayRangeForm /> : null}

      {days.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No upcoming warm status days scheduled.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => {
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

                  <div className="flex flex-col gap-3">
                    {entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No flights scheduled.</p>
                    ) : (
                      entries.map((entry) => (
                        <div key={entry.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold">{entry.callsign}</span>
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
                          <div className="mt-1 flex flex-col gap-0.5">
                            {buildEntryTimeline(entry).map((row) => (
                              <div key={row.label} className="flex gap-3 text-sm">
                                <span className="w-24 shrink-0 font-mono text-muted-foreground">
                                  {row.time}
                                </span>
                                <span>{row.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {isEditor ? <WarmStatusEntryDialog mode="add" dayId={day.id} /> : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
