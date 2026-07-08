"use client";

import { useRouter } from "next/navigation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LOG_TEMPLATES } from "@/data/log-templates";

export function LogTemplatePicker() {
  const router = useRouter();

  return (
    <div className="rounded-lg border">
      <Command>
        <CommandInput placeholder="Search templates (e.g. BS, IFE, WX)..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No matching template.</CommandEmpty>
          <CommandGroup>
            {LOG_TEMPLATES.map((template) => (
              <CommandItem
                key={template.code}
                value={`${template.code} ${template.title}`}
                onSelect={() => router.push(`/log/new?template=${template.code}`)}
                className="min-h-11"
              >
                <span className="font-mono text-xs text-muted-foreground">{template.code}</span>
                <span>{template.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
