import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          That sign-in link didn&apos;t work
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          The link may have expired or already been used. Request a new one to try again.
        </p>
        <Link
          href="/signin"
          className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800"
        >
          Get a new link
        </Link>
      </div>
    </main>
  );
}
