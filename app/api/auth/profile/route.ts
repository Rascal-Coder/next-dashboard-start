import { NextResponse } from "next/server";

import { devResolveUserByAccessToken } from "@/lib/dev-access-token-registry";

export const runtime = "nodejs";

function bearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization");
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(\S+)$/i);
  return m?.[1] ?? null;
}

/**
 * 本地开发用：凭 accessToken（Bearer）返回当前用户。生产环境返回 404。
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ code: 404, msg: "Not Found" }, { status: 404 });
  }

  const token = bearerToken(request);
  if (!token) {
    return NextResponse.json(
      { code: 401, msg: "Authorization Bearer token required" },
      { status: 401 },
    );
  }

  const user = devResolveUserByAccessToken(token);
  if (!user) {
    return NextResponse.json({ code: 401, msg: "无效或过期的访问令牌" }, { status: 401 });
  }

  return NextResponse.json({
    code: 0,
    msg: "ok",
    data: { user },
  });
}
