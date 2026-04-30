import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: seller } = await supabase
    .from("sellers")
    .select("display_name, weekly_day_pref")
    .single();

  return (
    <div className="pt-6 space-y-6">
      <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] text-[var(--text-strong)] font-medium">
        Settings
      </h1>

      <div className="bg-[var(--bg-card)] rounded-3xl p-6">
        <SettingsForm
          displayName={seller?.display_name ?? ""}
          weeklyDayPref={seller?.weekly_day_pref ?? null}
        />
      </div>

      <div className="bg-[var(--bg-card)] rounded-3xl p-6 space-y-3">
        <p className="text-[14px] text-[var(--text-subtle)]">Signed in as</p>
        <p className="text-[16px] text-[var(--text-strong)] break-all">
          {user?.email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-2xl border border-[var(--divider)] text-[var(--text-standard)] font-medium hover:bg-[#222]"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
