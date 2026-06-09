import type { Metadata } from "next";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { AdminSuggestionsList } from "@/app/components/admin-suggestions-list";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getUserSuggestionsForAdmin } from "@/app/lib/user-suggestions/get-user-suggestions-for-admin";

export const metadata: Metadata = {
  title: "Suggestions — Admin Panel",
};

export default async function AdminSuggestionsPage() {
  const [suggestions, settings] = await Promise.all([
    getUserSuggestionsForAdmin(),
    getSiteSettings(),
  ]);

  return (
    <AdminPanelSection
      title="Suggestions"
      description="Review user feature ideas and mark them as reviewed, accepted, or declined."
    >
      <AdminSuggestionsList
        initialSuggestions={suggestions}
        dateSettings={{
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          dateSeparator: settings.dateSeparator,
        }}
      />
    </AdminPanelSection>
  );
}
