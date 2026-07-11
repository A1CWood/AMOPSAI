// AISR SP-route batch generator.
//
// A filed flight plan is two lines:
//   EIL2220001 FP VIKNG1 F35/I 6103 450 EIL P2325 200B240
//   EIL.ARUNY4.ARUNY/D2+00..ARUNY..BOGIE..EIL/0125 : SP100
//
// Line 1 fields (space-separated): <aerodrome+filing-time><index> FP
// <callsign> <acft type/equipment> [<IFF>] <speed> <departure aerodrome>
// <departure time> <flight level>. Line 2 is the route + SP designator.
//
// IFF is optional - not every flight plan carries one. It always sits
// right after the aircraft type when present. Since IFF codes are always
// 4 digits and speed is always <= 3 digits, the token right after the
// aircraft type disambiguates the two: 4 digits -> IFF (speed follows);
// anything shorter -> that token *is* the speed, no IFF was given.
//
// Across a formation only the batch index, callsign number, and IFF (a
// base-8/octal squawk code, when present) increment; everything else on
// line 1 and all of line 2 stay fixed from the template. Each "row" in
// the UI specifies its own starting callsign/acft type/IFF/departure time
// and a quantity of aircraft to generate from there.
//
// Basic mode assumes the pasted plan is a real, already-filed aircraft #1
// and continues the formation from it (callsign/IFF + 1). Advanced mode
// assumes the paste is just a blank SP-route template with no meaningful
// per-aircraft data in it - every row starts blank and the user fills in
// everything themselves, since there's nothing real to continue from.

export type ParsedTemplate = {
  prefix: string; // e.g. "EIL2220" (aerodrome + filing time)
  index: string; // e.g. "001", kept as a string to preserve digit width
  callsign: string; // e.g. "VIKNG1"
  acftType: string; // base type only, e.g. "F35" - the "/I" suffix is always
  // appended by generatePlans, never typed by the user or stored here
  iff: string; // e.g. "6103", or "" if the template had none
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
  if (tokens.length < 8) {
    throw new TemplateParseError(
      `Expected at least 8 fields on the first line, found ${tokens.length}. Check the format matches: EIL2220001 FP VIKNG1 F35/I [6103] 450 EIL P2325 200B240`,
    );
  }

  const [prefixAndIndex, fp, callsign, acftTypeRaw, ...remaining] = tokens;
  // Aircraft type always ends in "/I" - strip it since generatePlans always
  // re-appends it, so the stored/edited value is just the base type.
  const acftType = acftTypeRaw.replace(/\/I$/i, "");

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

  // Token right after the aircraft type: 4 digits means IFF (speed
  // follows); otherwise it's speed itself and no IFF was given.
  let iff = "";
  let rest = remaining;
  if (/^\d{4}$/.test(remaining[0] ?? "")) {
    iff = remaining[0];
    rest = remaining.slice(1);
  }

  if (rest.length !== 4) {
    throw new TemplateParseError(
      `Expected speed, departure aerodrome, departure time, and flight level after the ${iff ? "IFF" : "aircraft type"} - found ${rest.length} fields instead.`,
    );
  }
  const [speed, departureAerodrome, departureTime, flightLevel] = rest;

  if (!/^\d{1,3}$/.test(speed)) {
    throw new TemplateParseError(`Speed "${speed}" should be numeric, 3 digits or fewer.`);
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
  iff: string; // "" means no IFF for this formation
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
      const iff = row.iff ? incrementIff(row.iff, i) : "";

      const line1 = [
        `${template.prefix}${index}`,
        "FP",
        callsign,
        `${row.acftType}/I`,
        ...(iff ? [iff] : []),
        template.speed,
        template.departureAerodrome,
        row.departureTime,
        template.flightLevel,
      ].join(" ");

      // Output is always uppercase regardless of what the user typed.
      plans.push({ id: `${row.id}-${i}`, text: `${line1}\n${template.routeLine}`.toUpperCase() });
    }
  }

  return plans;
}

// Basic mode: continue the formation right after the pasted (real,
// already-filed) template aircraft.
export function makeContinuationRow(template: ParsedTemplate, quantity: number): FormationRow {
  return {
    id: crypto.randomUUID(),
    callsign: incrementCallsign(template.callsign, 1),
    acftType: template.acftType,
    iff: template.iff ? incrementIff(template.iff, 1) : "",
    departureTime: template.departureTime,
    quantity,
  };
}

// Advanced mode: the pasted template has no real per-aircraft data, so
// every formation - including the first - starts blank for the user to
// fill in themselves.
export function makeBlankRow(quantity = 4): FormationRow {
  return {
    id: crypto.randomUUID(),
    callsign: "",
    acftType: "",
    iff: "",
    departureTime: "",
    quantity,
  };
}
