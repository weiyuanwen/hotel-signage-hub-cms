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
  const response = intlMiddleware(request);
  const rewrite = response.headers.get("x-middleware-rewrite");
  if (rewrite) {
    // Next 16's standalone server can treat next-intl's absolute localhost
    // rewrite as external when it binds to 0.0.0.0, returning a redirect loop.
    // Match the server bind origin so Next resolves the rewrite internally.
    const target = new URL(rewrite, request.url);
    const serverOrigin = new URL(request.url);
    serverOrigin.hostname =
      process.env.HOSTNAME || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");
    if (process.env.PORT) serverOrigin.port = process.env.PORT;
    target.protocol = serverOrigin.protocol;
    target.host = serverOrigin.host;
    response.headers.set("x-middleware-rewrite", target.toString());
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
