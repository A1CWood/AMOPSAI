import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function LogSearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/log" className="relative">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search log history..."
        className="h-11 pl-9"
      />
    </form>
  );
}
