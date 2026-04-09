import Cookies from "js-cookie";

export const AUTH_ACCESS_TOKEN_COOKIE = "dashboard_at";
export const AUTH_REFRESH_TOKEN_COOKIE = "dashboard_rt";

type CookieRequest = {
  cookies: { get: (name: string) => { value: string } | undefined };
};

const EXPIRES_DAYS = 7;

function authCookieAttributes(): Cookies.CookieAttributes {
  const secure =
    typeof process !== "undefined" && process.env.NODE_ENV === "production";
  return {
    path: "/",
    expires: EXPIRES_DAYS,
    sameSite: "Lax",
    ...(secure ? { secure: true } : {}),
  };
}

export function getAccessTokenFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const v = Cookies.get(AUTH_ACCESS_TOKEN_COOKIE);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function getRefreshTokenFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const v = Cookies.get(AUTH_REFRESH_TOKEN_COOKIE);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function writeAuthTokenCookies(tokens: {
  token: string;
  refreshToken: string;
}): void {
  if (typeof document === "undefined") return;
  const attrs = authCookieAttributes();
  Cookies.set(AUTH_ACCESS_TOKEN_COOKIE, tokens.token, attrs);
  Cookies.set(AUTH_REFRESH_TOKEN_COOKIE, tokens.refreshToken, attrs);
}

export function clearAuthTokenCookies(): void {
  if (typeof document === "undefined") return;
  const pathOnly = { path: "/" as const };
  Cookies.remove(AUTH_ACCESS_TOKEN_COOKIE, pathOnly);
  Cookies.remove(AUTH_REFRESH_TOKEN_COOKIE, pathOnly);
}

export function hasAccessTokenCookie(request: CookieRequest): boolean {
  const raw = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
  return typeof raw === "string" && raw.length > 0;
}

/** 路由白名单缓存 Cookie，存放当前用户可访问的路径列表，5 分钟有效 */
export const AUTH_ROUTES_COOKIE = "dashboard_routes";

/** 服务端（middleware）从请求 cookie 中读取路由白名单，返回路径数组或 null */
export function getRoutesFromCookie(request: CookieRequest): string[] | null {
  const raw = request.cookies.get(AUTH_ROUTES_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 客户端将路由白名单写入 Cookie（与 staleTime 保持一致，5 分钟后自动过期） */
export function writeRoutesCookie(paths: string[]): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof process !== "undefined" && process.env.NODE_ENV === "production";
  Cookies.set(AUTH_ROUTES_COOKIE, encodeURIComponent(JSON.stringify(paths)), {
    path: "/",
    expires: 5 / (24 * 60), // 5 分钟
    sameSite: "Lax",
    ...(secure ? { secure: true } : {}),
  });
}

/** 退出登录时清除路由白名单 Cookie */
export function clearRoutesCookie(): void {
  if (typeof document === "undefined") return;
  Cookies.remove(AUTH_ROUTES_COOKIE, { path: "/" });
}
