import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: comment, error: commentError } = await admin
      .from("project_comments")
      .select("id, user_id, project_id")
      .eq("id", commentId)
      .maybeSingle();

    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 500 });
    }

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id, status, deleted_at")
      .eq("id", comment.project_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Upvotes are only available on published projects." },
        { status: 404 },
      );
    }

    if (comment.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot upvote your own comment." },
        { status: 400 },
      );
    }

    const { error: insertError } = await admin.from("project_comment_upvotes").insert({
      comment_id: commentId,
      user_id: user.id,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You already upvoted this comment." },
          { status: 400 },
        );
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { count, error: countError } = await admin
      .from("project_comment_upvotes")
      .select("id", { count: "exact", head: true })
      .eq("comment_id", commentId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      likes: count ?? 1,
      upvotedByViewer: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upvote comment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
