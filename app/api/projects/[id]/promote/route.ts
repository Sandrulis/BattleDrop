import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getHomeBattleWeek } from "@/app/lib/battle-week-settings/get-home-battle-week";
import { projectMatchesBattleWeek } from "@/app/lib/projects/project-battle-week";
import { getPromotedSlotDefinition } from "@/app/lib/promoted-slots/constants";
import { getPromotedSlotsForWeek } from "@/app/lib/promoted-slots/get-promoted-slots-for-week";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import {
  deductUserPoints,
  insufficientPointsPayload,
  userHasEnoughPoints,
} from "@/app/lib/users/user-points";

type PromoteProjectBody = {
  spot?: number;
};

export async function POST(
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

  let body: PromoteProjectBody = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const spot = body.spot;
  if (!spot || !getPromotedSlotDefinition(spot)) {
    return NextResponse.json({ error: "Choose a valid promoted spot." }, { status: 400 });
  }

  const slotDefinition = getPromotedSlotDefinition(spot)!;

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, status, battle_year, battle_iso_week, created_at")
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

  if (project.status !== "published") {
    return NextResponse.json(
      { error: "Only published battle entries can be promoted." },
      { status: 400 },
    );
  }

  const homeBattleWeek = await getHomeBattleWeek();
  const { battle } = homeBattleWeek;

  if (!projectMatchesBattleWeek(project, battle.year, battle.week)) {
    return NextResponse.json(
      { error: "This project is not part of the current battle week." },
      { status: 400 },
    );
  }

  const bookedSlots = await getPromotedSlotsForWeek(battle.year, battle.week);

  if (bookedSlots.some((entry) => entry.spot === spot)) {
    return NextResponse.json(
      { error: "That promoted spot is already booked." },
      { status: 409 },
    );
  }

  if (bookedSlots.some((entry) => entry.projectId === id)) {
    return NextResponse.json(
      { error: "This project is already promoted." },
      { status: 409 },
    );
  }

  const hasEnoughPoints = await userHasEnoughPoints(
    user.id,
    slotDefinition.price,
  );

  if (!hasEnoughPoints) {
    return NextResponse.json(
      insufficientPointsPayload(slotDefinition.price),
      { status: 402 },
    );
  }

  const { data, error } = await supabase
    .from("promoted_slots")
    .insert({
      year: battle.year,
      iso_week: battle.week,
      spot,
      insert_after_organic: slotDefinition.insertAfterOrganic,
      project_id: id,
      user_id: user.id,
      price_points: slotDefinition.price,
    })
    .select("id, spot")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That promoted spot is no longer available." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deduction = await deductUserPoints(user.id, slotDefinition.price);

  if (!deduction.ok) {
    const admin = createAdminClient();
    await admin.from("promoted_slots").delete().eq("id", data.id);

    return NextResponse.json(
      insufficientPointsPayload(slotDefinition.price),
      { status: 402 },
    );
  }

  revalidatePath("/");
  revalidatePath("/my-projects");

  return NextResponse.json({ id: data.id, spot: data.spot });
}
