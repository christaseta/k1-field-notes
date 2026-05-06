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
      {/*
        Pages own their own TitleBar (full-bleed) + content container so the
        title bar can adapt to the screen (e.g. flow screens show step counter).
      */}
      <div className="flex-1 pb-28">{children}</div>
      <BottomTabBar />
    </div>
  );
}
