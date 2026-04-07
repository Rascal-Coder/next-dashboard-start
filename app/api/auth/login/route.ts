import { NextResponse } from "next/server";

import { devRegisterAccessToken } from "@/lib/dev-access-token-registry";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

const DEV_ACCOUNTS = [
  {
    email: "admin@example.com",
    password: "admin123",
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Administrator",
      email: "admin@example.com",
      avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
    },
  },
  {
    email: "user@example.com",
    password: "user123",
    user: {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Demo User",
      email: "user@example.com",
      avatar: "https://avatars.githubusercontent.com/u/9919?v=4",
    },
  },
] as const;

/**
 * 本地开发用：仅允许两个默认账号登录，用 Faker 生成 token。生产环境返回 404。
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ code: 404, msg: "Not Found" }, { status: 404 });
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ code: 400, msg: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { code: 400, msg: "email and password are required" },
      { status: 400 },
    );
  }

  const account = DEV_ACCOUNTS.find((a) => a.email === email && a.password === password);

  if (!account) {
    return NextResponse.json(
      { code: 401, msg: "邮箱或密码错误" },
      { status: 401 },
    );
  }

  const { faker } = await import("@faker-js/faker");
  const accessToken = faker.string.alphanumeric({ length: 48 });
  const refreshToken = faker.string.alphanumeric({ length: 48 });
  devRegisterAccessToken(accessToken, { ...account.user });

  return NextResponse.json({
    code: 0,
    msg: "ok",
    data: {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    },
  });
}
