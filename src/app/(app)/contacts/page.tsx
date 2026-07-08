import { ContactsSearch } from "@/components/contacts-search";
import { createClient } from "@/lib/supabase/server";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("company", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    return (
      <p className="p-4 text-sm text-destructive">
        Failed to load contacts: {error.message}
      </p>
    );
  }

  return <ContactsSearch contacts={contacts ?? []} />;
}
