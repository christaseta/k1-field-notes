import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for demo mode cookie (set via middleware or client)
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo")?.value === "true";

  if (!isDemo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-standard)] flex flex-col">
      <div className="flex-1 pb-8">{children}</div>
    </div>
  );
}
