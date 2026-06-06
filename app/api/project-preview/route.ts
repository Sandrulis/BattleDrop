import { NextResponse } from "next/server";
import { fetchProjectMeta } from "@/app/lib/fetch-project-meta";
import { normalizeProjectInputUrl } from "@/app/lib/projects/project-utils";

export async function POST(request: Request) {
  let body: { url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = body.url ? normalizeProjectInputUrl(body.url) : null;
  if (!url) {
    return NextResponse.json(
      { error: "Enter a valid project URL." },
      { status: 400 },
    );
  }

  try {
    const meta = await fetchProjectMeta(url);
    return NextResponse.json(meta);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch project data";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
