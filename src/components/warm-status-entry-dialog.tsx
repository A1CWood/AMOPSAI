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
import { computeDefaultClose, computeDefaultOpen, computeDefaultShow } from "@/lib/warm-status";
import type { Database } from "@/lib/supabase/types";

type Entry = Database["public"]["Tables"]["warm_status_entries"]["Row"];

const TIME_PATTERN = "^([01][0-9]|2[0-3])[0-5][0-9]$";

type Props =
  | { mode: "add"; dayId: string }
  | { mode: "edit"; entry: Entry };

type AutoField = { value: string; enabled: boolean; dirty: boolean };

export function WarmStatusEntryDialog(props: Props) {
  const idPrefix = useId();
  const [dialogOpen, setDialogOpen] = useState(false);
  const existing = props.mode === "edit" ? props.entry : null;

  const [callsign, setCallsign] = useState(existing?.callsign ?? "");
  const [eta, setEta] = useState(existing?.eta ?? "");
  const [etd, setEtd] = useState(existing?.etd ?? "");
  const [show, setShow] = useState<AutoField>(
    existing ? { value: existing.show_time ?? "", enabled: Boolean(existing.show_time), dirty: Boolean(existing.show_time) } : { value: "", enabled: true, dirty: false },
  );
  const [airfieldOpen, setAirfieldOpen] = useState<AutoField>(
    existing ? { value: existing.airfield_open ?? "", enabled: Boolean(existing.airfield_open), dirty: Boolean(existing.airfield_open) } : { value: "", enabled: true, dirty: false },
  );
  const [airfieldClose, setAirfieldClose] = useState<AutoField>(
    existing ? { value: existing.airfield_close ?? "", enabled: Boolean(existing.airfield_close), dirty: Boolean(existing.airfield_close) } : { value: "", enabled: true, dirty: false },
  );

  function recompute(nextEta: string, nextEtd: string) {
    setShow((current) =>
      current.enabled && !current.dirty
        ? { ...current, value: computeDefaultShow(nextEta, nextEtd) ?? current.value }
        : current,
    );
    setAirfieldOpen((current) =>
      current.enabled && !current.dirty
        ? { ...current, value: computeDefaultOpen(nextEta, nextEtd) ?? current.value }
        : current,
    );
    setAirfieldClose((current) =>
      current.enabled && !current.dirty
        ? { ...current, value: computeDefaultClose(nextEta, nextEtd) ?? current.value }
        : current,
    );
  }

  function handleEtaChange(value: string) {
    setEta(value);
    recompute(value, etd);
  }

  function handleEtdChange(value: string) {
    setEtd(value);
    recompute(eta, value);
  }

  function toggleField(
    setter: React.Dispatch<React.SetStateAction<AutoField>>,
    compute: (eta: string, etd: string) => string | undefined,
    checked: boolean,
  ) {
    setter((current) =>
      checked
        ? { value: compute(eta, etd) ?? current.value, enabled: true, dirty: false }
        : { ...current, enabled: false },
    );
  }

  async function handleSubmit(formData: FormData) {
    try {
      if (props.mode === "add") {
        await addEntry(formData);
      } else {
        await updateEntry(formData);
      }
      toast.success("Saved");
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  }

  function handleOpenChange(next: boolean) {
    setDialogOpen(next);
    if (next && props.mode === "add") {
      setCallsign("");
      setEta("");
      setEtd("");
      setShow({ value: "", enabled: true, dirty: false });
      setAirfieldOpen({ value: "", enabled: true, dirty: false });
      setAirfieldClose({ value: "", enabled: true, dirty: false });
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
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
              value={callsign}
              onChange={(event) => setCallsign(event.target.value.toUpperCase())}
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
                value={eta}
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
                value={etd}
                onChange={(event) => handleEtdChange(event.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">At least one of ETA or ETD is required.</p>

          <AutoFieldRow
            idPrefix={`${idPrefix}-show`}
            name="showTime"
            label="Show time (AMOPS personnel)"
            field={show}
            onValueChange={(value) => setShow((current) => ({ ...current, value, dirty: true }))}
            onToggle={(checked) => toggleField(setShow, computeDefaultShow, checked)}
          />
          <div className="grid grid-cols-2 gap-3">
            <AutoFieldRow
              idPrefix={`${idPrefix}-open`}
              name="airfieldOpen"
              label="Airfield open"
              field={airfieldOpen}
              onValueChange={(value) => setAirfieldOpen((current) => ({ ...current, value, dirty: true }))}
              onToggle={(checked) => toggleField(setAirfieldOpen, computeDefaultOpen, checked)}
            />
            <AutoFieldRow
              idPrefix={`${idPrefix}-close`}
              name="airfieldClose"
              label="Airfield close"
              field={airfieldClose}
              onValueChange={(value) => setAirfieldClose((current) => ({ ...current, value, dirty: true }))}
              onToggle={(checked) => toggleField(setAirfieldClose, computeDefaultClose, checked)}
            />
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

function AutoFieldRow({
  idPrefix,
  name,
  label,
  field,
  onValueChange,
  onToggle,
}: {
  idPrefix: string;
  name: string;
  label: string;
  field: AutoField;
  onValueChange: (value: string) => void;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={idPrefix} className={field.enabled ? "" : "text-muted-foreground"}>
          {label}
        </Label>
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={field.enabled}
            onChange={(event) => onToggle(event.target.checked)}
            className="size-3.5"
          />
          Include
        </label>
      </div>
      {field.enabled ? (
        <Input
          id={idPrefix}
          name={name}
          placeholder="1500"
          inputMode="numeric"
          pattern={TIME_PATTERN}
          value={field.value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : (
        <p className="flex h-9 items-center text-sm text-muted-foreground italic">Not included</p>
      )}
    </div>
  );
}
