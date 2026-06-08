import { NextResponse } from "next/server";
import { createSiteIntegration } from "@/app/lib/integrations/create-integration";
import { getSiteIntegrations } from "@/app/lib/integrations/get-integrations";
import { getCurrentAppUser } from "@/app/lib/users/get-current-user";

type CreateIntegrationBody = {
  name?: string;
  integrationKey?: string;
  apiKey?: string;
  description?: string;
};

export async function GET() {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const integrations = await getSiteIntegrations();
  return NextResponse.json({ integrations });
}

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: CreateIntegrationBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const integration = await createSiteIntegration({
      name: body.name ?? "",
      integrationKey: body.integrationKey ?? "",
      apiKey: body.apiKey,
      description: body.description,
    });
    return NextResponse.json(integration);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create integration.";
    const status = message.includes("required") || message.includes("must") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
