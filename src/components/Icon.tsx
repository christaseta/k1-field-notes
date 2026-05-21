/**
 * Inline-styled SVG wrapper. Uses the icons we pulled from Figma in
 * /public/icons/ui (already converted to currentColor so they pick up text color).
 */

export type IconName =
  | "mic"
  | "gear"
  | "paper-pencil"
  | "arrow-clock"
  | "arrow-left"
  | "arrow-up"
  | "send"
  | "check-fill";

const SIZE_DEFAULT = 24;

export function Icon({
  name,
  size = SIZE_DEFAULT,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        // Use a CSS mask so the SVG inherits currentColor cleanly.
        maskImage: `url(/icons/ui/${name}.svg)`,
        WebkitMaskImage: `url(/icons/ui/${name}.svg)`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        backgroundColor: "currentColor",
      }}
      aria-hidden
    />
  );
}
