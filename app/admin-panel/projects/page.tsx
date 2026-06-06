import type { Metadata } from "next";
import { AdminProjectsList } from "@/app/components/admin-projects-list";
import { AdminPanelSection } from "@/app/components/admin-panel-section";
import { getAllProjectsForAdmin } from "@/app/lib/projects/get-all-projects-for-admin";

export const metadata: Metadata = {
  title: "Projects — Admin Panel",
};

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <AdminPanelSection
      title="Projects"
      description="Moderate submitted products, drafts, published entries, and soft-deleted links."
    >
      <AdminProjectsList projects={projects} />
    </AdminPanelSection>
  );
}
