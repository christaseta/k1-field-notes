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
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Field Notes</h1>
          <p className="text-slate-600 mt-2">
            Quick feedback from sellers, in the moment.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Sign in</h2>
          <SignInForm next={next ?? "/home"} />
          <p className="text-xs text-slate-500 mt-4 text-center">
            We&apos;ll email you a sign-in link — no password needed.
          </p>
        </div>
      </div>
    </main>
  );
}
