import { NextResponse } from "next/server";
import { getClientIp } from "@/app/lib/security/get-client-ip";
import { checkRateLimit } from "@/app/lib/security/rate-limit";

export function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
) {
  const ip = getClientIp(request);
  const result = checkRateLimit(`${bucket}:${ip}`, limit, windowMs);

  if (result.ok) return null;

  return NextResponse.json(
    { error: "Too many requests. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
