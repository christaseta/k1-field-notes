/**
 * App-surface flag for Option A deployments (one repo, two Vercel projects).
 *
 * Set `APP_SURFACE=admin` in the admin project's env to expose only `/admin/*`,
 * `/signin`, and the `/auth/*` callback. Anything else 404s.
 *
 * Default ("seller") behaves like the all-in-one app the seller-facing routes
 * expect, but blocks `/admin/*` so the URL doesn't exist for sellers.
 */
export type AppSurface = "seller" | "admin";

export function appSurface(): AppSurface {
  const raw = process.env.APP_SURFACE?.toLowerCase().trim();
  return raw === "admin" ? "admin" : "seller";
}
