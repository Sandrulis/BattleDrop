import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getHomeBattleWeek,
  getPublishTargetWeek,
} from "@/app/lib/battle-week-settings/get-home-battle-week";
import { userHasPublishedProjectInWeek } from "@/app/lib/projects/publish-project";
import { createClient } from "@/app/lib/supabase/server";
import {
  deductUserPoints,
  insufficientPointsPayload,
  userHasEnoughPoints,
} from "@/app/lib/users/user-points";

export async function POST(
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

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, status, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (project.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft projects can be published." },
      { status: 400 },
    );
  }

  const homeBattleWeek = await getHomeBattleWeek();
  const publishTarget = await getPublishTargetWeek(homeBattleWeek);

  const alreadyPublished = await userHasPublishedProjectInWeek(
    user.id,
    publishTarget.year,
    publishTarget.week,
    id,
  );

  if (alreadyPublished) {
    return NextResponse.json(
      {
        error: publishTarget.appliesToNextWeek
          ? "You already have a published project for the next available battle week."
          : "You already have a published project this week.",
      },
      { status: 400 },
    );
  }

  const hasEnoughPoints = await userHasEnoughPoints(
    user.id,
    publishTarget.submitPrice,
  );

  if (!hasEnoughPoints) {
    return NextResponse.json(
      insufficientPointsPayload(publishTarget.submitPrice),
      { status: 402 },
    );
  }

  let { data, error } = await supabase
    .from("projects")
    .update({
      status: "published",
      battle_year: publishTarget.year,
      battle_iso_week: publishTarget.week,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (
    error &&
    (error.message.includes("battle_year") ||
      error.message.includes("battle_iso_week"))
  ) {
    ({ data, error } = await supabase
      .from("projects")
      .update({ status: "published" })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const deduction = await deductUserPoints(user.id, publishTarget.submitPrice);

  if (!deduction.ok) {
    await supabase
      .from("projects")
      .update({
        status: "draft",
        battle_year: null,
        battle_iso_week: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json(
      insufficientPointsPayload(publishTarget.submitPrice),
      { status: 402 },
    );
  }

  revalidatePath("/");
  revalidatePath("/my-projects");

  return NextResponse.json({ id: data.id });
}
