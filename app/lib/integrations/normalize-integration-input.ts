import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";

const INTEGRATION_KEY_PATTERN = /^[a-z][a-z0-9_-]{1,63}$/;

export function normalizeIntegrationKey(value: string): string {
  const key = value.trim().toLowerCase();

  if (!key) {
    throw new Error("Integration key is required.");
  }

  assertMaxLength(key, INPUT_LIMITS.integrationKey, "Integration key");

  if (!INTEGRATION_KEY_PATTERN.test(key)) {
    throw new Error(
      "Integration key must start with a letter and use only lowercase letters, numbers, underscores, or hyphens.",
    );
  }

  return key;
}

export function normalizeIntegrationName(value: string): string {
  const name = value.trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  assertMaxLength(name, INPUT_LIMITS.integrationName, "Name");
  return name;
}

export function normalizeIntegrationDescription(value: string | undefined): string {
  const description = (value ?? "").trim();
  assertMaxLength(description, INPUT_LIMITS.integrationDescription, "Description");
  return description;
}

export function normalizeIntegrationApiKey(
  value: string | undefined | null,
): string | null {
  if (value === null) {
    return null;
  }

  const apiKey = (value ?? "").trim();

  if (!apiKey) {
    return null;
  }

  assertMaxLength(apiKey, INPUT_LIMITS.integrationApiKey, "API key");
  return apiKey;
}
