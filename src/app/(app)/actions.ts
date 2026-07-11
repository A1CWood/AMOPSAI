"use server";

import { createClient } from "@/lib/supabase/server";

// Deliberately does not redirect - signing out just drops edit privileges,
// the site is public either way, so the user should stay exactly where
// they were. The caller (AccountMenu) calls router.refresh() afterward to
// re-render server components with the now-signed-out session.
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
