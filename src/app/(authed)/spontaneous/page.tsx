import { SpontaneousForm } from "./SpontaneousForm";
import { TitleBar } from "@/components/TitleBar";

export default function SpontaneousPage() {
  return (
    <>
      <TitleBar backHref="/home" />
      <div className="max-w-md w-full mx-auto px-4 pt-6 space-y-6">
        <div>
          <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] text-[var(--text-strong)] font-medium">
            Review your note
          </h1>
          <p className="text-[14px] text-[var(--text-subtle)] mt-2">
            Edit the transcript, add tags, then send when it&apos;s ready.
          </p>
        </div>
        <SpontaneousForm />
      </div>
    </>
  );
}
