import { parseBbcodeToHtml } from "@/app/lib/blog/parse-bbcode";

type BbcodeContentProps = {
  source: string;
  className?: string;
};

export function BbcodeContent({ source, className }: BbcodeContentProps) {
  const html = parseBbcodeToHtml(source);

  if (!html) return null;

  return (
    <div
      className={`prose-zinc max-w-none text-sm leading-relaxed text-zinc-700 sm:text-base ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
