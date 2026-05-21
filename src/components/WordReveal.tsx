/**
 * Splits text into words and fades them in one at a time. Pure CSS via
 * staggered animation-delay so it works as a server component.
 */
export function WordReveal({
  text,
  className,
  stepMs = 120,
  durationMs = 500,
}: {
  text: string;
  className?: string;
  /** Delay between consecutive words. */
  stepMs?: number;
  /** Duration of each word's fade/translate. */
  durationMs?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block opacity-0 animate-word-reveal"
          style={{
            animationDelay: `${i * stepMs}ms`,
            animationDuration: `${durationMs}ms`,
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
