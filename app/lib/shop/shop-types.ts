export const SHOP_INTEGRATION_KEY = "integration_shop";

export type ShopSettings = {
  upvotesPerPoint: number;
  affiliatesPerPoint: number;
};

export type ShopSettingsRow = {
  shop_upvotes_per_point: number;
  shop_affiliates_per_point: number;
};

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  upvotesPerPoint: 5,
  affiliatesPerPoint: 1,
};

export type ShopDashboard = {
  pointsBalance: number;
  totalUpvotes: number;
  availableUpvotes: number;
  upvotesPerPoint: number;
  joinedAffiliates: number;
  availableAffiliates: number;
  affiliatesPerPoint: number;
  affiliatesEnabled: boolean;
};

export type ShopRedeemResult = {
  pointsBalance: number;
  availableUpvotes?: number;
  availableAffiliates?: number;
};
