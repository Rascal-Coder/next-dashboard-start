/**
 * 解析 axios `baseURL`：优先 `NEXT_PUBLIC_API_URL`（可为完整 URL），否则使用 `NEXT_PUBLIC_API_PREFIX`（默认 `/api`）。
 */
export function parseBaseUrl(
  env: Record<string, string | undefined>,
  _isDev: boolean
): string {
  const explicit = env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit;
  }
  const prefix = env.NEXT_PUBLIC_API_PREFIX?.trim() || "/api";
  return prefix.startsWith("/") ? prefix : `/${prefix}`;
}
