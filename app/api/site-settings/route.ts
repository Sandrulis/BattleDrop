import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSiteSettings } from "@/app/lib/site-settings/get-site-settings";
import {
  normalizeSiteSettings,
  updateSiteSettings,
} from "@/app/lib/site-settings/update-site-settings";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import type { SiteSettings } from "@/app/lib/site-settings-types";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: Partial<SiteSettings>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const settings = normalizeSiteSettings(body);
    const updated = await updateSiteSettings(settings);
    revalidateTag("site-settings", "max");
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
