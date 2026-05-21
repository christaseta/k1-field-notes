import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "./SignInForm";

export default async function SignInPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next ?? "/home");

  return (
    <main
      className="min-h-[100dvh] bg-[var(--bg-app)] text-[var(--text-standard)] flex flex-col px-8 pt-[148px] pb-8"
      style={{
        backgroundImage: "url(/dot-bg.png)",
        backgroundSize: "100% auto",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 gap-10">
        <div className="flex flex-col gap-6">
          <Image
            src="/icons/ui/square-logomark.svg"
            alt="Square"
            width={32}
            height={32}
            priority
          />
          <h1 className="text-[46px] leading-[40px] -tracking-[1.4px] text-[var(--text-standard)] font-normal">
            Field Notes
          </h1>
        </div>

        <SignInForm next={next ?? "/home"} />
      </div>
    </main>
  );
}
