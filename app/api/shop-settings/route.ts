import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getShopSettings } from "@/app/lib/shop/get-shop-settings";
import {
  normalizeShopSettings,
  updateShopSettings,
} from "@/app/lib/shop/update-shop-settings";
import type { ShopSettings } from "@/app/lib/shop/shop-types";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function GET() {
  const settings = await getShopSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: Partial<ShopSettings>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const settings = normalizeShopSettings(body);
    const updated = await updateShopSettings(settings);
    revalidateTag("shop-settings", "max");
    revalidateTag("site-settings", "max");
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save shop settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
