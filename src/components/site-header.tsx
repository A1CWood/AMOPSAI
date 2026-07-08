/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { signOutAction } from "@/app/(app)/actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center gap-3 px-4">
        <MobileNav />
        <img src="/resources/pacaf.png" alt="" className="h-10 w-auto" />
        <h1 className="flex-1 truncate text-base font-semibold sm:text-lg">
          Eielson Airfield Management
        </h1>
        <img src="/resources/354oss.png" alt="" className="hidden h-10 w-auto sm:block" />
        <DesktopNav />
        <form action={signOutAction}>
          <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Sign out">
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
