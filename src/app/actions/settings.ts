"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { ok: boolean; message: string } | null;

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const dayRaw = String(formData.get("weekly_day_pref") ?? "");
  const day = dayRaw === "" ? null : Number(dayRaw);

  if (day !== null && (Number.isNaN(day) || day < 0 || day > 6)) {
    return { ok: false, message: "Pick a day of the week." };
  }

  const { error } = await supabase
    .from("sellers")
    .update({
      display_name: displayName || null,
      weekly_day_pref: day,
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/home");
  return { ok: true, message: "Saved." };
}
