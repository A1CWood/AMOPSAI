"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDaysRange } from "@/app/(app)/warm-status/actions";

export function WarmStatusDayRangeForm() {
  async function handleSubmit(formData: FormData) {
    try {
      await addDaysRange(formData);
      toast.success("Days added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add days");
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end justify-center gap-3 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="start">Start date</Label>
        <Input id="start" name="start" type="date" required className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="end">End date</Label>
        <Input id="end" name="end" type="date" required className="h-11" />
      </div>
      <Button type="submit" className="min-h-11">
        Add days
      </Button>
    </form>
  );
}
