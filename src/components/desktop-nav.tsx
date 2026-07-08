"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/components/nav-links";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex min-h-11 items-center px-5 text-sm font-medium text-white transition-colors hover:bg-[#555]",
            pathname === link.href && "bg-[#555]",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
