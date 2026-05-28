import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-auth";
import { appSurface } from "@/lib/app-surface";
import AdminNav from "./AdminNav";
import "./dashboard.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // On the admin deployment the proxy enforces HTTP Basic Auth — no further
  // per-user check needed. On the seller deployment /admin is 404'd at the
  // proxy, so this branch never runs there.
  if (appSurface() !== "admin") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/signin?next=/admin");
    if (!isAdmin(user)) redirect("/home");
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-shell__main">{children}</div>
    </div>
  );
}
