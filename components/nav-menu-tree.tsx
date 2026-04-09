"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/animate-ui/primitives/radix/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/animate-ui/components/radix/sidebar"
import { cn } from "@/lib/utils"
import type { MenuItem } from "@/services/menu"

/** 侧栏展示：排除按钮节点与隐藏项，并递归处理子节点 */
export function filterMenuForSidebar(items: MenuItem[]): MenuItem[] {
  return items
    .filter((i) => i.menuType !== "btn" && !i.meta.isHide)
    .map((i) => ({
      ...i,
      children: i.children?.length ? filterMenuForSidebar(i.children) : undefined,
    }))
}

export function resolveIcon(name?: string): LucideIcon | undefined {
  if (!name) return undefined
  const Icon = (Icons as unknown as Record<string, LucideIcon | undefined>)[name]
  return typeof Icon === "function" ? Icon : undefined
}

/** 动态 Lucide 图标必须用 createElement，禁止 `<Icon />`（Icon 为变量时会被 Compiler 视为在 render 内创建组件） */
function renderLucideIcon(
  Icon: LucideIcon | undefined,
  className = "size-4 shrink-0",
) {
  if (!Icon) return null
  return React.createElement(Icon, { className })
}

export function hrefForMenuItem(item: MenuItem): string {
  if (item.menuType === "link" && item.meta.link) return item.meta.link
  return item.path ?? "#"
}

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  )
}

function subtreeContainsPath(item: MenuItem, pathname: string): boolean {
  const h = hrefForMenuItem(item)
  if (h && h !== "#") {
    if (pathname === h) return true
    if (h !== "/" && pathname.startsWith(`${h}/`)) return true
  }
  return item.children?.some((c) => subtreeContainsPath(c, pathname)) ?? false
}

type NavMenuTreeProps = {
  items: MenuItem[]
  groupLabel?: string
}

/**
 * 将后端菜单树渲染为侧栏导航（支持任意层级折叠）
 */
export function NavMenuTree({ items, groupLabel = "导航菜单" }: NavMenuTreeProps) {
  const pathname = usePathname()
  const filtered = React.useMemo(() => filterMenuForSidebar(items), [items])

  if (filtered.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
        <div className="text-muted-foreground px-2 text-xs">暂无可用菜单</div>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {filtered.map((item) => (
          <NavMenuTopItem key={item.id} item={item} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavMenuTopItem({
  item,
  pathname,
}: {
  item: MenuItem
  pathname: string
}) {
  const hasChildren = Boolean(item.children?.length)
  const href = hrefForMenuItem(item)
  const Icon = resolveIcon(item.meta.icon)
  const defaultOpen = subtreeContainsPath(item, pathname)

  if (!hasChildren) {
    const external = isExternalHref(href)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.meta.title}
          className="cursor-pointer"
          isActive={!external && pathname === href}
        >
          <Link href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {renderLucideIcon(Icon)}
            <span>{item.meta.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      asChild
      defaultOpen={defaultOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.meta.title} className="cursor-pointer">
            {renderLucideIcon(Icon)}
            <span>{item.meta.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <NavMenuSubNode key={child.id} item={child} pathname={pathname} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function subFolderTriggerClassName() {
  return cn(
    "text-sidebar-foreground ring-sidebar-ring flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-left text-sm",
    "[&>svg]:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
    "group-data-[collapsible=icon]:hidden",
  )
}

function NavMenuSubNode({
  item,
  pathname,
}: {
  item: MenuItem
  pathname: string
}) {
  const hasChildren = Boolean(item.children?.length)
  const href = hrefForMenuItem(item)
  const defaultOpen = subtreeContainsPath(item, pathname)

  if (!hasChildren) {
    const external = isExternalHref(href)
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          size="md"
          isActive={!external && pathname === href}
          className="cursor-pointer"
        >
          <Link href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <span>{item.meta.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <SidebarMenuSubItem>
      <Collapsible defaultOpen={defaultOpen} className="group/subcollapsible w-full min-w-0">
        <CollapsibleTrigger asChild>
          <button type="button" className={subFolderTriggerClassName()}>
            <span className="truncate">{item.meta.title}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mx-0 border-l-0 px-0">
            {item.children!.map((child) => (
              <NavMenuSubNode key={child.id} item={child} pathname={pathname} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuSubItem>
  )
}
