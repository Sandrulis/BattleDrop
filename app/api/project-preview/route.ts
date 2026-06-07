import { NextResponse } from "next/server";
import { fetchProjectMeta } from "@/app/lib/fetch-project-meta";
import { normalizeProjectSubmitUrl } from "@/app/lib/projects/project-utils";
import { enforceRateLimit } from "@/app/lib/security/enforce-rate-limit";
import { PUBLIC_API_RATE_LIMITS } from "@/app/lib/security/rate-limit";
import { assertSafeExternalUrl } from "@/app/lib/security/safe-url";

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "project-preview",
    PUBLIC_API_RATE_LIMITS.projectPreview.limit,
    PUBLIC_API_RATE_LIMITS.projectPreview.windowMs,
  );
  if (rateLimited) return rateLimited;

  let body: { url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = body.url ? normalizeProjectSubmitUrl(body.url) : null;
  if (!url) {
    return NextResponse.json(
      { error: "Enter a valid project URL." },
      { status: 400 },
    );
  }

  try {
    await assertSafeExternalUrl(url);
    const meta = await fetchProjectMeta(url);
    return NextResponse.json(meta);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch project data";
    const status = message.includes("not allowed") ? 400 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
