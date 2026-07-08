import { QuickLinkTile } from "@/components/quick-link-tile";
import { QUICK_LINKS } from "@/data/quick-links";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-wrap justify-center gap-4 p-5">
      {QUICK_LINKS.map((link) => (
        <QuickLinkTile key={link.label} {...link} />
      ))}
    </div>
  );
}
