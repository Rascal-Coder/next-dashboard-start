import { type NextRequest, NextResponse } from "next/server";

import { AUTH_ACCESS_TOKEN_COOKIE, hasAccessTokenCookie, getRoutesFromCookie } from "./lib/auth-cookie";
import { isPathnameInAuthMenu, normalizePathname } from "./lib/auth-route-access";

/** 不做菜单权限校验的路径前缀 */
const SKIP_MENU_CHECK_PREFIXES = ["/sign-in", "/sign-up", "/errors/"]

/** 从请求 cookie 中读取 access token 字符串 */
function getAccessToken(request: NextRequest): string | null {
  const raw = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value
  return typeof raw === "string" && raw.length > 0 ? raw : null
}

/** 调用后端 `/auth/route` 接口获取当前用户可访问的菜单树 */
async function fetchRouteMenu(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
  try {
    const res = await fetch(`${baseUrl}/auth/route`, {
      headers: { Authorization: token },
      // 不走缓存，每次请求都重新验证
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    // 后端返回 { code, data } 信封
    if (json?.code !== 0) return null
    return Array.isArray(json.data) ? json.data : null
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const res = NextResponse.next()
  const path = request.nextUrl.pathname
  const hasToken = hasAccessTokenCookie(request)

  // /api/* 不做页面鉴权
  if (path === "/api" || path.startsWith("/api/")) {
    return res
  }

  // 已登录访问 / 或 /sign-in，跳到 /dashboard
  if (hasToken && (path === "/" || path === "/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 未登录访问非 /sign-in，跳到登录页
  if (!hasToken && path !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // /sign-in、/errors/* 等无需菜单校验，直接放行
  if (SKIP_MENU_CHECK_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return res
  }

  // 已登录：校验当前路径是否在菜单白名单中
  // 优先读客户端写入的路由 Cookie（命中则无需调接口）
  const cachedRoutes = getRoutesFromCookie(request)
  if (cachedRoutes !== null) {
    const allowed = cachedRoutes.length > 0 && cachedRoutes.includes(normalizePathname(path))
    if (!allowed) {
      return NextResponse.redirect(new URL("/errors/forbidden", request.url))
    }
    return res
  }

  // Cookie 不存在（首次加载 / 已过期）：fallback 调用后端接口
  const token = getAccessToken(request)
  if (token) {
    const menu = await fetchRouteMenu(token)
    if (!menu || menu.length === 0 || !isPathnameInAuthMenu(path, menu)) {
      return NextResponse.redirect(new URL("/errors/forbidden", request.url))
    }
  }

  return res
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - _next (Next.js 内部文件)
     * - 静态资源 (如 .css, .png)
     * - API 路由 (可选，但通常不需要保护)
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js|json|xml|txt|md|png|jpg|jpeg|gif|webp|avif|ico|bmp|svg|tiff|tif|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf|webmanifest)$).*)',
  ],
}