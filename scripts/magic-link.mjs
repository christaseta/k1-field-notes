// Generate a magic-link URL via Supabase admin API (bypasses email).
// Usage:
//   node scripts/magic-link.mjs <email> <site-url> [next-path]
// Example:
//   node scripts/magic-link.mjs cseta+test@squareup.com https://k1-field-notes-nine.vercel.app /home
//
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const [, , email, siteUrl, nextPath = "/home"] = process.argv;
if (!email || !siteUrl) {
  console.error("Usage: node scripts/magic-link.mjs <email> <site-url> [next-path]");
  console.error("Example: node scripts/magic-link.mjs cseta+test@squareup.com https://k1-field-notes-nine.vercel.app /home");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(nextPath)}`;

// Ensure the user exists and is email-confirmed (we bypass the verification
// email entirely). Create if missing; otherwise force-confirm if needed.
const { data: list } = await supabase.auth.admin.listUsers();
let user = list?.users.find((u) => u.email === email);
if (!user) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (createErr) {
    console.error("Failed to create user:", createErr.message);
    process.exit(1);
  }
  user = created.user;
} else if (!user.email_confirmed_at) {
  const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (updErr) {
    console.error("Failed to confirm user:", updErr.message);
    process.exit(1);
  }
}

const { data, error } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email,
  options: { redirectTo },
});

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

const tokenHash = data?.properties?.hashed_token;
const linkType = data?.properties?.verification_type ?? "magiclink";
if (!tokenHash) {
  console.error("Unexpected: no hashed_token in response.");
  process.exit(1);
}

// Skip Supabase's legacy /verify hop (puts session in URL hash, which our
// server-side /auth/callback can't read). Send directly to our callback with
// token_hash + type so it can exchange for a session via verifyOtp.
const link = new URL(`${siteUrl.replace(/\/$/, "")}/auth/callback`);
link.searchParams.set("token_hash", tokenHash);
link.searchParams.set("type", linkType);
link.searchParams.set("next", nextPath);

console.log("\nMagic link (click to sign in):");
console.log(link.toString());
console.log("\nThis link is single-use and expires in ~60 minutes.\n");
