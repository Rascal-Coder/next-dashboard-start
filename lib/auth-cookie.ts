/** Access / refresh token 仅以 Cookie 持久化（中间件与 axios 同源读取）。 */

export const AUTH_ACCESS_TOKEN_COOKIE = "dashboard_at";
export const AUTH_REFRESH_TOKEN_COOKIE = "dashboard_rt";

type CookieRequest = {
  cookies: { get: (name: string) => { value: string } | undefined };
};

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function cookieFlags(): string {
  const secure =
    typeof process !== "undefined" && process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";
  return `; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined" || !document.cookie) return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return part.slice(prefix.length);
      }
    }
  }
  return null;
}

export function getAccessTokenFromDocument(): string | null {
  const v = readCookieValue(AUTH_ACCESS_TOKEN_COOKIE);
  return v && v.length > 0 ? v : null;
}

export function getRefreshTokenFromDocument(): string | null {
  const v = readCookieValue(AUTH_REFRESH_TOKEN_COOKIE);
  return v && v.length > 0 ? v : null;
}

export function writeAuthTokenCookies(tokens: {
  token: string;
  refreshToken: string;
}): void {
  if (typeof document === "undefined") return;
  const { token, refreshToken } = tokens;
  const flags = cookieFlags();
  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}${flags}`;
  document.cookie = `${AUTH_REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}${flags}`;
}

export function clearAuthTokenCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0`;
  document.cookie = `${AUTH_REFRESH_TOKEN_COOKIE}=; Path=/; Max-Age=0`;
}

export function hasAccessTokenCookie(request: CookieRequest): boolean {
  const raw = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
  return typeof raw === "string" && raw.length > 0;
}
