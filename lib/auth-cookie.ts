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
