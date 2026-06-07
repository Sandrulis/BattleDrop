import { createAdminClient } from "@/app/lib/supabase/admin";
import { formatDisplayPoints } from "@/app/lib/site-settings/format-display-money";
import { BUY_POINTS_PATH } from "@/app/lib/users/buy-points-path";

export { BUY_POINTS_PATH, buildBuyPointsPath, INSUFFICIENT_POINTS_STATUS } from "@/app/lib/users/buy-points-path";

export type DeductUserPointsResult =
  | { ok: true; balance: number }
  | { ok: false; reason: "insufficient" | "not_found" };

export type CreditUserPointsResult =
  | { ok: true; balance: number }
  | { ok: false; reason: "not_found" };

export function insufficientPointsMessage(required: number): string {
  return `Not enough points. You need ${formatDisplayPoints(required)}.`;
}

export function insufficientPointsPayload(required: number) {
  return {
    error: insufficientPointsMessage(required),
    redirectTo: BUY_POINTS_PATH,
  };
}

export async function getUserPointsBalance(userId: string): Promise<number | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("points")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return data.points;
}

export async function userHasEnoughPoints(
  userId: string,
  amount: number,
): Promise<boolean> {
  if (amount <= 0) return true;

  const balance = await getUserPointsBalance(userId);
  return balance !== null && balance >= amount;
}

export async function deductUserPoints(
  userId: string,
  amount: number,
): Promise<DeductUserPointsResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("deduct_user_points", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    return { ok: false, reason: "not_found" };
  }

  if (data === null) {
    return { ok: false, reason: "insufficient" };
  }

  return { ok: true, balance: data };
}

export async function creditUserPoints(
  userId: string,
  amount: number,
): Promise<CreditUserPointsResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("credit_user_points", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error || data === null) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, balance: data };
}
