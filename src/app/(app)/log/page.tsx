import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogEntryCard, type LogEntryWithAuthor } from "@/components/log-entry-card";
import { LogSearchForm } from "@/components/log-search-form";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export default async function LogHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let dbQuery = supabase
    .from("log_entries")
    .select("id, template_code, template_title, body, created_at, profiles(display_name, email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    dbQuery = dbQuery.textSearch("search_vector", query, { type: "websearch" });
  }

  const { data: entries, count, error } = await dbQuery;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Log</h1>
        <Button className="min-h-11" render={<Link href="/log/new" />}>
          <Plus className="size-4" />
          New entry
        </Button>
      </div>
      <LogSearchForm defaultValue={query} />
      {error ? (
        <p className="text-sm text-destructive">Failed to load log history: {error.message}</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {(entries as unknown as LogEntryWithAuthor[] | null)?.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
            {entries?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No log entries found.
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            {page <= 1 ? (
              <Button variant="outline" disabled className="min-h-11">
                Previous
              </Button>
            ) : (
              <Button
                variant="outline"
                className="min-h-11"
                render={
                  <Link href={`/log?${new URLSearchParams({ q: query, page: String(page - 1) })}`} />
                }
              >
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
            </span>
            {(count ?? 0) <= to + 1 ? (
              <Button variant="outline" disabled className="min-h-11">
                Next
              </Button>
            ) : (
              <Button
                variant="outline"
                className="min-h-11"
                render={
                  <Link href={`/log?${new URLSearchParams({ q: query, page: String(page + 1) })}`} />
                }
              >
                Next
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
