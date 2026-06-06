export type ProjectPreviewMeta = {
  url: string;
  fetchUrl: string;
  name: string;
  tagline: string;
  favicon: string | null;
  screenshotUrl: string;
};

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function withLangEn(rawUrl: string) {
  const url = new URL(rawUrl);
  url.searchParams.set("lang", "en");
  return url.href;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function matchMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }

  return null;
}

function matchTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1]) : null;
}

function matchFavicon(html: string, pageUrl: URL) {
  const patterns = [
    /<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']*)["']/i,
    /<link[^>]+href=["']([^"']*)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return new URL(match[1], pageUrl.origin).href;
      } catch {
        continue;
      }
    }
  }

  return `${pageUrl.origin}/favicon.ico`;
}

function buildScreenshotProxyUrl(fetchUrl: string, remoteScreenshot: string) {
  return `/api/project-screenshot?url=${encodeURIComponent(fetchUrl)}&src=${encodeURIComponent(remoteScreenshot)}`;
}

function thumIoScreenshot(fetchUrl: string) {
  return `https://image.thum.io/get/width/1280/noanimate/${fetchUrl}`;
}

type MicrolinkResponse = {
  status?: string;
  data?: {
    title?: string;
    description?: string;
    logo?: { url?: string };
    screenshot?: { url?: string };
  };
};

async function fetchViaMicrolink(fetchUrl: string, includeScreenshot: boolean) {
  const microlink = new URL("https://api.microlink.io/");
  microlink.searchParams.set("url", fetchUrl);
  microlink.searchParams.set("screenshot", includeScreenshot ? "true" : "false");
  microlink.searchParams.set("viewport.width", "1280");
  microlink.searchParams.set("viewport.height", "900");
  microlink.searchParams.set("viewport.deviceScaleFactor", "1");

  const response = await fetch(microlink.href, {
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch page via proxy (${response.status})`);
  }

  const json = (await response.json()) as MicrolinkResponse;

  if (json.status !== "success" || !json.data) {
    throw new Error("Could not fetch page metadata.");
  }

  return json.data;
}

async function fetchPageHtml(fetchUrl: string) {
  try {
    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });

    if (!response.ok) return null;

    return response.text();
  } catch {
    return null;
  }
}

async function resolveScreenshotUrl(fetchUrl: string) {
  try {
    const data = await fetchViaMicrolink(fetchUrl, true);
    if (data.screenshot?.url) return data.screenshot.url;
  } catch {
    // fall through to thum.io
  }

  return thumIoScreenshot(fetchUrl);
}

function buildMetaResult(
  pageUrl: URL,
  fetchUrl: string,
  name: string,
  tagline: string,
  favicon: string | null,
  remoteScreenshot: string,
): ProjectPreviewMeta {
  return {
    url: pageUrl.href,
    fetchUrl,
    name,
    tagline,
    favicon,
    screenshotUrl: buildScreenshotProxyUrl(fetchUrl, remoteScreenshot),
  };
}

export async function fetchProjectMeta(rawUrl: string): Promise<ProjectPreviewMeta> {
  const pageUrl = new URL(rawUrl);
  const fetchUrl = withLangEn(pageUrl.href);
  const html = await fetchPageHtml(fetchUrl);

  if (html) {
    const name =
      matchMetaContent(html, "og:title") ??
      matchMetaContent(html, "twitter:title") ??
      matchTitle(html) ??
      pageUrl.hostname;

    const tagline =
      matchMetaContent(html, "og:description") ??
      matchMetaContent(html, "twitter:description") ??
      matchMetaContent(html, "description") ??
      "";

    const favicon = matchFavicon(html, pageUrl);
    const remoteScreenshot = await resolveScreenshotUrl(fetchUrl);

    return buildMetaResult(pageUrl, fetchUrl, name, tagline, favicon, remoteScreenshot);
  }

  try {
    const data = await fetchViaMicrolink(fetchUrl, true);
    const remoteScreenshot = data.screenshot?.url ?? thumIoScreenshot(fetchUrl);

    return buildMetaResult(
      pageUrl,
      fetchUrl,
      data.title ?? pageUrl.hostname,
      data.description ?? "",
      data.logo?.url ?? null,
      remoteScreenshot,
    );
  } catch {
    throw new Error(
      "Could not fetch page data. Some sites block automated access — try your product's direct website URL.",
    );
  }
}
