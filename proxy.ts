import { type NextRequest, NextResponse } from "next/server";

import { hasAccessTokenCookie } from "./lib/auth-cookie";

export function proxy(request: NextRequest) {
  const res = NextResponse.next()
  const path = request.nextUrl.pathname
  const hasToken = hasAccessTokenCookie(request)
  // 开发代理 / 后端转发走 /api/*，不应被页面鉴权重定向（否则浏览器直开会得到 307 → /sign-in）
  if (path === "/api" || path.startsWith("/api/")) {
    return res
  }
  // 规则1: 如果用户已登录，且访问的是 / 或 /sign-in，则重定向到 /dashboard
  if (hasToken && (path === '/' || path === '/sign-in')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 规则2: 如果用户未登录，且访问的不是 /sign-in，则重定向到 /sign-in
  if (!hasToken && path !== '/sign-in') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // 规则3: 如果用户未登录且访问 /sign-in，或者已登录且访问 /dashboard 或其他受保护路由，则放行
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