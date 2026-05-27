import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { appSurface } from "@/lib/app-surface";

export default async function RootPage() {
  if (appSurface() === "admin") {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo")?.value === "true";

  if (isDemo) {
    redirect("/home");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/home" : "/signin");
}
