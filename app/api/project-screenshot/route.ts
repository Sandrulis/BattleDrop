import { NextResponse } from "next/server";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get("url");
  const src = searchParams.get("src");

  if (!pageUrl || !isValidUrl(pageUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const imageSrc =
    src && (src.startsWith("https://") || src.startsWith("http://"))
      ? src
      : `https://image.thum.io/get/width/1280/noanimate/${pageUrl}`;

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
