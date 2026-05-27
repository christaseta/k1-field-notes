"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteResult =
  | { ok: true; url: string; created: boolean }
  | { ok: false; error: string };

export async function generateInviteLink(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const sellerUrl =
    process.env.SELLER_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const supabase = createAdminClient();

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) return { ok: false, error: listErr.message };

  let user = list.users.find((u) => u.email === email);
  let created = false;
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) return { ok: false, error: error.message };
    user = data.user;
    created = true;
  } else if (!user.email_confirmed_at) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (error) return { ok: false, error: error.message };
  }

  // Update the seller row with the labels the admin typed. Only overwrite
  // fields if a value was provided so we don't blank existing labels on
  // re-invite.
  const updates: Record<string, string> = {};
  if (displayName) updates.display_name = displayName;
  if (businessName) updates.business_name = businessName;
  if (Object.keys(updates).length > 0) {
    await supabase.from("sellers").update(updates).eq("id", user.id);
  }

  const redirectTo = `${sellerUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/home")}`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (error) return { ok: false, error: error.message };

  const tokenHash = data?.properties?.hashed_token;
  if (!tokenHash) {
    return { ok: false, error: "Supabase returned no hashed_token." };
  }
  const linkType = data.properties.verification_type ?? "magiclink";

  const url = new URL(`${sellerUrl.replace(/\/$/, "")}/auth/callback`);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", linkType);
  url.searchParams.set("next", "/home");

  revalidatePath("/admin/invite");
  return { ok: true, url: url.toString(), created };
}
