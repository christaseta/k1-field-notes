import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/home";

  const supabase = await createClient();

  let lastError: string | null = null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    lastError = error.message;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    lastError = error.message;
  } else {
    lastError = "missing code / token_hash";
  }

  console.error("[auth/callback]", { lastError, hasCode: !!code, hasTokenHash: !!tokenHash, type });
  const errUrl = new URL("/auth/error", url.origin);
  if (lastError) errUrl.searchParams.set("reason", lastError);
  return NextResponse.redirect(errUrl);
}
