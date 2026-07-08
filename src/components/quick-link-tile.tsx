/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
import type { QuickLink } from "@/data/quick-links";

export function QuickLinkTile({ label, href, logo }: QuickLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 flex-col items-center justify-end gap-2 rounded-lg border bg-card p-4 text-center transition-shadow hover:shadow-md"
    >
      <img src={logo} alt="" className="h-16 max-w-full object-contain" />
      <p className="text-sm font-medium">{label}</p>
    </a>
  );
}
