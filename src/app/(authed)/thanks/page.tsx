import Link from "next/link";
import { TitleBar } from "@/components/TitleBar";
import { Icon } from "@/components/Icon";

export default async function ThanksPage(props: {
  searchParams: Promise<{ already?: string }>;
}) {
  const { already } = await props.searchParams;

  const message = already
    ? `You already submitted ${already === "daily" ? "today's daily" : "this week's"} check-in. Thanks!`
    : "Thanks! Your note is in.";

  return (
    <>
      <TitleBar backHref="/home" />
      <div className="max-w-md w-full mx-auto px-4 text-center flex flex-col items-center justify-center min-h-[calc(100dvh-180px)] space-y-5">
        <Icon name="check-fill" size={48} className="text-white" />
        <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] font-medium text-[var(--text-strong)]">
          {message}
        </h1>
        <p className="text-[14px] text-[var(--text-subtle)]">
          The K1 team will see this in real time.
        </p>
        <div className="pt-4">
          <Link
            href="/home"
            className="inline-flex items-center justify-center bg-white text-black px-6 min-h-[64px] rounded-full text-[16px] font-medium hover:bg-slate-100"
          >
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
