// Warm Status Schedule: a day is a freeform ordered list of typed rows
// (AMOPS show time, airfield open, a flight, airfield close) that an editor
// builds up via WarmStatusEditDayDialog in whatever order makes sense.
// Display flattens that list into one chronological timeline per day -
// earliest time on top - regardless of the order rows were added in.

const HHMM = /^([01]\d|2[0-3])[0-5]\d$/;

export function isValidHhmm(value: string): boolean {
  return HHMM.test(value);
}

export type RowType = "show" | "open" | "flight" | "close";

export const ROW_TYPE_LABELS: Record<RowType, string> = {
  show: "AMOPS Show Time",
  open: "Airfield Open",
  flight: "Flight",
  close: "Airfield Close",
};

export type WarmStatusRow = {
  id: string;
  row_type: RowType;
  time: string | null;
  callsign: string | null;
  eta: string | null;
  etd: string | null;
};

export type TimelineEvent = { sortKey: string; time: string; label: string };

// Flattens a day's rows into one time-sorted list. A flight with both ETA
// and ETD produces two separate lines (not combined), since they may be
// far apart and each deserves its own place in the timeline.
export function buildDayTimeline(rows: WarmStatusRow[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const row of rows) {
    if (row.row_type === "flight") {
      if (row.eta) {
        events.push({ sortKey: row.eta, time: row.eta, label: `ETA ${row.callsign ?? ""}`.trim() });
      }
      if (row.etd) {
        events.push({ sortKey: row.etd, time: row.etd, label: `ETD ${row.callsign ?? ""}`.trim() });
      }
    } else if (row.time) {
      const label = row.row_type === "show" ? "Show" : row.row_type === "open" ? "Open" : "Close";
      events.push({ sortKey: row.time, time: row.time, label });
    }
  }

  return events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
