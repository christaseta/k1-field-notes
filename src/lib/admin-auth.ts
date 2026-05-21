import type { User } from "@supabase/supabase-js";

const DEFAULT_DOMAINS = ["squareup.com", "block.xyz"];

function allowedDomains(): string[] {
  const raw = process.env.ADMIN_EMAIL_DOMAINS;
  if (!raw) return DEFAULT_DOMAINS;
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains().includes(domain);
}

export function isAdmin(user: Pick<User, "email"> | null | undefined): boolean {
  return isAdminEmail(user?.email);
}
