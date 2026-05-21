import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-auth";
import { signOut } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/admin");
  if (!isAdmin(user)) redirect("/home");

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-standard)]">
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-6 text-[14px]">
          <Link href="/admin" className="font-medium text-[var(--text-strong)]">
            Field Notes Admin
          </Link>
          <Link href="/admin/submissions" className="text-[var(--text-subtle)] hover:text-[var(--text-strong)]">
            Submissions
          </Link>
          <Link href="/admin/sellers" className="text-[var(--text-subtle)] hover:text-[var(--text-strong)]">
            Sellers
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-[13px] text-[var(--text-subtle)]">
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="hover:text-[var(--text-strong)]">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="px-6 py-8 max-w-[1200px] mx-auto">{children}</main>
    </div>
  );
}
