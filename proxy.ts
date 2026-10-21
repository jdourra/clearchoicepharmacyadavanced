import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const REMOVED_PREFIXES = ["/iv-rejuvenation", "/mens-health/trt"]
const REMOVED_PATHS = new Set([
  "/learn/testosterone-replacement-therapy-trt",
  "/learn/myers-cocktail-mobile-iv",
])

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (REMOVED_PATHS.has(path) || REMOVED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return new NextResponse("This page is not available.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
