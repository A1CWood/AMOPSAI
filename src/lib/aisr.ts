// AISR SP-route batch generator.
//
// A filed flight plan is two lines:
//   EIL2220001 FP VIKNG1 F35/I 6103 450 EIL P2325 200B240
//   EIL.ARUNY4.ARUNY/D2+00..ARUNY..BOGIE..EIL/0125 : SP100
//
// Line 1 fields (space-separated): <aerodrome+filing-time><index> FP
// <callsign> <acft type/equipment> <IFF> <speed> <departure aerodrome>
// <departure time> <flight level>. Line 2 is the route + SP designator.
//
// Across a formation only the batch index, callsign number, and IFF
// (a base-8/octal squawk code) increment; everything else on line 1 and
// all of line 2 stay fixed from the template. Each "row" in the UI
// specifies its own starting callsign/acft type/IFF/departure time and a
// quantity of aircraft to generate from there - basic mode is just a
// single auto-filled row continuing right after the pasted template.

export type ParsedTemplate = {
  prefix: string; // e.g. "EIL2220" (aerodrome + filing time)
  index: string; // e.g. "001", kept as a string to preserve digit width
  callsign: string; // e.g. "VIKNG1"
  acftType: string; // e.g. "F35/I"
  iff: string; // e.g. "6103"
  speed: string; // e.g. "450"
  departureAerodrome: string; // e.g. "EIL"
  departureTime: string; // e.g. "P2325"
  flightLevel: string; // e.g. "200B240"
  routeLine: string; // second line, verbatim
};

export class TemplateParseError extends Error {}

export function parseTemplate(raw: string): ParsedTemplate {
  const lines = raw
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new TemplateParseError("Paste both lines of the flight plan (FP line and route line).");
  }

  const [line1, routeLine] = lines;
  const tokens = line1.split(/\s+/);
  if (tokens.length !== 9) {
    throw new TemplateParseError(
      `Expected 9 fields on the first line, found ${tokens.length}. Check the format matches: EIL2220001 FP VIKNG1 F35/I 6103 450 EIL P2325 200B240`,
    );
  }

  const [prefixAndIndex, fp, callsign, acftType, iff, speed, departureAerodrome, departureTime, flightLevel] =
    tokens;

  if (fp !== "FP") {
    throw new TemplateParseError(`Expected "FP" as the second field, found "${fp}".`);
  }

  const prefixMatch = prefixAndIndex.match(/^(.*?)(\d{3})$/);
  if (!prefixMatch) {
    throw new TemplateParseError(
      `Couldn't split "${prefixAndIndex}" into an aerodrome/time prefix and a 3-digit batch index.`,
    );
  }
  const [, prefix, index] = prefixMatch;

  if (!/^\d+$/.test(iff)) {
    throw new TemplateParseError(`IFF "${iff}" should be all digits (an octal squawk code).`);
  }

  return {
    prefix,
    index,
    callsign,
    acftType,
    iff,
    speed,
    departureAerodrome,
    departureTime,
    flightLevel,
    routeLine,
  };
}

export function incrementCallsign(callsign: string, delta: number): string {
  const match = callsign.match(/^(.*?)(\d+)$/);
  if (!match) return callsign;
  const [, base, numStr] = match;
  const next = parseInt(numStr, 10) + delta;
  return `${base}${next}`;
}

// IFF/squawk codes are 4-digit octal (digits 0-7 only) - increment as a
// base-8 integer so e.g. "6107" + 1 -> "6110", not "6108".
export function incrementIff(iff: string, delta: number): string {
  const value = parseInt(iff, 8) + delta;
  return value.toString(8).padStart(iff.length, "0");
}

export function incrementIndex(index: string, delta: number): string {
  const value = parseInt(index, 10) + delta;
  return String(value).padStart(index.length, "0");
}

export type FormationRow = {
  id: string;
  callsign: string;
  acftType: string;
  iff: string;
  departureTime: string;
  quantity: number;
};

export type GeneratedPlan = {
  id: string;
  text: string;
};

export function generatePlans(template: ParsedTemplate, rows: FormationRow[]): GeneratedPlan[] {
  const plans: GeneratedPlan[] = [];
  let index = template.index;

  for (const row of rows) {
    for (let i = 0; i < row.quantity; i++) {
      index = incrementIndex(index, 1);
      const callsign = incrementCallsign(row.callsign, i);
      const iff = incrementIff(row.iff, i);

      const line1 = [
        `${template.prefix}${index}`,
        "FP",
        callsign,
        row.acftType,
        iff,
        template.speed,
        template.departureAerodrome,
        row.departureTime,
        template.flightLevel,
      ].join(" ");

      plans.push({ id: `${row.id}-${i}`, text: `${line1}\n${template.routeLine}` });
    }
  }

  return plans;
}

export function makeDefaultRow(template: ParsedTemplate, quantity: number): FormationRow {
  return {
    id: crypto.randomUUID(),
    callsign: incrementCallsign(template.callsign, 1),
    acftType: template.acftType,
    iff: incrementIff(template.iff, 1),
    departureTime: template.departureTime,
    quantity,
  };
}
