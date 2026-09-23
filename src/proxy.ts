import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { canonicalRedirect, skipIntl } from "./lib/canonical-host";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const redirected = canonicalRedirect(request);
  if (redirected) return redirected;
  if (skipIntl(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
