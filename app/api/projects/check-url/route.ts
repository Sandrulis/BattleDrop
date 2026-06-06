import { NextResponse } from "next/server";
import {
  isProjectUrlInDatabase,
  PROJECT_ALREADY_IN_DB_MESSAGE,
} from "@/app/lib/projects/find-existing-project-by-url";
import { normalizeProjectInputUrl } from "@/app/lib/projects/project-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url")?.trim();
  const excludeProjectId = searchParams.get("excludeProjectId") ?? undefined;
  const url = rawUrl ? normalizeProjectInputUrl(rawUrl) : null;

  if (!url) {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const exists = await isProjectUrlInDatabase(url, excludeProjectId);

  return NextResponse.json({
    blocked: exists,
    message: exists ? PROJECT_ALREADY_IN_DB_MESSAGE : null,
  });
}
