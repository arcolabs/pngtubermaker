import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - API routes (/api/*)
  // - Next.js internals (_next/*)
  // - Player embed routes (/player/*)
  // - Static files (favicon, images, etc.)
  matcher: ["/((?!api|_next|favicon|images|videos|og-image|player|.*\\..*).*)"],
};
