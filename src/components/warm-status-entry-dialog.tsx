"use client";

import { useId, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { addEntry, updateEntry } from "@/app/(app)/warm-status/actions";
import { computeDefaultClose, computeDefaultOpen } from "@/lib/warm-status";
import type { Database } from "@/lib/supabase/types";

type Entry = Database["public"]["Tables"]["warm_status_entries"]["Row"];

const TIME_PATTERN = "^([01][0-9]|2[0-3])[0-5][0-9]$";

type Props =
  | { mode: "add"; dayId: string }
  | { mode: "edit"; entry: Entry };

const emptyFields = {
  callsign: "",
  eta: "",
  etd: "",
  showTime: "",
  airfieldOpen: "",
  airfieldClose: "",
};

export function WarmStatusEntryDialog(props: Props) {
  const idPrefix = useId();
  const [open, setOpen] = useState(false);
  const existing = props.mode === "edit" ? props.entry : null;

  const [fields, setFields] = useState(
    existing
      ? {
          callsign: existing.callsign,
          eta: existing.eta ?? "",
          etd: existing.etd ?? "",
          showTime: existing.show_time ?? "",
          airfieldOpen: existing.airfield_open ?? "",
          airfieldClose: existing.airfield_close ?? "",
        }
      : emptyFields,
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // Adding (not editing) reuses the same component instance across
    // opens - Base UI hides rather than unmounts - so reset the form each
    // time it opens for a fresh entry, otherwise the previous entry's
    // values leak into the next one.
    if (next && props.mode === "add") {
      setFields(emptyFields);
    }
  }

  function handleEtaChange(value: string) {
    setFields((current) => {
      const open = current.airfieldOpen || computeDefaultOpen(value, current.etd) || current.airfieldOpen;
      const close = current.airfieldClose || computeDefaultClose(value, current.etd) || current.airfieldClose;
      return { ...current, eta: value, airfieldOpen: open, airfieldClose: close };
    });
  }

  function handleEtdChange(value: string) {
    setFields((current) => {
      const open = current.airfieldOpen || computeDefaultOpen(current.eta, value) || current.airfieldOpen;
      const close = current.airfieldClose || computeDefaultClose(current.eta, value) || current.airfieldClose;
      return { ...current, etd: value, airfieldOpen: open, airfieldClose: close };
    });
  }

  async function handleSubmit(formData: FormData) {
    try {
      if (props.mode === "add") {
        await addEntry(formData);
      } else {
        await updateEntry(formData);
      }
      toast.success("Saved");
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          props.mode === "add" ? (
            <Button size="sm" className="min-h-11 gap-1" />
          ) : (
            <Button variant="ghost" size="icon-sm" className="min-h-11 min-w-11" aria-label="Edit entry" />
          )
        }
      >
        {props.mode === "add" ? (
          <>
            <Plus className="size-4" />
            Add entry
          </>
        ) : (
          <Pencil className="size-4" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{props.mode === "add" ? "Add flight" : "Edit flight"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          {props.mode === "add" ? (
            <input type="hidden" name="dayId" value={props.dayId} />
          ) : (
            <input type="hidden" name="id" value={props.entry.id} />
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-callsign`}>Callsign</Label>
            <Input
              id={`${idPrefix}-callsign`}
              name="callsign"
              maxLength={7}
              required
              value={fields.callsign}
              onChange={(event) =>
                setFields((current) => ({ ...current, callsign: event.target.value.toUpperCase() }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-eta`}>ETA (local, 24hr)</Label>
              <Input
                id={`${idPrefix}-eta`}
                name="eta"
                placeholder="1600"
                inputMode="numeric"
                pattern={TIME_PATTERN}
                value={fields.eta}
                onChange={(event) => handleEtaChange(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-etd`}>ETD (local, 24hr)</Label>
              <Input
                id={`${idPrefix}-etd`}
                name="etd"
                placeholder="1800"
                inputMode="numeric"
                pattern={TIME_PATTERN}
                value={fields.etd}
                onChange={(event) => handleEtdChange(event.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">At least one of ETA or ETD is required.</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-showTime`}>Show time (AMOPS personnel)</Label>
            <Input
              id={`${idPrefix}-showTime`}
              name="showTime"
              placeholder="1500"
              inputMode="numeric"
              pattern={TIME_PATTERN}
              value={fields.showTime}
              onChange={(event) => setFields((current) => ({ ...current, showTime: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-airfieldOpen`}>Airfield open</Label>
              <Input
                id={`${idPrefix}-airfieldOpen`}
                name="airfieldOpen"
                placeholder="1500"
                inputMode="numeric"
                pattern={TIME_PATTERN}
                value={fields.airfieldOpen}
                onChange={(event) =>
                  setFields((current) => ({ ...current, airfieldOpen: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-airfieldClose`}>Airfield close</Label>
              <Input
                id={`${idPrefix}-airfieldClose`}
                name="airfieldClose"
                placeholder="1830"
                inputMode="numeric"
                pattern={TIME_PATTERN}
                value={fields.airfieldClose}
                onChange={(event) =>
                  setFields((current) => ({ ...current, airfieldClose: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="min-h-11">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
