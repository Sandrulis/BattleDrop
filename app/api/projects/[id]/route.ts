import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { parseScreenshotRemoteUrl } from "@/app/lib/projects/project-utils";
import { assertMaxLength, INPUT_LIMITS } from "@/app/lib/security/input-limits";

type UpdateProjectBody = {
  name?: string;
  tagline?: string;
  description?: string;
  favicon?: string | null;
  screenshotUrl?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: UpdateProjectBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const tagline = body.tagline?.trim();
  const description = body.description?.trim() ?? "";

  if (!name || !tagline) {
    return NextResponse.json(
      { error: "Name and tagline are required." },
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

  const { data, error } = await supabase
    .from("projects")
    .update({
      name,
      tagline,
      description,
      favicon_url: body.favicon ?? null,
      screenshot_url: parseScreenshotRemoteUrl(body.screenshotUrl),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
