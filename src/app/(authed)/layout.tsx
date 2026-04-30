import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomTabBar } from "@/components/BottomTabBar";

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
      {/* Title bar */}
      <header className="safe-area-inset-top">
        <div className="max-w-md mx-auto px-4 py-2.5">
          <p className="text-[16px] font-medium text-[var(--text-strong)]">
            Field Notes
          </p>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pb-28">
        {children}
      </main>

      <BottomTabBar />
    </div>
  );
}
