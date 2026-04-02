import { NextRequest, NextResponse } from "next/server";
import { consumeCallbackToken } from "@/lib/auth/callback-token";

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

  // Return an HTML page (200 response) that sets the cookie reliably,
  // then redirects via meta refresh + JS. A 200 response guarantees
  // the browser stores the cookie (unlike 302 which some browsers drop).
  const response = new NextResponse(
    `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <title>A autenticar...</title>
</head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0a0a0a;color:#fff">
  <p>A autenticar... por favor aguarde.</p>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );

  response.cookies.set("coordinator_email", result.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
