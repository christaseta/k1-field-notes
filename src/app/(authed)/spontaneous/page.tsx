import { SpontaneousForm } from "./SpontaneousForm";
import { TitleBar } from "@/components/TitleBar";

export default function SpontaneousPage() {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <TitleBar backHref="/home" />
      <main className="flex-1 min-h-0 max-w-md w-full mx-auto px-4 flex flex-col">
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <h1 className="text-center text-[32px] leading-[36px] -tracking-[0.5px] text-[var(--text-strong)] font-normal px-2">
            See something at the kiosk? Just talk.
          </h1>
        </div>
        <SpontaneousForm />
      </main>
    </div>
  );
}
