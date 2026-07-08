"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function readHashError(): string | null {
  if (typeof window === "undefined") return null;
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const hashError = hashParams.get("error_description") ?? hashParams.get("error");
  return hashError ? hashError.replace(/\+/g, " ") : null;
}

// Supabase invite/recovery links redirect here with the session token in the
// URL *hash fragment* (e.g. #access_token=... or #error=...), not a query
// param - fragments never reach the server, so this must run client-side.
// The Supabase browser client auto-detects and consumes the fragment on
// load (detectSessionInUrl), which fires an onAuthStateChange event once
// the session is established.
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error] = useState<string | null>(readHashError);

  useEffect(() => {
    if (error) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/update-password");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/update-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [error, router]);

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
