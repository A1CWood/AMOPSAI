"use client";

import { useState } from "react";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Database } from "@/lib/supabase/types";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export function ContactCard({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);
  const hasExtra = Boolean(contact.email || contact.address);

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        {contact.company ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {contact.company}
          </p>
        ) : null}
        <h3 className="font-semibold">{contact.name}</h3>
        {contact.phone ? (
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            className="flex min-h-11 items-center gap-2 text-sm"
          >
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            {contact.phone}
          </a>
        ) : null}
        {contact.alt_phone ? (
          <a
            href={`tel:${contact.alt_phone.replace(/[^\d+]/g, "")}`}
            className="flex min-h-11 items-center gap-2 text-sm"
          >
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            {contact.alt_phone}
          </a>
        ) : null}
        {hasExtra ? (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex min-h-11 items-center gap-1 text-sm text-muted-foreground">
              <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
              {open ? "Less" : "More"}
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-1 pt-1">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex min-h-11 items-center gap-2 text-sm"
                >
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  {contact.email}
                </a>
              ) : null}
              {contact.address ? (
                <p className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  {contact.address}
                </p>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </CardContent>
    </Card>
  );
}
