import { NextRequest, NextResponse } from "next/server";
import { consumeCallbackToken } from "@/lib/auth/callback-token";
import { signSessionJwt } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const authText: Record<string, string> = {
  pt: "A autenticar... por favor aguarde.",
  br: "Autenticando... por favor aguarde.",
  es: "Autenticando... por favor espere.",
  en: "Authenticating... please wait.",
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const result = await consumeCallbackToken(token);
  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  const redirectUrl = new URL(result.redirectTo, request.url).toString();

  const localeCookie = request.cookies.get("locale")?.value;
  const locale =
    localeCookie === "es" || localeCookie === "br" || localeCookie === "en"
      ? localeCookie
      : "pt";
  const loadingText = authText[locale];

  // Determine role from admins table
  const [admin] = await db
    .select({ role: admins.role })
    .from(admins)
    .where(eq(admins.email, result.email));

  const role = admin ? admin.role : "coordinator";
  const jwt = await signSessionJwt(result.email, role);

  const response = new NextResponse(
    `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <title>A autenticar...</title>
</head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0a0a0a;color:#fff">
  <p>${loadingText}</p>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );

  // Set JWT session cookie (replaces old coordinator_email cookie)
  response.cookies.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  // Delete legacy cookie if present
  response.cookies.delete("coordinator_email");

  return response;
}
