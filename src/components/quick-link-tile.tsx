/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
import type { QuickLink } from "@/data/quick-links";

export function QuickLinkTile({ label, href, logo }: QuickLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[150px] w-[200px] flex-col items-center justify-end gap-2 border border-[#444] bg-[#333] p-3 text-center transition-shadow hover:shadow-[0_0_10px_red]"
    >
      <img src={logo} alt="" className="max-h-16 max-w-[100px] object-contain" />
      <p className="text-sm font-medium text-white">{label}</p>
    </a>
  );
}
