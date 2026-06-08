import { isIntegrationEnabled } from "@/app/lib/integrations/is-integration-enabled";
import { POLL_INTEGRATION_KEY } from "@/app/lib/polls/poll-types";

export async function isPollEnabled(): Promise<boolean> {
  return isIntegrationEnabled(POLL_INTEGRATION_KEY);
}
