import { NextResponse } from "next/server";
import {
  isProjectUrlInDatabase,
  PROJECT_ALREADY_IN_DB_MESSAGE,
} from "@/app/lib/projects/find-existing-project-by-url";
import { normalizeProjectSubmitUrl } from "@/app/lib/projects/project-utils";
import { enforceRateLimit } from "@/app/lib/security/enforce-rate-limit";
import { PUBLIC_API_RATE_LIMITS } from "@/app/lib/security/rate-limit";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "projects-check-url",
    PUBLIC_API_RATE_LIMITS.projectCheckUrl.limit,
    PUBLIC_API_RATE_LIMITS.projectCheckUrl.windowMs,
  );
  if (rateLimited) return rateLimited;

  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url")?.trim();
  const excludeProjectId = searchParams.get("excludeProjectId") ?? undefined;
  const url = rawUrl ? normalizeProjectSubmitUrl(rawUrl) : null;

  if (!url) {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const exists = await isProjectUrlInDatabase(url, excludeProjectId);

  return NextResponse.json({
    blocked: exists,
    message: exists ? PROJECT_ALREADY_IN_DB_MESSAGE : null,
  });
}
