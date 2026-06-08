import {
  INPUT_LIMITS,
  assertMaxLength,
  trimToMaxLength,
} from "@/app/lib/security/input-limits";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export function normalizePollQuestion(value: string) {
  const question = trimToMaxLength(value, INPUT_LIMITS.pollQuestion);
  assertMaxLength(question, INPUT_LIMITS.pollQuestion, "Question");

  if (!question) {
    throw new Error("Question is required.");
  }

  return question;
}

export function normalizePollOptions(values: string[]) {
  if (!Array.isArray(values)) {
    throw new Error("Answer options are required.");
  }

  const trimmed = values
    .map((value) => trimToMaxLength(String(value ?? ""), INPUT_LIMITS.pollOption))
    .filter((value) => value.length > 0);

  if (trimmed.length < MIN_OPTIONS) {
    throw new Error(`At least ${MIN_OPTIONS} answer options are required.`);
  }

  if (trimmed.length > MAX_OPTIONS) {
    throw new Error(`At most ${MAX_OPTIONS} answer options are allowed.`);
  }

  const seen = new Set<string>();
  for (const label of trimmed) {
    assertMaxLength(label, INPUT_LIMITS.pollOption, "Answer option");
    const key = label.toLowerCase();
    if (seen.has(key)) {
      throw new Error("Answer options must be unique.");
    }
    seen.add(key);
  }

  return trimmed;
}
