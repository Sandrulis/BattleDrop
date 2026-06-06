import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/app/lib/security/enforce-rate-limit";
import { PUBLIC_API_RATE_LIMITS } from "@/app/lib/security/rate-limit";
import { assertSafeExternalHttpUrl } from "@/app/lib/security/safe-url";

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(
    request,
    "project-screenshot",
    PUBLIC_API_RATE_LIMITS.projectScreenshot.limit,
    PUBLIC_API_RATE_LIMITS.projectScreenshot.windowMs,
  );
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get("url");
  const src = searchParams.get("src");

  if (!pageUrl) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    await assertSafeExternalHttpUrl(pageUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let imageSrc: string;

  try {
    imageSrc = src
      ? await assertSafeExternalHttpUrl(src)
      : `https://image.thum.io/get/width/1280/noanimate/${encodeURIComponent(pageUrl)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const response = await fetch(imageSrc, {
      signal: AbortSignal.timeout(25_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BattleDropBot/1.0; +https://battledrop.io)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Screenshot unavailable" },
        { status: 422 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Screenshot unavailable" },
      { status: 422 },
    );
  }
}
