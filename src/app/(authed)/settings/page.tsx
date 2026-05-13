import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { SettingsForm } from "./SettingsForm";
import { TitleBar } from "@/components/TitleBar";

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
    <>
      <TitleBar backHref="/home" />
      <div className="max-w-md w-full mx-auto px-4 pt-6 space-y-6">

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
            className="w-full mt-2 min-h-[64px] px-6 rounded-full bg-[#2A2A2A] text-[var(--text-standard)] text-[16px] font-medium hover:bg-[#333]"
          >
            Sign out
          </button>
        </form>
        </div>
      </div>
    </>
  );
}
