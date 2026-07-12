// Parking map: aprons and spots are stored as normalized fractions (0..1)
// of the source image's pixel width/height, independent of the image's
// actual resolution or which zoom level of the tile pyramid is loaded.
// OpenSeadragon's viewport coordinate space always spans width 0..1, but
// scales height by the image's aspect ratio - toViewportPoint/toViewportRect
// convert between the two.

export type NormalizedPoint = { x: number; y: number };
export type NormalizedRect = { x: number; y: number; width: number; height: number };

// The DZI pyramid lives at a fixed path in the public "parking-map" bucket
// (see scripts/generate-parking-tiles.mjs / upload-parking-tiles.mjs) -
// no separate env var needed, since the path is a fixed convention.
export function getParkingMapDziUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  return `${supabaseUrl}/storage/v1/object/public/parking-map/parking-map.dzi`;
}

export function toViewportPoint(point: NormalizedPoint, imageAspectRatio: number): NormalizedPoint {
  return { x: point.x, y: point.y / imageAspectRatio };
}

export function toViewportRect(rect: NormalizedRect, imageAspectRatio: number): NormalizedRect {
  return {
    x: rect.x,
    y: rect.y / imageAspectRatio,
    width: rect.width,
    height: rect.height / imageAspectRatio,
  };
}

export type ParkingApron = {
  id: string;
  code: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ParkingSpot = {
  id: string;
  apron_id: string;
  label: string;
  x: number;
  y: number;
};

export type ParkingAssignment = {
  id: string;
  spot_id: string;
  aircraft: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
};

// An assignment with no end_time is open-ended ("still parked").
export function isAssignmentActiveAt(assignment: ParkingAssignment, at: Date): boolean {
  const start = new Date(assignment.start_time);
  const end = assignment.end_time ? new Date(assignment.end_time) : null;
  return start <= at && (end === null || end > at);
}

export function currentAssignmentForSpot(
  assignments: ParkingAssignment[],
  spotId: string,
  at: Date = new Date(),
): ParkingAssignment | null {
  const forSpot = assignments.filter((a) => a.spot_id === spotId && isAssignmentActiveAt(a, at));
  if (forSpot.length === 0) return null;
  // If a spot somehow has overlapping active assignments, prefer the most recently started.
  return forSpot.sort((a, b) => b.start_time.localeCompare(a.start_time))[0];
}

// Assignments whose [start_time, end_time) window overlaps [rangeStart, rangeEnd) -
// open-ended assignments (end_time null) are treated as extending to rangeEnd.
export function assignmentsInRange(
  assignments: ParkingAssignment[],
  rangeStart: Date,
  rangeEnd: Date,
): ParkingAssignment[] {
  return assignments.filter((a) => {
    const start = new Date(a.start_time);
    const end = a.end_time ? new Date(a.end_time) : rangeEnd;
    return start < rangeEnd && end > rangeStart;
  });
}
