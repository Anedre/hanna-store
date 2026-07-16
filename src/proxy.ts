import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Next 16: middleware.ts fue reemplazado por proxy.ts (runtime nodejs).
// Protege server-side: /mi-cuenta y /checkout (sesión) y /admin (rol ADMIN).
// El guard client de (admin)/layout.tsx y los checks de las API routes se
// mantienen como defensa en profundidad.

const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

async function readSession(request: NextRequest) {
  // Auth.js escribe la cookie como authjs.session-token o
  // __Secure-authjs.session-token según el protocolo; probamos ambas.
  for (const secureCookie of [false, true]) {
    const token = await getToken({ req: request, secret: AUTH_SECRET, secureCookie });
    if (token) return token;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await readSession(request);

  if (!token) {
    const signInUrl = new URL("/iniciar-sesion", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mi-cuenta/:path*", "/checkout/:path*", "/admin/:path*"],
};
