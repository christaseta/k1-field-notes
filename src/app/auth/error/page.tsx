import Link from "next/link";

type Reason = "expired" | "used" | "invalid";

const COPY: Record<Reason, { title: string; body: string }> = {
  expired: {
    title: "This sign-in link has expired",
    body: "Sign-in links are time-limited. Request a new one and try again — it should arrive in seconds.",
  },
  used: {
    title: "This sign-in link was already used",
    body: "Each sign-in link only works once. Request a new one to sign in again.",
  },
  invalid: {
    title: "That sign-in link didn't work",
    body: "The link may have expired or already been used. Request a new one to try again.",
  },
};

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await props.searchParams;
  const key: Reason =
    reason === "expired" || reason === "used" ? reason : "invalid";
  const { title, body } = COPY[key];

  return (
    <main className="min-h-[100dvh] bg-[var(--bg-app)] text-[var(--text-standard)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-3xl p-6 text-center space-y-4">
        <h1 className="text-[24px] leading-[28px] -tracking-[0.3px] text-[var(--text-strong)] font-normal">
          {title}
        </h1>
        <p className="text-[14px] text-[var(--text-subtle)]">{body}</p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center w-full bg-white text-black min-h-[64px] px-6 rounded-full text-[16px] font-medium hover:bg-slate-100"
        >
          Get a new link
        </Link>
      </div>
    </main>
  );
}
