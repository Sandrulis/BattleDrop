import type { Metadata } from "next";
import { AdminLegalPageForm } from "@/app/components/admin-legal-page-form";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getSiteLegalPages } from "@/app/lib/site-legal-pages/get-site-legal-pages";

export const metadata: Metadata = {
  title: "Rules — Admin Panel",
};

export default async function AdminRulesPage() {
  const pages = await getSiteLegalPages();

  return (
    <AdminPanelSection
      title="Rules"
      description="Edit the site rules shown to visitors at /rules."
    >
      <AdminLegalPageForm page="rules" initialContent={pages.rulesContent} />
    </AdminPanelSection>
  );
}
