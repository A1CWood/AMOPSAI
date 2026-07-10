// Time math for the Warm Status Schedule. Times are plain 24hr "HHMM"
// strings (local time), no date component - arithmetic wraps within a
// single day rather than tracking day-crossing, which is an acceptable
// simplification for this tool (per-day scheduling, not multi-day transit).

const HHMM = /^([01]\d|2[0-3])[0-5]\d$/;

export function isValidHhmm(value: string): boolean {
  return HHMM.test(value);
}

function toMinutes(hhmm: string): number {
  return parseInt(hhmm.slice(0, 2), 10) * 60 + parseInt(hhmm.slice(2), 10);
}

function fromMinutes(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
}

export function addMinutes(hhmm: string, delta: number): string {
  return fromMinutes(toMinutes(hhmm) + delta);
}

export function subtractMinutes(hhmm: string, delta: number): string {
  return addMinutes(hhmm, -delta);
}

// "1 hour prior to ETA, or ETD if ETA is empty."
export function computeDefaultOpen(eta: string, etd: string): string | undefined {
  if (eta) return subtractMinutes(eta, 60);
  if (etd) return etd;
  return undefined;
}

// "30 min after ETD, or ETA if no ETD."
export function computeDefaultClose(eta: string, etd: string): string | undefined {
  if (etd) return addMinutes(etd, 30);
  if (eta) return eta;
  return undefined;
}

export type WarmStatusEntry = {
  id: string;
  callsign: string;
  eta: string | null;
  etd: string | null;
  show_time: string | null;
  airfield_open: string | null;
  airfield_close: string | null;
};

// Chronological order within a day: earliest known time first, falling
// back through eta -> etd -> show time -> airfield open for entries
// missing the earlier fields.
export function sortEntries<T extends WarmStatusEntry>(entries: T[]): T[] {
  const sortKey = (entry: T) => entry.eta ?? entry.etd ?? entry.show_time ?? entry.airfield_open ?? "9999";
  return [...entries].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}
