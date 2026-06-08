import type { ProductLaunchStat } from "@/app/lib/projects/get-product-page-data";
import type { Product } from "../lib/types";

type ProductDetailSidebarProps = {
  product: Product;
  voteCount: number;
  launchStat: ProductLaunchStat;
  siteName: string;
};

export function ProductDetailSidebar({
  product,
  voteCount,
  launchStat,
  siteName,
}: ProductDetailSidebarProps) {
  const firstStat =
    launchStat.kind === "battle"
      ? {
          label: "Battle",
          value: `Week ${launchStat.week}, ${launchStat.year}`,
        }
      : { label: "Created", value: launchStat.label };

  const makerNote =
    launchStat.kind === "battle"
      ? `Submitted for Week ${launchStat.week} battle. One project per founder per week.`
      : "Not entered in a battle yet. Publish to join the next available week.";

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-[4.5rem] lg:self-start">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Launch stats</h3>
        <dl className="mt-3 space-y-2.5 text-xs">
          <StatRow label={firstStat.label} value={firstStat.value} />
          <StatRow label="Votes" value={String(voteCount)} />
          <StatRow label="Comments" value={String(product.comments)} />
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Maker</h3>
        <p className="mt-2 text-sm font-medium text-zinc-800">{product.maker}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{makerNote}</p>
        <a
          href={`https://${product.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#da552f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c44a28]"
        >
          Visit website ↗
        </a>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Share</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Spread the word about this launch on {siteName}.
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Copy link
        </button>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-semibold text-zinc-800">{value}</dd>
    </div>
  );
}
