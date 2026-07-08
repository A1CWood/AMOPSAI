// Ported from the old log/log.html canned templates and restructured into
// named fields so the /log/new form can render inputs instead of raw
// underscore blanks.
//
// ** DRAFT - NEEDS AMOPS DOMAIN REVIEW **
// Field labels/order are a best-effort reading of the original text, not
// verified against official AF Form 3616 procedures. Two ambiguities to
// flag specifically:
//   - AFLD split into AFLD-ON/AFLD-OFF, and AAS split into AAS-ON/AAS-OFF:
//     the originals used a single "-OR-" template for both directions.
//   - RFC's six CAT-category blanks are assumed to be availability status
//     per category; confirm the expected values (e.g. AVAILABLE/NOT
//     AVAILABLE) are right.
// Have someone with AMOPS reporting knowledge check every label before
// relying on this for real shift logs.

export type LogTemplateField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
};

export type LogTemplate = {
  code: string;
  title: string;
  bodyTemplate: string; // {{key}} tokens, substituted by renderLogTemplate
  fields: LogTemplateField[];
};

const initials: LogTemplateField = { key: "initials", label: "Completed by (initials)" };

export const LOG_TEMPLATES: LogTemplate[] = [
  {
    code: "FPR",
    title: "Flight Planning Room / Pubs Check",
    bodyTemplate:
      "...FPR...FLIGHT PLANNING ROOM AND PUBS CHECK CMPLT. ALL PUBS ACCOUNTED FOR AND FLIGHT PLANNING ROOM IN GOOD ORDER...{{initials}}",
    fields: [initials],
  },
  {
    code: "NMV",
    title: "NOTAMs Verified",
    bodyTemplate: "...NMV...NOTAMS VERIFIED...{{initials}}",
    fields: [initials],
  },
  {
    code: "SCN",
    title: "Daily PCAS/SCN Check",
    bodyTemplate: "...SCN...DAILY PCAS/SCN CHECK COMPLETE...{{initials}}",
    fields: [initials],
  },
  {
    code: "AFLD-ON",
    title: "Airfield Check - On Airfield",
    bodyTemplate: "...AFLD...{{who}} ON AFLD FOR AFLD {{purpose}}...{{initials}}",
    fields: [
      { key: "who", label: "Who is on the airfield" },
      { key: "purpose", label: "Purpose (e.g. FOD CK)" },
      initials,
    ],
  },
  {
    code: "AFLD-OFF",
    title: "Airfield Check - Off Airfield",
    bodyTemplate: "...AFLD...{{who}} OFF AFLD, AFLD {{purpose}} CMPLT...{{initials}}",
    fields: [
      { key: "who", label: "Who is off the airfield" },
      { key: "purpose", label: "Purpose (e.g. FOD CK)" },
      initials,
    ],
  },
  {
    code: "GUARD",
    title: "Guard Notification",
    bodyTemplate:
      "...GUARD...GUARDING FOR / NO LONGER GUARDING FOR {{subject}}, NOTIFIED VIA AISR...{{initials}}",
    fields: [{ key: "subject", label: "Guarding for / no longer guarding for" }, initials],
  },
  {
    code: "CRY",
    title: "Runway In Use / RWY Change",
    bodyTemplate:
      "...CRY...RWY {{runway}} IN USE, PER TWR/{{twr}}. THE FOLLOWING AGENCIES WERE NOTIFIED: TA/{{ta}}, CP/{{cp}},\nBARRIER MX/{{barrierMx}}, 354TH MOCC/{{mocc354}}, 168TH OPS/{{ops168}}. RWY/BASH/FOD/NAVAIDS/PAPI'S CK CMPLTED BY/{{ckBy}}. QRC 20 CMPLT...{{initials}}",
    fields: [
      { key: "runway", label: "Runway in use" },
      { key: "twr", label: "Tower POC" },
      { key: "ta", label: "TA POC" },
      { key: "cp", label: "CP POC" },
      { key: "barrierMx", label: "Barrier MX POC" },
      { key: "mocc354", label: "354th MOCC POC" },
      { key: "ops168", label: "168th OPS POC" },
      { key: "ckBy", label: "RWY/BASH/FOD/NAVAIDS/PAPI's check completed by" },
      initials,
    ],
  },
  {
    code: "WX",
    title: "WX Warning/Watch/Advisory",
    bodyTemplate:
      "...WX...WX WARNING/WATCH/ADVISORY # {{number}} ISSUED FOR {{hazard}}, VT: {{validTime}}. QRC 10 COMPLETE...{{initials}}",
    fields: [
      { key: "number", label: "Advisory #" },
      { key: "hazard", label: "Issued for" },
      { key: "validTime", label: "Valid time (VT)" },
      initials,
    ],
  },
  {
    code: "AAS-ON",
    title: "AAS Inspection - On Airfield",
    bodyTemplate:
      "...AAS...{{who}} ON AFLD FOR DAILY AIRCRAFT ARRESTING SYSTEM (AAS) INSPECTION...{{initials}}",
    fields: [{ key: "who", label: "Who is on the airfield" }, initials],
  },
  {
    code: "AAS-OFF",
    title: "AAS Inspection - Off Airfield / Complete",
    bodyTemplate:
      "...AAS...{{who}} OFF AFLD, AAS INSPECTION COMPLETE. AAS STATUS: {{status}}...{{initials}}",
    fields: [
      { key: "who", label: "Who is off the airfield" },
      { key: "status", label: "AAS status" },
      initials,
    ],
  },
  {
    code: "RSC",
    title: "Runway Surface Condition (RSC)",
    bodyTemplate:
      "...RSC...RSC TAKEN BY {{takenBy}}, REPORTED AS {{reportedAs}}. THE FOLLOWING AGENCIES WERE NOTIFIED: TWR/{{twr}},\nCP/{{cp}}, WX/{{wx}}, SNOWBARN/{{snowbarn}}, 168TH OPS/{{ops168}}. IDS-5 UPDATED BY {{idsUpdatedBy}}. QRC 20 COMPLETE...{{initials}}",
    fields: [
      { key: "takenBy", label: "RSC taken by" },
      { key: "reportedAs", label: "Reported as" },
      { key: "twr", label: "Tower POC" },
      { key: "cp", label: "CP POC" },
      { key: "wx", label: "WX POC" },
      { key: "snowbarn", label: "Snow Barn POC" },
      { key: "ops168", label: "168th OPS POC" },
      { key: "idsUpdatedBy", label: "IDS-5 updated by" },
      initials,
    ],
  },
  {
    code: "RCR",
    title: "Runway Condition Reading (RCR)",
    bodyTemplate:
      "...RCR...RCR TAKEN BY {{takenBy}}, REPORTED AS {{reportedAs}}. THE FOLLOWING AGENCIES WERE NOTIFIED: TWR/{{twr}},\nCP/{{cp}}, WX/{{wx}}, SNOWBARN/{{snowbarn}}, 168TH OPS/{{ops168}}. QRC 20 COMPLETE...{{initials}}",
    fields: [
      { key: "takenBy", label: "RCR taken by" },
      { key: "reportedAs", label: "Reported as" },
      { key: "twr", label: "Tower POC" },
      { key: "cp", label: "CP POC" },
      { key: "wx", label: "WX POC" },
      { key: "snowbarn", label: "Snow Barn POC" },
      { key: "ops168", label: "168th OPS POC" },
      initials,
    ],
  },
  {
    code: "BWC",
    title: "Bird Watch Condition (BWC) Change",
    bodyTemplate:
      "...BWC...BWC CHANGED TO: {{newCondition}}. LOCATION/NUMBER/TYPE OF BIRDS: {{birdDetails}}. {{responder}} RESPONDED TO THE AFLD,\nQRC 15 COMPLETE...{{initials}}",
    fields: [
      { key: "newCondition", label: "BWC changed to" },
      { key: "birdDetails", label: "Location/number/type of birds" },
      { key: "responder", label: "Responder" },
      initials,
    ],
  },
  {
    code: "BDP",
    title: "BASH / Wildlife Response",
    bodyTemplate:
      "...BDP...BASH/WILDLIFE RESPONSE\nCURRENT BWC: {{currentBwc}}\nTIME OF ACTIVITY: {{timeOfActivity}}\nWX CONDITIONS: {{wxConditions}}\nLOCATIONS OF ACTIVITY: {{locations}}\nSPECIES: {{species}}\nESTIMATED NUMBER OF BIRDS/ANIMALS: {{estimatedNumber}}\nDISPERSAL METHOD: {{dispersalMethod}}\nRESPONDING AO: {{respondingAo}}...{{initials}}",
    fields: [
      { key: "currentBwc", label: "Current BWC" },
      { key: "timeOfActivity", label: "Time of activity" },
      { key: "wxConditions", label: "WX conditions" },
      { key: "locations", label: "Location(s) of activity" },
      { key: "species", label: "Species" },
      { key: "estimatedNumber", label: "Estimated number of birds/animals" },
      { key: "dispersalMethod", label: "Dispersal method" },
      { key: "respondingAo", label: "Responding AO" },
      initials,
    ],
  },
  {
    code: "BS",
    title: "Bird Strike",
    bodyTemplate:
      "...BS...BIRD STRIKE\nLOCATION: {{location}}\nSPECIES: {{species}}\nCALLSIGN: {{callsign}}\nTYPE ACFT: {{acftType}}\nWAS CREW AWARE OF THE STRIKE? {{crewAware}}\nDID THE CREW FILE AN AF FORM 853? {{form853}}\nWERE FEATHERS PLUCKED AND PLACED IN ENVELOPE? {{feathersPlucked}}\nWAS AMOPS ADVISED OF BIRD STRIKE? {{amopsAdvised}}\nDID AMOPS FIND THE BIRD ON A CHECK OR INSPECTION? {{foundOnCheck}}\nQRC 15 COMPLETE...{{initials}}",
    fields: [
      { key: "location", label: "Location" },
      { key: "species", label: "Species" },
      { key: "callsign", label: "Callsign" },
      { key: "acftType", label: "Type ACFT" },
      { key: "crewAware", label: "Was crew aware of the strike?" },
      { key: "form853", label: "Did the crew file an AF Form 853?" },
      { key: "feathersPlucked", label: "Were feathers plucked and placed in envelope?" },
      { key: "amopsAdvised", label: "Was AMOPS advised of bird strike?" },
      { key: "foundOnCheck", label: "Did AMOPS find the bird on a check or inspection?" },
      initials,
    ],
  },
  {
    code: "DEP",
    title: "Depredation",
    bodyTemplate:
      "...DEP...THE FOLLOWING BIRDS/MAMMALS WERE DEPREDATED: {{species}}. QUANTITY: {{quantity}}...{{initials}}",
    fields: [
      { key: "species", label: "Birds/mammals depredated" },
      { key: "quantity", label: "Quantity" },
      initials,
    ],
  },
  {
    code: "NTM",
    title: "NOTAM Comeback Copy",
    bodyTemplate:
      "...NTM...{{comebackCopy}}\n\nTHE FOLLOWING AGENCIES WERE NOTIFIED:\nTWR/{{twr}}, AF MGMT/{{afMgmt}}.\nOTHER APPLICABLE AGENCIES NOTIFIED: {{otherAgencies}}.\n...",
    fields: [
      { key: "comebackCopy", label: "Comeback copy body (paste here)", type: "textarea" },
      { key: "twr", label: "Tower POC" },
      { key: "afMgmt", label: "AF Mgmt POC" },
      { key: "otherAgencies", label: "Other applicable agencies notified" },
    ],
  },
  {
    code: "IFE",
    title: "In-Flight Emergency",
    bodyTemplate:
      "...IFE...CALL SIGN: {{callsign}}\nTYPE ACFT: {{acftType}}\nNATURE OF EMERGENCY: {{nature}}\nSOULS ON BOARD: {{soulsOnBoard}}\nFUEL ON BOARD: {{fuelOnBoard}}\nLANDING RWY: {{landingRwy}}\nETA: {{eta}}\nCURRENT WINDS: {{currentWinds}}\nRESPONDING AO: {{respondingAo}}\nTERMINATION TIME: {{terminationTime}}\nADDITIONAL INFORMATION: {{additionalInfo}}\n\nSECONDARY CRASH PHONE ACTIVATED AT {{crashPhoneTime}}, QRC 2 COMPLETE...{{initials}}",
    fields: [
      { key: "callsign", label: "Call sign" },
      { key: "acftType", label: "Type ACFT" },
      { key: "nature", label: "Nature of emergency" },
      { key: "soulsOnBoard", label: "Souls on board" },
      { key: "fuelOnBoard", label: "Fuel on board" },
      { key: "landingRwy", label: "Landing RWY" },
      { key: "eta", label: "ETA" },
      { key: "currentWinds", label: "Current winds" },
      { key: "respondingAo", label: "Responding AO" },
      { key: "terminationTime", label: "Termination time" },
      { key: "additionalInfo", label: "Additional information", type: "textarea" },
      { key: "crashPhoneTime", label: "Secondary crash phone activated at" },
      initials,
    ],
  },
  {
    code: "GE",
    title: "Ground Emergency",
    bodyTemplate:
      "...GE...CALL SIGN: {{callsign}}\nTYPE ACFT/EQUIP: {{acftEquipType}}\nNATURE OF EMERGENCY: {{nature}}\nSOULS ON BOARD: {{soulsOnBoard}}\nFUEL ON BOARD: {{fuelOnBoard}}\nLOCATION: {{location}}\nCURRENT WINDS: {{currentWinds}}\nOTHER INFORMATION: {{otherInfo}}\nRESPONDING AO: {{respondingAo}}\nTERMINATION TIME: {{terminationTime}}\nADDITIONAL INFORMATION: {{additionalInfo}}\n\nSECONDARY CRASH PHONE ACTIVATED AT {{crashPhoneTime}}, QRC 2 COMPLETE...{{initials}}",
    fields: [
      { key: "callsign", label: "Call sign" },
      { key: "acftEquipType", label: "Type ACFT/EQUIP" },
      { key: "nature", label: "Nature of emergency" },
      { key: "soulsOnBoard", label: "Souls on board" },
      { key: "fuelOnBoard", label: "Fuel on board" },
      { key: "location", label: "Location" },
      { key: "currentWinds", label: "Current winds" },
      { key: "otherInfo", label: "Other information", type: "textarea" },
      { key: "respondingAo", label: "Responding AO" },
      { key: "terminationTime", label: "Termination time" },
      { key: "additionalInfo", label: "Additional information", type: "textarea" },
      { key: "crashPhoneTime", label: "Secondary crash phone activated at" },
      initials,
    ],
  },
  {
    code: "FA",
    title: "Fighter/Tanker Alert Mission Launch",
    bodyTemplate:
      "...FA...FIGHTER/TANKER ALERT MISSION LAUNCH. START TIME/{{startTime}}Z\n\nAFLD3/{{afld3}} RESPONDING TO AFLD FOR FOD CK.\n\nFLIGHT PLAN FILED NOTIFIED TWR/{{twr}}\nBARRIER MX/{{barrierMx}}, NOTIFIED FOR BARRIER CONFIGURATION (IF APPLICABLE)\nNOTAM SENT.\nDEPATURE TIME/{{departureTime}}Z\nQRC 27/29 COMPLETE...{{initials}}",
    fields: [
      { key: "startTime", label: "Start time (Z)" },
      { key: "afld3", label: "AFLD3 (responding to AFLD for FOD ck)" },
      { key: "twr", label: "Tower POC (flight plan filed notified)" },
      { key: "barrierMx", label: "Barrier MX POC" },
      { key: "departureTime", label: "Departure time (Z)" },
      initials,
    ],
  },
  {
    code: "CUS",
    title: "Customs Inbound Info",
    bodyTemplate:
      "...CUS... CUSTOMS INBOUND INFO\n\n- ACFT CALL SIGN: {{callsign}}\n- ACFT TYPE: {{acftType}}\n- NATIONALITY OF ACFT ORIGIN: {{nationality}}\n- COUNTRY PRIOR TO US: {{countryPrior}}\n- DATE OF ETA: {{etaDate}}\n- CARGO/HAZ: {{cargoHaz}}\n- NUMBER OF CREW MEMBERS: {{crewCount}}\n- NUMBER OF PASSENGERS: {{paxCount}}\n- PARKING SPOT: {{parkingSpot}}\n\n-{{providedBy}} PROVIDED INFO TO THE FOLLOWING: SF DESK/{{sfDeskPoc}} @ {{sfDeskTime}}L, FAIRBANKS CUSTOMS OFFICE EMAILED @ {{customsEmailTime}}L. QRC 17 COMPLETE BY\n{{initials}}",
    fields: [
      { key: "callsign", label: "ACFT call sign" },
      { key: "acftType", label: "ACFT type" },
      { key: "nationality", label: "Nationality of ACFT origin" },
      { key: "countryPrior", label: "Country prior to US" },
      { key: "etaDate", label: "Date of ETA" },
      { key: "cargoHaz", label: "Cargo/HAZ" },
      { key: "crewCount", label: "Number of crew members" },
      { key: "paxCount", label: "Number of passengers" },
      { key: "parkingSpot", label: "Parking spot" },
      { key: "providedBy", label: "Info provided by" },
      { key: "sfDeskPoc", label: "SF Desk POC" },
      { key: "sfDeskTime", label: "SF Desk time (L)" },
      { key: "customsEmailTime", label: "Fairbanks Customs email time (L)" },
      initials,
    ],
  },
  {
    code: "RFC",
    title: "Reduced/Restored Fire Fighting Capability",
    bodyTemplate:
      "...RFC...NOTIFIED BY FIRE DEPT OF REDUCED/RESTORED FIRE FIGHTING CAPABILITY AS INDICATED:\n\nCAT 10 {{cat10}} (C-5A/B)\nCAT 9 {{cat9}} (E-4, VC-25, MD-11, 747, 777, KC-10)\nCAT 7-8 {{cat7_8}} (B-1, B-2, B-52, C-17, KC/EC-135, E-3A, 767, 727)\nCAT 6 {{cat6}} (AC-130, C-9, C-22, C-32, C-37, C-40, C-130, E-3, E-8, MH-53, T-43, VC-137)\nCAT 5 {{cat5}} (C-20)\nCAT 1-4 {{cat1_4}} (A-10, BQM-34, C-12, C-21, CV-22, C-38, F-15, F-16, F-22, F-117, HH60, T-1, T-37, T-38, T-6,\nUH-1, UV18, U-2)\n\nNOTIFICATIONS\nTWR/{{twr}}, SOF/{{sof}}, CP/{{cp}}, 168TH OPS/{{ops168}}\nVIA EMAIL-AFM/{{afm}}, DAFM/{{dafm}}, NAMO/{{namo}}, AOF CC/{{aofCc}}\n\nNOTAM ISSUED BY {{notamIssuedBy}} AT {{notamTime}}, QRC #25 CMPLT...{{initials}}",
    fields: [
      { key: "cat10", label: "CAT 10 status (C-5A/B)" },
      { key: "cat9", label: "CAT 9 status" },
      { key: "cat7_8", label: "CAT 7-8 status" },
      { key: "cat6", label: "CAT 6 status" },
      { key: "cat5", label: "CAT 5 status" },
      { key: "cat1_4", label: "CAT 1-4 status" },
      { key: "twr", label: "Tower POC" },
      { key: "sof", label: "SOF POC" },
      { key: "cp", label: "CP POC" },
      { key: "ops168", label: "168th OPS POC" },
      { key: "afm", label: "AFM (email)" },
      { key: "dafm", label: "DAFM (email)" },
      { key: "namo", label: "NAMO (email)" },
      { key: "aofCc", label: "AOF CC (email)" },
      { key: "notamIssuedBy", label: "NOTAM issued by" },
      { key: "notamTime", label: "NOTAM issued at" },
      initials,
    ],
  },
  {
    code: "ARC",
    title: "Airfield Restriction & Closures",
    bodyTemplate:
      "...ARC...AIRFIELD RESTRICTION & CLOSURES:\n\n{{location}} CLOSED {{reason}}, VALID TIME {{validTime}}, NOTIFIED BY {{notifiedBy}}.\n\nTHE FOLLOWING AGENCIES WERE NOTIFIED: TWR/{{twr}}, CP/{{cp1}}, TA/{{ta}}, SAFETY/{{safety}}, CP/{{cp2}}, FD{{fd}}, AFM/DAFM/AMOM{{afmChain}} (NOTIFIED AOF\nCC). QRC ## COMPLETE...{{initials}}",
    fields: [
      { key: "location", label: "Location closed" },
      { key: "reason", label: "Reason for restriction" },
      { key: "validTime", label: "Valid time" },
      { key: "notifiedBy", label: "Notified by" },
      { key: "twr", label: "Tower POC" },
      { key: "cp1", label: "CP POC (1)" },
      { key: "ta", label: "TA POC" },
      { key: "safety", label: "Safety POC" },
      { key: "cp2", label: "CP POC (2)" },
      { key: "fd", label: "FD POC" },
      { key: "afmChain", label: "AFM/DAFM/AMOM POC" },
      initials,
    ],
  },
  {
    code: "XXX",
    title: "Exercise Banner",
    bodyTemplate:
      "...XXX...EXERCISE...EXERCISE...EXERCISE...{{exerciseInfo}}...EXERCISE...EXERCISE...EXERCISE...{{initials}}",
    fields: [{ key: "exerciseInfo", label: "Exercise name/info" }, initials],
  },
  {
    code: "ISO",
    title: "Ramp ISO Notification",
    bodyTemplate:
      "...ISO...RAMP ISO NOTIFICATION/ACTIVATION/TERMINATION, VT: {{validTime}}\n\nTHE FOLLOWING AGENCIES WERE NOTIFIED:\nTWR/{{twr}}\nVIA EMAIL AFM/DAFM/NAMO/AOF/CC/{{emailChain}}.\nVIA RAMP NET PERSONNEL ON AFLD/{{rampNetPersonnel}}.\n\nOC 1 INITIATED/CMPLT...{{initials}}",
    fields: [
      { key: "validTime", label: "Valid time (VT)" },
      { key: "twr", label: "Tower POC" },
      { key: "emailChain", label: "AFM/DAFM/NAMO/AOF/CC (email)" },
      { key: "rampNetPersonnel", label: "Ramp net personnel on airfield" },
      initials,
    ],
  },
  {
    code: "QHR",
    title: "Quiet Hours",
    bodyTemplate:
      "...QHR...QUIET HOURS NOTIFICATION/ACTIVATION/TERMINATION\n\nQUIET HOURS IN EFFECT VT: {{validTime}}.\n\nTHE FOLLOWING AGENCIES WERE NOTIFIED:\nTWR/{{twr}}, TA/{{ta}}, FUELS/{{fuels}}, FD/{{fd}}, CP/{{cp}}, AFM/AAFM/AMOM/{{afmChain}}, TRANSIENT AIRCREWS/{{transientAircrews}}. QC 3 CMPLT...{{initials}}.",
    fields: [
      { key: "validTime", label: "Valid time (VT)" },
      { key: "twr", label: "Tower POC" },
      { key: "ta", label: "TA POC" },
      { key: "fuels", label: "Fuels POC" },
      { key: "fd", label: "FD POC" },
      { key: "cp", label: "CP POC" },
      { key: "afmChain", label: "AFM/AAFM/AMOM POC" },
      { key: "transientAircrews", label: "Transient aircrews notified" },
      initials,
    ],
  },
];

export function renderLogTemplate(template: LogTemplate, values: Record<string, string>): string {
  return template.fields.reduce((body, field) => {
    const value = values[field.key]?.trim();
    return body.split(`{{${field.key}}}`).join(value || "___");
  }, template.bodyTemplate);
}
