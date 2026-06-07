import { AdminBattlesSubnav } from "@/app/components/admin-battles-subnav";

export default function AdminBattlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Battles
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Review winners, rankings, and Hall of Fame entries across weekly,
          monthly, and annual battles.
        </p>
      </div>

      <AdminBattlesSubnav />

      <div className="mt-8">{children}</div>
    </div>
  );
}
