import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appSurface } from "@/lib/app-surface";

const PUBLIC_PATHS = ["/signin", "/auth/callback", "/auth/error", "/api/debug-slack", "/api/test-slack-submission"];

function checkBasicAuth(
  header: string | null,
  user: string,
  pass: string,
): boolean {
  if (!header || !header.toLowerCase().startsWith("basic ")) return false;
  try {
    const decoded = atob(header.slice(6).trim());
    const idx = decoded.indexOf(":");
    if (idx < 0) return false;
    return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
  } catch {
    return false;
  }
}

const ADMIN_REALM = 'Basic realm="K1 Field Notes Admin"';

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const surface = appSurface();

  // Admin surface: gate everything behind HTTP Basic Auth (shared password).
  // Replaces per-user Supabase auth on this deployment.
  if (surface === "admin") {
    const adminUser = process.env.ADMIN_BASIC_USER;
    const adminPass = process.env.ADMIN_BASIC_PASS;
    if (!adminUser || !adminPass) {
      return new NextResponse(
        "Admin basic-auth not configured (ADMIN_BASIC_USER / ADMIN_BASIC_PASS).",
        { status: 500 },
      );
    }
    if (!checkBasicAuth(request.headers.get("authorization"), adminUser, adminPass)) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": ADMIN_REALM },
      });
    }
    // Only allow admin/auth/signin/api/root paths; everything else 404s.
    if (
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/signin") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/api") &&
      pathname !== "/"
    ) {
      return new NextResponse("Not Found", { status: 404 });
    }
    // Skip the Supabase session work — basic auth is the entire admin gate.
    return NextResponse.next({ request });
  }

  // Seller surface: hide /admin entirely.
  if (pathname.startsWith("/admin")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let response = NextResponse.next({ request });

  // Demo-mode bypass: set via ?demo=true, persisted as a cookie. Skips
  // the Supabase auth gate so reviewers can browse without sign-in.
  const demoParam = request.nextUrl.searchParams.get("demo");
  if (demoParam === "true") {
    response.cookies.set("demo", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }
  if (request.cookies.get("demo")?.value === "true") {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
