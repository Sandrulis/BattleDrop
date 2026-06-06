import type { Metadata } from "next";
import { AdminSettingsForm } from "@/app/components/admin-settings-form";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";

export const metadata: Metadata = {
  title: "Settings — Admin Panel",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminPanelSection
      title="Settings"
      description="Configure site name, slogan, and display defaults for dates and times."
    >
      <AdminSettingsForm initialSettings={settings} />
    </AdminPanelSection>
  );
}
