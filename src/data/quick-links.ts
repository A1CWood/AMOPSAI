// Ported 1:1 from the old index.html tile grid. Static config by design -
// see plan doc: changing a URL/logo is a code change + redeploy, not a form.
export type QuickLink = {
  label: string;
  href: string;
  logo: string;
};

export const QUICK_LINKS: QuickLink[] = [
  {
    label: "NOTAM Check",
    href: "https://www.daip.jcs.mil/daip/mobile/index",
    logo: "/resources/notamlg.gif",
  },
  {
    label: "Submit NOTAM",
    href: "https://notams.aim.faa.gov/dnotam/#1",
    logo: "/resources/notamlg.gif",
  },
  {
    label: "GDSS",
    href: "https://gdss.maf.ustranscom.mil/gdss2web/gdss2main.php",
    logo: "/resources/gdsslg.png",
  },
  {
    label: "FLIPS",
    href: "https://aeronautical.nga.mil/",
    logo: "/resources/flipslg.png",
  },
  {
    label: "RT3 Website",
    href: "http://rt3grip.com/",
    logo: "/resources/rt3lg.png",
  },
  {
    label: "Flight Tracker (TSD)",
    href: "https://tsd.fly.faa.gov/",
    logo: "/resources/tsdlg.jpg",
  },
  {
    label: "Air Force Portal",
    href: "https://www.my.af.mil/",
    logo: "/resources/aflg.png",
  },
  {
    label: "AISR",
    href: "https://www.aisr.nas.faa.gov/AISR/",
    logo: "/resources/aisrlg.png",
  },
  {
    label: "BiFROST",
    href: "https://bifrost.afweather.mil/ui/dashboard/",
    logo: "/resources/radarlg.png",
  },
  {
    label: "ALAN / CALP",
    href: "https://usaf.dps.mil/sites/10889/airports/SitePages/Home.aspx",
    logo: "/resources/alanlg.png",
  },
  {
    label: "Omni Pex",
    href: "https://www.omni.af.mil/",
    logo: "/resources/pexlg.png",
  },
  {
    label: "C2IMERA",
    href: "https://c2imera.cce.af.mil/eielson/#!/u/Home",
    logo: "/resources/c2lg.png",
  },
  {
    label: "AFFSA",
    href: "https://usaf.dps.mil/sites/affsa",
    logo: "/resources/affsalg.jpg",
  },
  {
    label: "Airfield Driving",
    href: "https://aodms.af.mil/AirfieldDriving",
    logo: "/resources/drivelg.png",
  },
  {
    label: "Eielson Weather Sharepoint",
    href: "https://usaf.dps.mil/sites/eielson/354FW/354OG/354OSS/OSW/SitePages/Home.aspx",
    logo: "/resources/wxlg.png",
  },
];
