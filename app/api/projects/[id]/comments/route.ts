import { NextResponse } from "next/server";
import { formatMakerHandle } from "@/app/lib/projects/format-maker-handle";
import { formatLastSeen } from "@/app/lib/site-settings/format-display-date";
import {
  assertMaxLength,
  INPUT_LIMITS,
} from "@/app/lib/security/input-limits";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { getEffectiveDateTimeSettingsForUser } from "@/app/lib/users/user-date-time-preferences";
import { getUserCommentUpvoteCount } from "@/app/lib/product-comments";
import type { ProductComment } from "@/app/lib/types";

type CreateCommentBody = {
  body?: string;
  parentId?: string | null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    let body: CreateCommentBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const commentBody = body.body?.trim() ?? "";

    if (!commentBody) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 },
      );
    }

    try {
      assertMaxLength(
        commentBody,
        INPUT_LIMITS.projectComment,
        "Comment",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid comment.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id, status")
      .eq("id", projectId)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Comments are only available on published projects." },
        { status: 404 },
      );
    }

    const parentId = body.parentId?.trim() || null;

    if (parentId) {
      const { data: parentComment, error: parentError } = await admin
        .from("project_comments")
        .select("id")
        .eq("id", parentId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (parentError) {
        return NextResponse.json({ error: parentError.message }, { status: 500 });
      }

      if (!parentComment) {
        return NextResponse.json(
          { error: "Reply target not found." },
          { status: 400 },
        );
      }
    }

    const { data: inserted, error: insertError } = await admin
      .from("project_comments")
      .insert({
        project_id: projectId,
        user_id: user.id,
        parent_id: parentId,
        body: commentBody,
      })
      .select("id, body, created_at")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message ?? "Could not save comment." },
        { status: 500 },
      );
    }

    const [dateSettings, appUser, authorTotalUpvotes] = await Promise.all([
      getEffectiveDateTimeSettingsForUser(user.id),
      getCurrentAppUser(),
      getUserCommentUpvoteCount(user.id),
    ]);

  const comment: ProductComment = {
    id: inserted.id,
    author: formatMakerHandle(
      appUser ?? { full_name: null, email: null },
    ),
    authorUserId: user.id,
    authorAvatarUrl: appUser?.avatar_url ?? null,
    authorDisplayName:
      appUser?.full_name?.trim() ||
      formatMakerHandle(appUser ?? { full_name: null, email: null }),
    authorTotalUpvotes,
    body: inserted.body,
    createdAt: formatLastSeen(inserted.created_at, dateSettings),
    likes: 0,
  };

    return NextResponse.json({ comment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save comment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
