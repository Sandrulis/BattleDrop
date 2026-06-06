import type { Metadata } from "next";
import { AdminUsersList } from "@/app/components/admin-users-list";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import { getAllUsersForAdmin } from "@/app/lib/users/get-all-users-for-admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export const metadata: Metadata = {
  title: "Users — Admin Panel",
};

export default async function AdminUsersPage() {
  const [users, settings, currentUser] = await Promise.all([
    getAllUsersForAdmin(),
    getSiteSettings(),
    getCurrentAppUser(),
  ]);

  return (
    <AdminPanelSection
      title="Users"
      description="Manage founder accounts, admin roles, and sign-in activity."
    >
      <AdminUsersList
        users={users}
        currentUserId={currentUser?.id ?? ""}
        siteDateSettings={{
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          dateSeparator: settings.dateSeparator,
        }}
      />
    </AdminPanelSection>
  );
}
