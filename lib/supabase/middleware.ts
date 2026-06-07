import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  // Strip locale prefix (/en or /es) to get the canonical path
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/";
  const locale = pathname.match(/^\/(en|es)/)?.[1] ?? "en";

  const protectedRoutes = ["/trips/new", "/profile"];
  const adminRoutes = ["/admin"];

  if (!user && protectedRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("redirect", pathnameWithoutLocale);
    return NextResponse.redirect(url);
  }

  if (adminRoutes.some((r) => pathnameWithoutLocale.startsWith(r))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
