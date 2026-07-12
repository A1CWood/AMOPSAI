"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ContactCard, type Contact } from "@/components/contact-card";
import { Input } from "@/components/ui/input";

export function ContactsSearch({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((contact) =>
      Object.values(contact).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(term),
      ),
    );
  }, [contacts, query]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search contacts..."
          className="h-11 border-[#555] bg-[#222] pl-9 text-white placeholder:text-gray-400"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} of {contacts.length} contacts
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
