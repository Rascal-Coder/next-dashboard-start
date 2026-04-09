"use client"

import { useQuery } from "@tanstack/react-query"
import { AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMenuTree } from "@/components/nav-menu-tree"
import { NavUser } from "@/components/nav-user"
import { AUTH_ROUTE_QUERY_KEY, fetchAuthRoute } from "@/services/auth-route"
import { useAuthStore } from "@/stores/auth-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/animate-ui/components/radix/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const { data: routeMenu = [], isPending, isError, refetch, isFetching } = useQuery({
    queryKey: [...AUTH_ROUTE_QUERY_KEY, token],
    queryFn: fetchAuthRoute,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo decorative size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Xpress</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isPending && (
          <SidebarGroup>
            <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 6 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        {Boolean(token) && !isPending && isError && (
          <SidebarGroup>
            <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
            <div className="mx-2 mt-1 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                <p className="text-xs leading-relaxed text-destructive/80">
                  菜单加载失败，请检查网络或重新登录。
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-destructive/20 bg-background px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "重新加载中…" : "重试"}
              </button>
            </div>
          </SidebarGroup>
        )}
        {Boolean(token) && !isPending && !isError && (
          <NavMenuTree items={routeMenu} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
