import { NextResponse } from "next/server";

import { devRevokeAccessToken } from "@/lib/dev-access-token-registry";

export const runtime = "nodejs";

function bearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization");
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(\S+)$/i);
  return m?.[1] ?? null;
}

/**
 * 本地开发用：若带 Bearer accessToken，则从内存注册表撤销，后续 profile 等将拒绝该令牌。
 * 无令牌时仍返回成功（幂等退出）。生产环境返回 404。
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ code: 404, msg: "Not Found" }, { status: 404 });
  }

  const token = bearerToken(request);
  if (token) {
    devRevokeAccessToken(token);
  }

  return NextResponse.json({ code: 0, msg: "ok" });
}
