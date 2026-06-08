import type {
  SiteIntegration,
  SiteIntegrationRow,
} from "@/app/lib/integrations/integration-types";

export function mapSiteIntegrationRow(row: SiteIntegrationRow): SiteIntegration {
  return {
    id: row.id,
    name: row.name,
    integrationKey: row.integration_key,
    description: row.description,
    enabled: row.enabled,
    hasApiKey: Boolean(row.api_key?.trim()),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
