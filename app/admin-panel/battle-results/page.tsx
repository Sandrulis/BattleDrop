import type { Metadata } from "next";
import { AdminPanelSection } from "@/app/components/admin-panel-section";

export const metadata: Metadata = {
  title: "Battle Results — Admin Panel",
};

export default function AdminBattleResultsPage() {
  return (
    <AdminPanelSection
      title="Battle Results"
      description="Review winners, rankings, and Hall of Fame entries across weekly, monthly, and annual battles."
    >
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Results table</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Weekly winners, monthly champions, and archived battle outcomes will
          appear here for review and export.
        </p>
      </div>
    </AdminPanelSection>
  );
}
