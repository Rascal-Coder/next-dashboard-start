"use client"

import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { AUTH_ROUTE_QUERY_KEY, fetchAuthRoute } from "@/services/auth-route"
import { useAuthStore } from "@/stores/auth-store"
import { collectAuthMenuPathnames, isPathnameInAuthMenu } from "@/lib/auth-route-access"
import { writeRoutesCookie } from "@/lib/auth-cookie"

/**
 * 仪表盘内路由菜单权限校验（客户端 SPA 导航场景）。
 * 服务端直接访问已由 proxy.ts 中间件拦截；此组件负责客户端路由跳转的校验。
 * query key 与 AppSidebar 完全一致，TanStack Query 自动共享缓存，不产生额外请求。
 * 路由数据就绪后写入短期 Cookie，供 middleware 直接读取，避免 middleware 重复调用 API。
 */
export function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const token = useAuthStore((s) => s.token)

  const { data: routeMenu, isFetched, isError } = useQuery({
    queryKey: [...AUTH_ROUTE_QUERY_KEY, token],
    queryFn: fetchAuthRoute,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  })

  // 路由数据就绪后写入 Cookie，middleware 后续请求可直接读取，无需再调接口
  React.useEffect(() => {
    if (!isFetched || isError || !routeMenu) return
    writeRoutesCookie([...collectAuthMenuPathnames(routeMenu)])
  }, [isFetched, isError, routeMenu])

  React.useEffect(() => {
    if (!isFetched || isError) return
    if (!routeMenu || routeMenu.length === 0) {
      router.replace("/errors/forbidden")
      return
    }
    if (!isPathnameInAuthMenu(pathname, routeMenu)) {
      router.replace("/errors/forbidden")
    }
  }, [isFetched, isError, routeMenu, pathname, router])

  return <>{children}</>
}
