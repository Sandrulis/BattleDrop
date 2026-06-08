import { NextResponse } from "next/server";
import { deleteSiteIntegration } from "@/app/lib/integrations/delete-integration";
import { updateSiteIntegration } from "@/app/lib/integrations/update-integration";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type UpdateIntegrationBody = {
  name?: string;
  integrationKey?: string;
  apiKey?: string | null;
  description?: string;
  enabled?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: UpdateIntegrationBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const integration = await updateSiteIntegration(id, body);
    return NextResponse.json(integration);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update integration.";
    const status =
      message === "Integration not found."
        ? 404
        : message.includes("required") ||
            message.includes("must") ||
            message.includes("No changes")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteSiteIntegration(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete integration.";
    const status = message === "Integration not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
