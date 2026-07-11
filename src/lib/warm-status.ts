// Time math for the Warm Status Schedule. Times are plain 24hr "HHMM"
// strings (local time), no date component - arithmetic wraps within a
// single day rather than tracking day-crossing, which is an acceptable
// simplification for this tool (per-day scheduling, not multi-day transit).
//
// When an aircraft is scheduled to arrive, depart, or both: AMOPS
// personnel show 2 hours before the earliest of ETA/ETD, the airfield
// opens 1 hour before the earliest, and closes 30 minutes after the
// latest. Any of show/open/close can be individually turned off by an
// editor (e.g. back-to-back flights where the airfield shouldn't show as
// closing between them) - that's just null in storage, so it's simply
// omitted rather than computed.

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

function earliest(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

function latest(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

// "AMOPS personnel should be there 2 hours prior."
export function computeDefaultShow(eta: string, etd: string): string | undefined {
  const base = earliest(eta, etd);
  return base ? subtractMinutes(base, 120) : undefined;
}

// "The airfield will open 1 hour prior."
export function computeDefaultOpen(eta: string, etd: string): string | undefined {
  const base = earliest(eta, etd);
  return base ? subtractMinutes(base, 60) : undefined;
}

// "[Close] 30 min after the arrival or the departure" - the later of the two.
export function computeDefaultClose(eta: string, etd: string): string | undefined {
  const base = latest(eta, etd);
  return base ? addMinutes(base, 30) : undefined;
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

// Chronological order of entries within a day: earliest known time first,
// falling back through eta -> etd -> show time -> airfield open for
// entries missing the earlier fields.
export function sortEntries<T extends WarmStatusEntry>(entries: T[]): T[] {
  const sortKey = (entry: T) => entry.eta ?? entry.etd ?? entry.show_time ?? entry.airfield_open ?? "9999";
  return [...entries].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

export type TimelineRow = { sortKey: string; time: string; label: string };

// Per-entry breakdown for display: one row per distinct time, earliest on
// top, except ETA and ETD share a single row when an entry has both (they
// describe the same aircraft's activity, not separate support times).
export function buildEntryTimeline(entry: WarmStatusEntry): TimelineRow[] {
  const rows: TimelineRow[] = [];

  if (entry.show_time) {
    rows.push({ sortKey: entry.show_time, time: entry.show_time, label: "Show" });
  }
  if (entry.airfield_open) {
    rows.push({ sortKey: entry.airfield_open, time: entry.airfield_open, label: "Open" });
  }

  if (entry.eta && entry.etd) {
    rows.push({
      sortKey: earliest(entry.eta, entry.etd),
      time: `${entry.eta} / ${entry.etd}`,
      label: "ETA / ETD",
    });
  } else if (entry.eta) {
    rows.push({ sortKey: entry.eta, time: entry.eta, label: "ETA" });
  } else if (entry.etd) {
    rows.push({ sortKey: entry.etd, time: entry.etd, label: "ETD" });
  }

  if (entry.airfield_close) {
    rows.push({ sortKey: entry.airfield_close, time: entry.airfield_close, label: "Close" });
  }

  return rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
