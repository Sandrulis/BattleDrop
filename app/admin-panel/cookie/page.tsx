import type { Metadata } from "next";
import { AdminLegalPageForm } from "@/app/components/admin-legal-page-form";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getSiteLegalPages } from "@/app/lib/site-legal-pages/get-site-legal-pages";

export const metadata: Metadata = {
  title: "Cookie — Admin Panel",
};

export default async function AdminCookiePage() {
  const pages = await getSiteLegalPages();

  return (
    <AdminPanelSection
      title="Cookie"
      description="Edit cookie rules for /cookie, the footer links, and the first-visit cookie popup."
    >
      <AdminLegalPageForm page="cookie" initialContent={pages.cookieContent} />
    </AdminPanelSection>
  );
}
