export function normalizeProjectInputUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeProjectHost(rawUrl: string) {
  const url = new URL(rawUrl.trim());
  let hostname = url.hostname.toLowerCase();

  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  return hostname;
}

export function normalizeProjectUrl(rawUrl: string) {
  const url = new URL(rawUrl.trim());
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();

  let pathname = url.pathname.replace(/\/+$/, "");
  if (!pathname) pathname = "";

  return `${url.protocol}//${url.hostname}${pathname}`;
}

export function projectUrlsMatchHost(left: string, right: string) {
  return normalizeProjectHost(left) === normalizeProjectHost(right);
}

export function buildScreenshotProxyUrl(fetchUrl: string, screenshotUrl: string) {
  return `/api/project-screenshot?url=${encodeURIComponent(fetchUrl)}&src=${encodeURIComponent(screenshotUrl)}`;
}

export function parseScreenshotRemoteUrl(screenshotUrl: string | null | undefined) {
  if (!screenshotUrl) return null;

  try {
    const parsed = new URL(screenshotUrl, "http://localhost");
    return parsed.searchParams.get("src");
  } catch {
    return screenshotUrl.startsWith("http") ? screenshotUrl : null;
  }
}
