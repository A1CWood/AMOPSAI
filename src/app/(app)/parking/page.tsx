import { ParkingBoard } from "@/components/parking-board";
import { getParkingMapDziUrl } from "@/lib/parking";
import { createClient } from "@/lib/supabase/server";

export default async function ParkingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [apronsResult, spotsResult, assignmentsResult] = await Promise.all([
    supabase.from("parking_aprons").select("*").order("code", { ascending: true }),
    supabase.from("parking_spots").select("*").order("label", { ascending: true }),
    supabase.from("parking_assignments").select("*").order("start_time", { ascending: true }),
  ]);

  const error = apronsResult.error ?? spotsResult.error ?? assignmentsResult.error;

  return (
    <div className="p-4">
      {error ? (
        <p className="mx-auto max-w-6xl text-sm text-destructive">Failed to load parking map: {error.message}</p>
      ) : (
        <ParkingBoard
          dziUrl={getParkingMapDziUrl()}
          aprons={apronsResult.data ?? []}
          spots={spotsResult.data ?? []}
          assignments={assignmentsResult.data ?? []}
          isEditor={Boolean(user)}
        />
      )}
    </div>
  );
}
