import type { Metadata } from "next";
import { AdminLegalPageForm } from "@/app/components/admin-legal-page-form";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getSiteLegalPages } from "@/app/lib/site-legal-pages/get-site-legal-pages";

export const metadata: Metadata = {
  title: "Privacy — Admin Panel",
};

export default async function AdminPrivacyPage() {
  const pages = await getSiteLegalPages();

  return (
    <AdminPanelSection
      title="Privacy"
      description="Edit the privacy policy shown to visitors at /privacy."
    >
      <AdminLegalPageForm page="privacy" initialContent={pages.privacyContent} />
    </AdminPanelSection>
  );
}
