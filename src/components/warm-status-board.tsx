"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarmStatusDayRangeForm } from "@/components/warm-status-day-range-form";
import { WarmStatusEditDayDialog } from "@/components/warm-status-edit-day-dialog";
import { deleteDay } from "@/app/(app)/warm-status/actions";
import { buildDayTimeline } from "@/lib/warm-status";
import type { Database } from "@/lib/supabase/types";

type Day = Database["public"]["Tables"]["warm_status_days"]["Row"] & {
  warm_status_rows: Database["public"]["Tables"]["warm_status_rows"]["Row"][];
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
            const timeline = buildDayTimeline(day.warm_status_rows);
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

                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {timeline.map((event, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <span className="w-14 shrink-0 font-mono text-muted-foreground">
                            {event.time}
                          </span>
                          <span>{event.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEditor ? <WarmStatusEditDayDialog day={day} /> : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
