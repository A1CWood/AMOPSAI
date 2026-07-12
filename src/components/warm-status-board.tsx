"use client";

import Link from "next/link";
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

function formatDayOfWeek(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

function formatMonthDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });
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
    <div className="mx-auto max-w-2xl rounded-2xl bg-[#B0C4DE] p-6 text-black shadow-xl sm:p-8">
      <div className="relative mb-4 flex items-center justify-center">
        <h1 className="text-center text-xl font-bold">Warm Status Schedule</h1>
        {!isEditor ? (
          <Link
            href="/login?next=/warm-status"
            className="absolute right-0 text-sm text-gray-700 underline"
          >
            Sign in to edit
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {isEditor ? <WarmStatusDayRangeForm /> : null}

        {days.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-700">
            No upcoming warm status days scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {days.map((day) => {
              const timeline = buildDayTimeline(day.warm_status_rows);
              return (
                <Card key={day.id} className="border-[#444] bg-[#333] text-white">
                  <CardContent className="flex flex-col gap-3 py-4">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-white">{formatDayOfWeek(day.date)}</h2>
                      <p className="text-sm text-gray-400">{formatMonthDay(day.date)}</p>
                    </div>

                    {timeline.length === 0 ? (
                      <p className="text-center text-sm text-gray-400">Nothing scheduled.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {timeline.map((event, index) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <span className="w-14 shrink-0 font-mono text-gray-400">{event.time}</span>
                            <span>{event.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isEditor ? (
                      <div className="flex items-center justify-center gap-2">
                        <WarmStatusEditDayDialog day={day} />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove day"
                          onClick={() => handleDeleteDay(day.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
