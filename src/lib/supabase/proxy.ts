import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appSurface } from "@/lib/app-surface";

const PUBLIC_PATHS = ["/signin", "/auth/callback", "/auth/error"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const surface = appSurface();

  // Option A deployments: each surface only exposes its own routes.
  if (surface === "seller" && pathname.startsWith("/admin")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (
    surface === "admin" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/signin") &&
    !pathname.startsWith("/auth") &&
    pathname !== "/"
  ) {
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
