"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/components/nav-links";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-white hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-[#444] bg-[#333]">
        <SheetHeader>
          <SheetTitle className="text-white">AMOPS</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-white",
                pathname === link.href ? "bg-[#555]" : "hover:bg-[#555]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
