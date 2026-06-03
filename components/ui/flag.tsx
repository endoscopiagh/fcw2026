import Image from "next/image";

type FlagProps = {
  emoji: string | null | undefined;
  teamName: string;
  size?: number;
  className?: string;
};

function toCodePoint(input: string): string {
  return Array.from(input)
    .map((symbol) => symbol.codePointAt(0)?.toString(16))
    .filter((value): value is string => Boolean(value))
    .join("-");
}

export function Flag({ emoji, teamName, size = 20, className = "" }: FlagProps) {
  if (!emoji) {
    return <span className={className}>🏳️</span>;
  }

  const codepoint = toCodePoint(emoji);
  const src = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`;

  return (
    <Image
      src={src}
      alt={`Bandera de ${teamName}`}
      width={size}
      height={size}
      className={`inline-block rounded-sm align-middle ${className}`.trim()}
      unoptimized
      referrerPolicy="no-referrer"
    />
  );
}
