import { BbcodeContent } from "@/app/components/bbcode-content";

type LegalPageViewProps = {
  title: string;
  content: string;
};

export function LegalPageView({ title, content }: LegalPageViewProps) {
  return (
    <article>
      <header className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
      </header>

      <div className="mt-8">
        <BbcodeContent source={content} />
      </div>
    </article>
  );
}
