import Link from "next/link";

export default async function ThanksPage(props: {
  searchParams: Promise<{ already?: string }>;
}) {
  const { already } = await props.searchParams;

  const message = already
    ? `You already submitted ${already === "daily" ? "today's daily" : "this week's"} check-in. Thanks!`
    : "Thanks — your note is in.";

  return (
    <div className="text-center pt-20 space-y-5 px-4">
      <div
        className="mx-auto w-16 h-16 rounded-full bg-[var(--pill-complete-bg)] text-[var(--pill-complete-fg)] flex items-center justify-center text-3xl"
        aria-hidden
      >
        ✓
      </div>
      <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] font-medium text-[var(--text-strong)]">
        {message}
      </h1>
      <p className="text-[14px] text-[var(--text-subtle)]">
        The K1 team will see this in real time.
      </p>
      <div className="pt-4">
        <Link
          href="/home"
          className="inline-block bg-[var(--accent)] text-[var(--text-on-accent)] px-6 py-3 rounded-2xl font-medium hover:bg-[var(--accent-strong)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
