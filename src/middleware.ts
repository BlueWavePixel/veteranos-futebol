import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get("locale")) {
    const country = request.headers.get("x-vercel-ip-country") || "PT";
    let locale = "pt";
    if (country === "ES") locale = "es";
    else if (country === "BR") locale = "br";

    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|images/|icon\\.png|api/).*)"],
};
