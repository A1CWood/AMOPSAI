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
    <div className="p-4">
      {error ? (
        <p className="mx-auto max-w-6xl text-sm text-destructive">
          Failed to load schedule: {error.message}
        </p>
      ) : (
        <WarmStatusBoard days={days ?? []} isEditor={Boolean(user)} />
      )}
    </div>
  );
}
