"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteResult =
  | {
      ok: true;
      url: string;
      created: boolean;
      emailSent?: boolean;
      emailError?: string;
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

/**
 * Send Supabase's magic-link email to the seller via the standard OTP
 * channel. The seller's email template (Authentication → Email Templates
 * → Magic Link) controls the body. The link inside this email is *not*
 * the same as the one we generated via admin.generateLink for the
 * admin to copy — Supabase generates a fresh single-use token of its own.
 * Both work; whichever the seller clicks first signs them in.
 */
async function sendMagicLinkEmail(email: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars are missing.");
  const sellerUrl =
    process.env.SELLER_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const client = createSupabaseClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  // We always pre-create + confirm the user in the action that calls this,
  // so signup-allowance here is a no-op in practice. Leaving the flag at
  // default (allow) sidesteps Supabase's "Signups not allowed for otp" error
  // when the project's email provider has signups disabled.
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${sellerUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent("/home")}`,
    },
  });
  if (error) throw error;
}

export async function generateInviteLink(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();
  const sendEmailFlag = formData.get("send_email") === "on";

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
  if (displayName || businessName) {
    const patch: { display_name?: string; business_name?: string } = {};
    if (displayName) patch.display_name = displayName;
    if (businessName) patch.business_name = businessName;
    await (supabase.from("sellers") as unknown as {
      update: (v: typeof patch) => { eq: (col: string, val: string) => Promise<unknown> };
    })
      .update(patch)
      .eq("id", user.id);
  }

  const link = await generateLinkFor(email);
  if (!link.ok) return { ok: false, error: link.error };

  let emailSent: boolean | undefined;
  let emailError: string | undefined;
  if (sendEmailFlag) {
    try {
      await sendMagicLinkEmail(email);
      emailSent = true;
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Email send failed.";
    }
  }

  revalidatePath("/admin/invite");
  return {
    ok: true,
    url: link.url,
    created,
    emailSent,
    emailError,
  };
}

export type DeleteSellerResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteSeller(sellerId: string): Promise<DeleteSellerResult> {
  if (!sellerId || typeof sellerId !== "string") {
    return { ok: false, error: "Invalid seller id." };
  }
  const supabase = createAdminClient();
  // Auth admin delete cascades through sellers (FK on auth.users with
  // on delete cascade) and submissions (FK on sellers with on delete cascade).
  const { error } = await supabase.auth.admin.deleteUser(sellerId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/invite");
  return { ok: true };
}

