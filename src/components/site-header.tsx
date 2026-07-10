/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { signOutAction } from "@/app/(app)/actions";

export function SiteHeader({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="sticky top-0 z-10">
      <div className="flex items-center gap-3 bg-[#333] px-4 py-2">
        <MobileNav />
        <img src="/resources/pacaf.png" alt="" className="h-14 w-auto sm:h-24 lg:h-28" />
        <h1 className="flex-1 truncate text-center text-base font-bold text-white sm:text-2xl">
          Eielson Airfield Management
        </h1>
        <img
          src="/resources/354oss.png"
          alt=""
          className="hidden h-14 w-auto sm:block sm:h-24 lg:h-28"
        />
        {isSignedIn ? (
          <form action={signOutAction}>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-white hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="size-5" />
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-white hover:bg-white/10 hover:text-white"
            aria-label="Sign in"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            <LogIn className="size-5" />
          </Button>
        )}
      </div>
      <div className="hidden justify-center bg-[#444] md:flex">
        <DesktopNav />
      </div>
    </header>
  );
}
