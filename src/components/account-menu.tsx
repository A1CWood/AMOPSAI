/* eslint-disable @next/next/no-img-element -- fixed-size logo asset, next/image sizing not worth the ceremony here */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOutAction } from "@/app/(app)/actions";

export function AccountMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 items-center rounded-md p-1 hover:bg-white/10"
        aria-label={email ? "Account menu" : "Sign in"}
      >
        <img src="/resources/pacaf.png" alt="" className="h-14 w-auto sm:h-24 lg:h-28" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-md border border-[#444] bg-[#222] p-3 text-white shadow-lg">
            {email ? (
              <>
                <p className="text-xs text-white/60">Logged in as</p>
                <p className="mb-3 truncate text-sm font-medium">{email}</p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-11 w-full rounded-md bg-white/10 px-3 text-left text-sm hover:bg-white/20"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md bg-white/10 px-3 text-sm hover:bg-white/20"
              >
                Sign in
              </Link>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
