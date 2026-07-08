"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type CallbackHash =
  | { status: "error"; message: string }
  | { status: "tokens"; accessToken: string; refreshToken: string }
  | { status: "empty" };

function readCallbackHash(): CallbackHash {
  if (typeof window === "undefined") return { status: "empty" };

  const params = new URLSearchParams(window.location.hash.slice(1));
  const hashError = params.get("error_description") ?? params.get("error");
  if (hashError) return { status: "error", message: hashError.replace(/\+/g, " ") };

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) return { status: "tokens", accessToken, refreshToken };

  return { status: "empty" };
}

// Supabase invite/recovery links redirect here with the session token in the
// URL *hash fragment* (#access_token=...&refresh_token=... or #error=...) -
// fragments never reach the server, so this must run client-side.
//
// The Supabase browser client is configured with flowType: "pkce" (the
// @supabase/ssr default), which makes its built-in URL auto-detection
// (detectSessionInUrl) actively REJECT hash-based tokens as "not a valid
// PKCE flow url" - admin-generated invite/recovery links have no PKCE code
// verifier to match, so they only ever produce hash tokens, never ?code=.
// That auto-detection therefore never applies here; we parse the hash
// ourselves and call setSession() directly with the tokens instead.
export default function AuthCallbackPage() {
  const router = useRouter();
  const [hash] = useState<CallbackHash>(readCallbackHash);
  const [asyncError, setAsyncError] = useState<string | null>(null);

  useEffect(() => {
    if (hash.status !== "tokens") return;

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: hash.accessToken, refresh_token: hash.refreshToken })
      .then(({ error }) => {
        if (error) {
          setAsyncError(error.message);
        } else {
          router.replace("/update-password");
        }
      });
  }, [hash, router]);

  const error =
    hash.status === "error"
      ? hash.message
      : hash.status === "empty"
        ? "This link is missing required information."
        : asyncError;

  if (error) {
    return (
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          Ask an admin to send you a new invite link.
        </p>
      </div>
    );
  }

  return <p className="text-center text-sm text-muted-foreground">Signing you in...</p>;
}
