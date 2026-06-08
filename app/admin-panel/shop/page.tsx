import type { Metadata } from "next";
import { AdminShopPanel } from "@/app/components/admin-shop-panel";
import { getShopSettings } from "@/app/lib/shop/get-shop-settings";
import { isShopEnabled } from "@/app/lib/shop/is-shop-enabled";

export const metadata: Metadata = {
  title: "Shop — Admin Panel",
};

export default async function AdminShopPage() {
  const [settings, shopIntegrationEnabled] = await Promise.all([
    getShopSettings(),
    isShopEnabled(),
  ]);

  return (
    <AdminShopPanel
      initialSettings={settings}
      shopIntegrationEnabled={shopIntegrationEnabled}
    />
  );
}
