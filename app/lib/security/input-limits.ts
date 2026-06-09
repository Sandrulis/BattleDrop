export const INPUT_LIMITS = {
  projectName: 120,
  projectTagline: 200,
  projectDescription: 5000,
  projectComment: 2000,
  todoTitle: 200,
  todoDescription: 5000,
  integrationName: 120,
  integrationKey: 64,
  integrationApiKey: 500,
  integrationDescription: 2000,
  pollQuestion: 500,
  pollOption: 200,
  supportSubject: 200,
  supportMessage: 5000,
  suggestionTitle: 200,
  suggestionDescription: 5000,
  blogTitle: 200,
  blogDescription: 500,
  blogContent: 50000,
  siteLegalContent: 50000,
} as const;

export function assertMaxLength(
  value: string,
  maxLength: number,
  fieldLabel: string,
) {
  if (value.length > maxLength) {
    throw new Error(`${fieldLabel} must be at most ${maxLength} characters.`);
  }
}

export function trimToMaxLength(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}
