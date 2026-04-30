import Link from "next/link";
import { SpontaneousForm } from "./SpontaneousForm";

export default function SpontaneousPage() {
  return (
    <div className="pt-4 space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center text-[14px] text-[var(--text-subtle)] hover:text-[var(--text-standard)]"
      >
        ← Home
      </Link>
      <div>
        <p className="text-[12px] tracking-wider uppercase text-[var(--accent)] font-medium">
          Spontaneous
        </p>
        <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] text-[var(--text-strong)] font-medium mt-1">
          Got a kiosk observation?
        </h1>
        <p className="text-[14px] text-[var(--text-subtle)] mt-2">
          Just hit record and tell us — no need to organize your thoughts.
        </p>
      </div>
      <SpontaneousForm />
    </div>
  );
}
