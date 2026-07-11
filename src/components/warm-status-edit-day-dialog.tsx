"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveDayRows, type DraftRowInput } from "@/app/(app)/warm-status/actions";
import { ROW_TYPE_LABELS, type RowType } from "@/lib/warm-status";
import type { Database } from "@/lib/supabase/types";

type DbRow = Database["public"]["Tables"]["warm_status_rows"]["Row"];
type Day = Database["public"]["Tables"]["warm_status_days"]["Row"] & { warm_status_rows: DbRow[] };

type DraftRow = {
  id: string;
  rowType: RowType | null;
  time: string;
  callsign: string;
  eta: string;
  etd: string;
};

function makeEmptyRow(): DraftRow {
  return { id: crypto.randomUUID(), rowType: null, time: "", callsign: "", eta: "", etd: "" };
}

function draftFromDb(row: DbRow): DraftRow {
  return {
    id: row.id,
    rowType: row.row_type,
    time: row.time ?? "",
    callsign: row.callsign ?? "",
    eta: row.eta ?? "",
    etd: row.etd ?? "",
  };
}

function initialRows(day: Day): DraftRow[] {
  const existing = [...day.warm_status_rows]
    .sort((a, b) => a.position - b.position)
    .map(draftFromDb);
  return [...existing, makeEmptyRow()];
}

function formatDayHeading(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WarmStatusEditDayDialog({ day }: { day: Day }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DraftRow[]>(() => initialRows(day));
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setRows(initialRows(day));
    }
  }

  function updateRowType(index: number, rowType: RowType) {
    setRows((current) => {
      const next = current.map((row, i) => (i === index ? { ...row, rowType } : row));
      if (index === current.length - 1) {
        next.push(makeEmptyRow());
      }
      return next;
    });
  }

  function updateRowField(index: number, patch: Partial<DraftRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function deleteRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const committed = rows.filter((row): row is DraftRow & { rowType: RowType } => row.rowType !== null);

    const payload: DraftRowInput[] = committed.map((row) =>
      row.rowType === "flight"
        ? {
            rowType: "flight",
            time: null,
            callsign: row.callsign.trim().toUpperCase() || null,
            eta: row.eta.trim() || null,
            etd: row.etd.trim() || null,
          }
        : {
            rowType: row.rowType,
            time: row.time.trim() || null,
            callsign: null,
            eta: null,
            etd: null,
          },
    );

    setSaving(true);
    try {
      await saveDayRows(day.id, payload);
      toast.success("Day saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" className="min-h-11 gap-1" />}>
        <Pencil className="size-4" />
        Edit day
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatDayHeading(day.date)}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {rows.map((row, index) => (
            <div key={row.id} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <select
                  value={row.rowType ?? ""}
                  onChange={(event) => updateRowType(index, event.target.value as RowType)}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="" disabled>
                    Add a row...
                  </option>
                  {(Object.entries(ROW_TYPE_LABELS) as [RowType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {row.rowType ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="min-h-11 min-w-11 text-destructive hover:text-destructive"
                    aria-label="Delete row"
                    onClick={() => deleteRow(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>

              {row.rowType === "flight" ? (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Callsign"
                    maxLength={7}
                    value={row.callsign}
                    onChange={(event) =>
                      updateRowField(index, { callsign: event.target.value.toUpperCase() })
                    }
                  />
                  <Input
                    placeholder="ETA"
                    inputMode="numeric"
                    value={row.eta}
                    onChange={(event) => updateRowField(index, { eta: event.target.value })}
                  />
                  <Input
                    placeholder="ETD"
                    inputMode="numeric"
                    value={row.etd}
                    onChange={(event) => updateRowField(index, { etd: event.target.value })}
                  />
                </div>
              ) : row.rowType ? (
                <Input
                  placeholder="1500"
                  inputMode="numeric"
                  value={row.time}
                  onChange={(event) => updateRowField(index, { time: event.target.value })}
                />
              ) : null}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={saving} className="min-h-11">
            {saving ? "Saving..." : "Save day"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
