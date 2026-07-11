import Link from "next/link";

import { WarmStatusBoard } from "@/components/warm-status-board";
import { createClient } from "@/lib/supabase/server";

export default async function WarmStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);
  const { data: days, error } = await supabase
    .from("warm_status_days")
    .select("*, warm_status_rows(*)")
    .gte("date", today)
    .order("date", { ascending: true });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Warm Status Schedule</h1>
        {!user ? (
          <Link href="/login?next=/warm-status" className="text-sm text-muted-foreground underline">
            Sign in to edit
          </Link>
        ) : null}
      </div>
      {error ? (
        <p className="mx-auto w-full max-w-6xl text-sm text-destructive">
          Failed to load schedule: {error.message}
        </p>
      ) : (
        <WarmStatusBoard days={days ?? []} isEditor={Boolean(user)} />
      )}
    </div>
  );
}
