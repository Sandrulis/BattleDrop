import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
  "0.0.0.0",
]);

const DNS_LOOKUP_TIMEOUT_MS = 4_000;

function parseIpv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets;
}

function isBlockedIpv4(ip: string): boolean {
  const octets = parseIpv4(ip);
  if (!octets) return true;

  const [a, b] = octets;

  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;

  return false;
}

function expandIpv6Hextets(ip: string): number[] | null {
  const normalized = ip.toLowerCase();
  const sides = normalized.split("::");

  if (sides.length > 2) return null;

  const head = sides[0] ? sides[0].split(":").filter(Boolean) : [];
  const tail = sides[1] ? sides[1].split(":").filter(Boolean) : [];
  const missing = 8 - head.length - tail.length;

  if (missing < 0) return null;

  const full = [...head, ...Array(missing).fill("0"), ...tail];
  if (full.length !== 8) return null;

  const hextets: number[] = [];

  for (const part of full) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
    hextets.push(Number.parseInt(part, 16));
  }

  return hextets;
}

function isBlockedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();

  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;

  const hextets = expandIpv6Hextets(lower);
  if (!hextets) return true;

  if (hextets[0] === 0xfffd) return true;

  return false;
}

export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true;
}

function normalizeHttpUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("URL is required.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed.");
  }

  return url;
}

async function resolveHostAddresses(hostname: string) {
  return Promise.race([
    lookup(hostname, { all: true, verbatim: true }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("DNS lookup timed out")), DNS_LOOKUP_TIMEOUT_MS);
    }),
  ]);
}

export async function assertSafeExternalUrl(rawUrl: string): Promise<URL> {
  const url = normalizeHttpUrl(rawUrl);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (!hostname) {
    throw new Error("Enter a valid URL.");
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error("This URL is not allowed.");
  }

  const literalIpVersion = isIP(hostname);

  if (literalIpVersion) {
    if (isBlockedIpAddress(hostname)) {
      throw new Error("This URL is not allowed.");
    }
    return url;
  }

  let addresses: Awaited<ReturnType<typeof resolveHostAddresses>>;

  try {
    addresses = await resolveHostAddresses(hostname);
  } catch {
    throw new Error("Could not resolve URL hostname.");
  }

  if (addresses.length === 0) {
    throw new Error("Could not resolve URL hostname.");
  }

  for (const entry of addresses) {
    if (isBlockedIpAddress(entry.address)) {
      throw new Error("This URL is not allowed.");
    }
  }

  return url;
}

export async function assertSafeExternalHttpUrl(rawUrl: string): Promise<string> {
  const url = await assertSafeExternalUrl(rawUrl);
  return url.href;
}
