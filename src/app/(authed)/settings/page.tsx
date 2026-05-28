import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { SettingsPageShell } from "./SettingsPageShell";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SettingsPageShell>
      <div className="max-w-md w-full mx-auto px-4 pt-6 pb-6 space-y-1">
        <div className="bg-[#1A1A1A] rounded-3xl p-6 space-y-3">
          <p className="text-[16px] text-[var(--text-subtle)]">Signed in as</p>
          <p className="text-[16px] text-[var(--text-strong)] break-all">
            {user?.email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full mt-2 min-h-[64px] px-6 rounded-full bg-[#2A2A2A] text-[var(--text-standard)] text-[16px] font-medium hover:bg-[#333]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </SettingsPageShell>
  );
}
