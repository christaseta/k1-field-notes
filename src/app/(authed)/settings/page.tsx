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
          <p className="text-[16px] text-[var(--text-strong)]">Get support</p>
          <p className="text-[16px] text-[var(--text-subtle)]">
            Having an issue? Reach out directly to the K1 team.
          </p>
          <a
            href="mailto:k1-team@squareup.com?subject=Field%20Notes%20support"
            className="w-full mt-2 inline-flex items-center justify-center min-h-[64px] px-6 rounded-full bg-[#2A2A2A] text-[var(--text-standard)] text-[16px] font-medium hover:bg-[#333]"
          >
            Email the K1 team
          </a>
        </div>

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
