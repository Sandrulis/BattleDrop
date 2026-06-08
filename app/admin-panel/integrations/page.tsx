import type { Metadata } from "next";
import { AdminIntegrationsPanel } from "@/app/components/admin-integrations-panel";
import { getSiteIntegrations } from "@/app/lib/integrations/get-integrations";

export const metadata: Metadata = {
  title: "Integrations — Admin Panel",
};

export default async function AdminIntegrationsPage() {
  const integrations = await getSiteIntegrations();

  return <AdminIntegrationsPanel initialIntegrations={integrations} />;
}
