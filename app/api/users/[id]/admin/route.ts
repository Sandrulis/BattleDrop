import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";
import { updateUserAdminStatus } from "@/app/lib/users/update-user-admin";

type UpdateAdminBody = {
  is_admin?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentAppUser();

  if (!currentUser?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: UpdateAdminBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.is_admin !== "boolean") {
    return NextResponse.json({ error: "is_admin must be a boolean." }, { status: 400 });
  }

  if (id === currentUser.id && !body.is_admin) {
    return NextResponse.json(
      { error: "You cannot remove your own admin access." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateUserAdminStatus(id, body.is_admin);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
