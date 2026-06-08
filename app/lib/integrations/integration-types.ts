export type SiteIntegrationRow = {
  id: string;
  name: string;
  integration_key: string;
  api_key: string | null;
  description: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteIntegration = {
  id: string;
  name: string;
  integrationKey: string;
  description: string;
  enabled: boolean;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSiteIntegrationInput = {
  name: string;
  integrationKey: string;
  apiKey?: string;
  description?: string;
};

export type UpdateSiteIntegrationInput = {
  name?: string;
  integrationKey?: string;
  apiKey?: string | null;
  description?: string;
  enabled?: boolean;
};
