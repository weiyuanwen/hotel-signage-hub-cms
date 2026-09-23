import { NextRequest, NextResponse } from "next/server";

export const CANONICAL_HOST = "signagehub.online";
const WWW_HOST = `www.${CANONICAL_HOST}`;

function visitorScheme(request: NextRequest): "http" | "https" | null {
  const visitor = request.headers.get("cf-visitor");
  if (visitor) {
    try {
      const scheme = JSON.parse(visitor).scheme;
      if (scheme === "http" || scheme === "https") return scheme;
    } catch {
      /* ignore invalid cf-visitor */
    }
  }
  if (!request.headers.get("cf-ray")) return null;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto === "http" || proto === "https") return proto;
  return null;
}

export function canonicalRedirect(request: NextRequest): NextResponse | null {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== CANONICAL_HOST && host !== WWW_HOST) return null;

  const needHttps = visitorScheme(request) === "http";
  const needHost = host === WWW_HOST;
  if (!needHttps && !needHost) return null;

  return NextResponse.redirect(`https://${CANONICAL_HOST}${request.nextUrl.pathname}${request.nextUrl.search}`, 308);
}

export function skipIntl(pathname: string): boolean {
  if (/^\/(?:api|_next|_vercel|rooms|devices|hotel|templates|staff|cms|device|broadcasting)(?:\/|$)/.test(pathname)) {
    return true;
  }
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}
