import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getProjectSaveEligibility } from "@/app/lib/projects/get-project-save-eligibility";
import {
  normalizeProjectSubmitUrl,
  parseScreenshotRemoteUrl,
} from "@/app/lib/projects/project-utils";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";

type SaveProjectBody = {
  url?: string;
  fetchUrl?: string;
  name?: string;
  tagline?: string;
  description?: string;
  favicon?: string | null;
  screenshotUrl?: string | null;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to save a project." }, { status: 401 });
  }

  let body: SaveProjectBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = body.url ? normalizeProjectSubmitUrl(body.url) : null;
  const fetchUrl = body.fetchUrl ? normalizeProjectSubmitUrl(body.fetchUrl) : url;
  const name = body.name?.trim();
  const tagline = body.tagline?.trim();
  const description = body.description?.trim() ?? "";

  if (!url || !fetchUrl || !name || !tagline) {
    return NextResponse.json(
      { error: "URL, name, and tagline are required." },
      { status: 400 },
    );
  }

  try {
    assertMaxLength(name, INPUT_LIMITS.projectName, "Name");
    assertMaxLength(tagline, INPUT_LIMITS.projectTagline, "Tagline");
    assertMaxLength(description, INPUT_LIMITS.projectDescription, "Description");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid project data.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eligibility = await getProjectSaveEligibility(user.id, url);
  if (!eligibility.canSave) {
    return NextResponse.json({
      skipped: true,
      reason: eligibility.reason,
      message: eligibility.message,
    });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      url,
      fetch_url: fetchUrl,
      name,
      tagline,
      description,
      favicon_url: body.favicon ?? null,
      screenshot_url: parseScreenshotRemoteUrl(body.screenshotUrl),
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
