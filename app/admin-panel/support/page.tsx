import type { Metadata } from "next";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { AdminSupportList } from "@/app/components/admin-support-list";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getSupportTicketsForAdmin } from "@/app/lib/support-tickets/get-support-tickets-for-admin";

export const metadata: Metadata = {
  title: "Support — Admin Panel",
};

export default async function AdminSupportPage() {
  const [tickets, settings] = await Promise.all([
    getSupportTicketsForAdmin(),
    getSiteSettings(),
  ]);

  return (
    <AdminPanelSection
      title="Support"
      description="Review open support tickets and update their status."
    >
      <AdminSupportList
        initialTickets={tickets}
        dateSettings={{
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          dateSeparator: settings.dateSeparator,
        }}
      />
    </AdminPanelSection>
  );
}
