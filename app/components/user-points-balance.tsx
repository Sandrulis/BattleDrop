import { PointsBalanceLink } from "@/app/components/points-balance-link";

type UserPointsBalanceProps = {
  points: number;
};

export function UserPointsBalance({ points }: UserPointsBalanceProps) {
  return <PointsBalanceLink points={points} />;
}
