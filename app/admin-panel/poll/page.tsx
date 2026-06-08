import type { Metadata } from "next";
import { AdminPollPanel } from "@/app/components/admin-poll-panel";
import { getSitePolls } from "@/app/lib/polls/get-polls";
import { isPollEnabled } from "@/app/lib/polls/is-poll-enabled";

export const metadata: Metadata = {
  title: "Poll — Admin Panel",
};

export default async function AdminPollPage() {
  const [polls, pollIntegrationEnabled] = await Promise.all([
    getSitePolls(),
    isPollEnabled(),
  ]);

  return (
    <AdminPollPanel
      initialPolls={polls}
      pollIntegrationEnabled={pollIntegrationEnabled}
    />
  );
}
