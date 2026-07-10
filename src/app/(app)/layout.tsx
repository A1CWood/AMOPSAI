import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
