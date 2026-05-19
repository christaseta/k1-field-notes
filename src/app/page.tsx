import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
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
