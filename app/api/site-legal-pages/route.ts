import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSiteLegalPages } from "@/app/lib/site-legal-pages/get-site-legal-pages";
import { updateSiteLegalPage } from "@/app/lib/site-legal-pages/update-site-legal-page";
import type { SiteLegalPageKey } from "@/app/lib/site-legal-pages/site-legal-pages-types";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

function isSiteLegalPageKey(value: unknown): value is SiteLegalPageKey {
  return value === "privacy" || value === "rules" || value === "cookie";
}

export async function GET() {
  const pages = await getSiteLegalPages();
  return NextResponse.json(pages);
}

export async function PATCH(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: { page?: unknown; content?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isSiteLegalPageKey(body.page)) {
    return NextResponse.json({ error: "Invalid page." }, { status: 400 });
  }

  try {
    const updated = await updateSiteLegalPage(body.page, body.content);
    revalidateTag("site-legal-pages", "max");
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save legal page.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
