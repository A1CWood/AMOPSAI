/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
import { AccountMenu } from "@/components/account-menu";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader({ email }: { email: string | null }) {
  return (
    <header className="sticky top-0 z-10">
      <div className="flex items-center gap-3 bg-[#333] px-4 py-2">
        <MobileNav />
        <AccountMenu email={email} />
        <h1 className="flex-1 truncate text-center text-base font-bold text-white sm:text-2xl">
          Eielson Airfield Management
        </h1>
        <img
          src="/resources/354oss.png"
          alt=""
          className="hidden h-14 w-auto sm:block sm:h-24 lg:h-28"
        />
      </div>
      <div className="hidden justify-center bg-[#444] md:flex">
        <DesktopNav />
      </div>
    </header>
  );
}
