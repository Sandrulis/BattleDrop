export const PROMOTED_SLOT_DEFINITIONS = [
  { spot: 1, price: 3, insertAfterOrganic: 0 },
  { spot: 2, price: 2, insertAfterOrganic: 5 },
  { spot: 3, price: 1, insertAfterOrganic: 10 },
] as const;

export type PromotedSlotDefinition = (typeof PROMOTED_SLOT_DEFINITIONS)[number];

export function getPromotedSlotDefinition(spot: number) {
  return PROMOTED_SLOT_DEFINITIONS.find((definition) => definition.spot === spot);
}
