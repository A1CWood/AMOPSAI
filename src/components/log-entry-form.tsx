"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLogEntry } from "@/app/(app)/log/actions";
import type { LogTemplate } from "@/data/log-templates";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-h-11">
      {pending ? "Saving..." : "Save entry"}
    </Button>
  );
}

export function LogEntryForm({ template }: { template: LogTemplate }) {
  return (
    <form action={createLogEntry} className="flex flex-col gap-4">
      <input type="hidden" name="templateCode" value={template.code} />
      {template.fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === "textarea" ? (
            <Textarea id={field.key} name={field.key} rows={4} />
          ) : (
            <Input id={field.key} name={field.key} className="h-11" />
          )}
        </div>
      ))}
      <SubmitButton />
    </form>
  );
}
