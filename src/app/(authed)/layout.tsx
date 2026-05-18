import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-standard)] flex flex-col">
      <div className="flex-1 pb-8">{children}</div>
    </div>
  );
}
