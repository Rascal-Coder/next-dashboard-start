import { httpRequest, isSuccess } from "@/lib/http"
import type { MenuItem } from "@/services/menu"

/** TanStack Query key，登出时需 removeQueries */
export const AUTH_ROUTE_QUERY_KEY = ["auth", "route"] as const

function normalizeAuthRoutePayload(data: unknown): MenuItem[] {
  if (data == null) return []
  if (Array.isArray(data)) return data as MenuItem[]
  return []
}

/**
 * 当前登录用户可见的路由菜单树（与后端 `GET /auth/route` 对应，JWT 后由角色解析菜单）
 */
export async function fetchAuthRoute(): Promise<MenuItem[]> {
  const res = await httpRequest.get<unknown>("/auth/route", undefined, {
    skipErrorHandler: true,
  })
  if (!isSuccess(res.code)) {
    throw new Error(res.msg || "获取路由菜单失败")
  }
  return normalizeAuthRoutePayload(res.data)
}
