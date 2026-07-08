import { QuickLinkTile } from "@/components/quick-link-tile";
import { QUICK_LINKS } from "@/data/quick-links";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {QUICK_LINKS.map((link) => (
        <QuickLinkTile key={link.label} {...link} />
      ))}
    </div>
  );
}
