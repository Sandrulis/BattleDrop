import type { CreateSitePollInput, SitePoll } from "@/app/lib/polls/poll-types";
import { buildPollWithOptions } from "@/app/lib/polls/build-poll-with-options";
import {
  normalizePollOptions,
  normalizePollQuestion,
} from "@/app/lib/polls/normalize-poll-input";
import { logAdminAction } from "@/app/lib/security/log-admin-action";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function createSitePoll(
  input: CreateSitePollInput,
): Promise<SitePoll> {
  const currentUser = await getCurrentAppUser();
  if (!currentUser?.is_admin) {
    throw new Error("Admin access required.");
  }

  const question = normalizePollQuestion(input.question);
  const optionLabels = normalizePollOptions(input.options);

  const admin = createAdminClient();
  const { data: poll, error } = await admin
    .from("site_polls")
    .insert({ question, enabled: false })
    .select("id, question, enabled, created_at, updated_at")
    .single();

  if (error || !poll) {
    throw new Error(error?.message ?? "Could not create poll.");
  }

  const optionRows = optionLabels.map((label, index) => ({
    poll_id: poll.id,
    label,
    sort_order: index,
  }));

  const { data: options, error: optionsError } = await admin
    .from("site_poll_options")
    .insert(optionRows)
    .select("id, poll_id, label, sort_order");

  if (optionsError || !options) {
    await admin.from("site_polls").delete().eq("id", poll.id);
    throw new Error(optionsError?.message ?? "Could not create poll options.");
  }

  await logAdminAction({
    actorId: currentUser.id,
    action: "site_poll.create",
    entityType: "site_poll",
    entityId: poll.id,
    metadata: { question: poll.question, optionCount: options.length },
  });

  return buildPollWithOptions(poll, options, []);
}
