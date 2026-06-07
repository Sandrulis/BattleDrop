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
      description="Configure site identity, date and time display defaults, and battle defaults for new weekly battles."
    >
      <AdminSettingsForm initialSettings={settings} />
    </AdminPanelSection>
  );
}
