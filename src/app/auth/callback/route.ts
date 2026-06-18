import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Categorize a Supabase auth error so the /auth/error page can show
 * tailored copy. */
function reasonFromError(err: { message?: string; code?: string } | null): string {
  if (!err) return "invalid";
  const code = (err.code ?? "").toLowerCase();
  const msg = (err.message ?? "").toLowerCase();
  if (code.includes("expired") || msg.includes("expired")) return "expired";
  if (
    code.includes("used") ||
    msg.includes("already") ||
    msg.includes("consumed")
  ) {
    return "used";
  }
  return "invalid";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/home";

  const supabase = await createClient();
  let failure: { message?: string; code?: string } | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    failure = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    failure = error;
  }

  const errorUrl = new URL("/auth/error", url.origin);
  errorUrl.searchParams.set("reason", reasonFromError(failure));
  return NextResponse.redirect(errorUrl);
}
