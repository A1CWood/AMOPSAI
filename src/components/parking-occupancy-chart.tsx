"use client";

import { useMemo } from "react";

import {
  assignmentsInRange,
  type ParkingApron,
  type ParkingAssignment,
  type ParkingSpot,
} from "@/lib/parking";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatHour(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// A 24-hour Gantt-style board: rows are spots (grouped by apron), the
// x-axis is today's timeline, and bars are assignments overlapping today.
// Shares the same spot/assignment data as ParkingMap, so the two views
// can never drift out of sync with each other.
export function ParkingOccupancyChart({
  aprons,
  spots,
  assignments,
}: {
  aprons: ParkingApron[];
  spots: ParkingSpot[];
  assignments: ParkingAssignment[];
}) {
  const rangeStart = useMemo(() => startOfDay(new Date()), []);
  const rangeEnd = useMemo(() => new Date(rangeStart.getTime() + 24 * 60 * 60 * 1000), [rangeStart]);
  const rangeMs = rangeEnd.getTime() - rangeStart.getTime();

  const apronById = useMemo(() => new Map(aprons.map((apron) => [apron.id, apron])), [aprons]);
  const spotsByApron = useMemo(() => {
    const map = new Map<string, ParkingSpot[]>();
    for (const spot of spots) {
      const list = map.get(spot.apron_id) ?? [];
      list.push(spot);
      map.set(spot.apron_id, list);
    }
    return map;
  }, [spots]);

  function barStyle(assignment: ParkingAssignment) {
    const start = new Date(assignment.start_time);
    const end = assignment.end_time ? new Date(assignment.end_time) : rangeEnd;
    const left = Math.max(0, (start.getTime() - rangeStart.getTime()) / rangeMs) * 100;
    const right = Math.min(100, ((end.getTime() - rangeStart.getTime()) / rangeMs) * 100);
    return { left: `${left}%`, width: `${Math.max(right - left, 0.5)}%` };
  }

  if (spots.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No parking spots configured yet.</p>;
  }

  const hourMarks = Array.from({ length: 9 }, (_, i) => i * 3);

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      <div className="grid min-w-[40rem] grid-cols-[8rem_1fr] gap-x-2 text-[10px] text-gray-400">
        <div />
        <div className="relative h-4 border-b border-[#333]">
          {hourMarks.map((hour) => (
            <span key={hour} className="absolute -translate-x-1/2" style={{ left: `${(hour / 24) * 100}%` }}>
              {String(hour).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>

      {[...spotsByApron.entries()].map(([apronId, apronSpots]) => (
        <div key={apronId} className="flex min-w-[40rem] flex-col gap-0.5">
          <p className="pt-2 text-xs font-semibold text-gray-300">{apronById.get(apronId)?.label ?? "Apron"}</p>
          {apronSpots.map((spot) => {
            const spotAssignments = assignmentsInRange(
              assignments.filter((a) => a.spot_id === spot.id),
              rangeStart,
              rangeEnd,
            );
            return (
              <div key={spot.id} className="grid grid-cols-[8rem_1fr] items-center gap-x-2">
                <span className="truncate text-xs text-gray-400">{spot.label}</span>
                <div className="relative h-6 rounded bg-[#222]">
                  {spotAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="absolute top-0.5 bottom-0.5 overflow-hidden rounded bg-amber-500/80"
                      style={barStyle(assignment)}
                      title={`${assignment.aircraft}: ${formatHour(new Date(assignment.start_time))} - ${
                        assignment.end_time ? formatHour(new Date(assignment.end_time)) : "open"
                      }`}
                    >
                      <span className="block truncate px-1 text-[10px] leading-6 text-black">
                        {assignment.aircraft}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
