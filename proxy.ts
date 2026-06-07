import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Refresh Supabase session on every request
  const supabaseResponse = await updateSession(request);

  // If Supabase is redirecting (auth protection), return that redirect
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }

  // Apply locale routing
  const intlResponse = intlMiddleware(request);

  // Carry Supabase auth cookies over to the locale response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\..*).*)"],
};
