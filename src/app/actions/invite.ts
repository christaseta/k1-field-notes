"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio";

export type InviteResult =
  | {
      ok: true;
      url: string;
      created: boolean;
      phone: string | null;
      smsSent?: boolean;
      smsError?: string;
    }
  | { ok: false; error: string };

function sellerUrl(): string {
  return (
    process.env.SELLER_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

async function generateLinkFor(email: string): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const supabase = createAdminClient();
  const redirectTo = `${sellerUrl().replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/home")}`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (error) return { ok: false, error: error.message };
  const tokenHash = data?.properties?.hashed_token;
  if (!tokenHash) return { ok: false, error: "Supabase returned no hashed_token." };
  const linkType = data.properties.verification_type ?? "magiclink";
  const url = new URL(`${sellerUrl().replace(/\/$/, "")}/auth/callback`);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", linkType);
  url.searchParams.set("next", "/home");
  return { ok: true, url: url.toString() };
}

function smsBody(displayName: string | null, url: string): string {
  const greeting = displayName ? `Hi ${displayName.split(" ")[0]}, ` : "";
  return `${greeting}you're invited to the Square Kiosk Alpha. Tap to sign in (link expires in ~60 min): ${url}`;
}

export async function generateInviteLink(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const sendSmsFlag = formData.get("send_sms") === "on";

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

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

  // Update seller row labels. Only overwrite fields if a value was provided.
  // (Cast: createAdminClient isn't generic over the Database schema, so
  // .update() infers 'never' for the payload type.)
  if (displayName || businessName || phone) {
    const patch: { display_name?: string; business_name?: string; phone?: string } = {};
    if (displayName) patch.display_name = displayName;
    if (businessName) patch.business_name = businessName;
    if (phone) patch.phone = phone;
    await (supabase.from("sellers") as unknown as {
      update: (v: typeof patch) => { eq: (col: string, val: string) => Promise<unknown> };
    })
      .update(patch)
      .eq("id", user.id);
  }

  // Fetch the (possibly updated) seller row so we know the canonical phone.
  const { data: seller } = await supabase
    .from("sellers")
    .select("display_name, phone")
    .eq("id", user.id)
    .maybeSingle();
  const finalDisplayName = (seller as { display_name?: string | null } | null)?.display_name ?? null;
  const finalPhone = (seller as { phone?: string | null } | null)?.phone ?? null;

  const link = await generateLinkFor(email);
  if (!link.ok) return { ok: false, error: link.error };

  let smsSent: boolean | undefined;
  let smsError: string | undefined;
  if (sendSmsFlag) {
    if (!finalPhone) {
      smsError = "No phone number on file.";
    } else {
      try {
        await sendSms(finalPhone, smsBody(finalDisplayName, link.url));
        smsSent = true;
      } catch (e) {
        smsError = e instanceof Error ? e.message : "SMS send failed.";
      }
    }
  }

  revalidatePath("/admin/invite");
  return {
    ok: true,
    url: link.url,
    created,
    phone: finalPhone,
    smsSent,
    smsError,
  };
}

export type SendSmsResult =
  | { ok: true; sentTo: string }
  | { ok: false; error: string };

export async function sendInviteSms(sellerId: string): Promise<SendSmsResult> {
  const supabase = createAdminClient();
  const { data: seller, error } = await supabase
    .from("sellers")
    .select("email, phone, display_name")
    .eq("id", sellerId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!seller) return { ok: false, error: "Seller not found." };
  const s = seller as { email: string; phone: string | null; display_name: string | null };
  if (!s.phone) return { ok: false, error: "No phone number on file for this seller." };

  const link = await generateLinkFor(s.email);
  if (!link.ok) return { ok: false, error: link.error };

  try {
    await sendSms(s.phone, smsBody(s.display_name, link.url));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "SMS send failed." };
  }
  return { ok: true, sentTo: s.phone };
}
