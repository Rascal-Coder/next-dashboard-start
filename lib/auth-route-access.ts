import type { MenuItem } from "@/services/menu"

/** 统一规范化路径，便于与 `usePathname()` 比较 */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/"
  const t = pathname.replace(/\/+$/, "")
  return t.length ? t : "/"
}

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  )
}

/** 参与「可访问页面」判断的 href：排除按钮权限节点与外链 */
function hrefForAccessCheck(item: MenuItem): string | null {
  if (item.menuType === "btn") return null
  if (item.menuType === "link" && item.meta.link) {
    const l = item.meta.link.trim()
    return l.length > 0 ? l : null
  }
  const p = item.path?.trim() ?? ""
  return p.length > 0 && p !== "#" ? p : null
}

/** 从 `/auth/route` 菜单树收集本应用内可访问的 path（精确匹配） */
export function collectAuthMenuPathnames(items: MenuItem[]): Set<string> {
  const set = new Set<string>()
  function walk(list: MenuItem[]) {
    for (const item of list) {
      const h = hrefForAccessCheck(item)
      if (h && !isExternalHref(h) && h.startsWith("/")) {
        set.add(normalizePathname(h))
      }
      if (item.children?.length) walk(item.children)
    }
  }
  walk(items)
  return set
}

export function isPathnameInAuthMenu(pathname: string, items: MenuItem[]): boolean {
  return collectAuthMenuPathnames(items).has(normalizePathname(pathname))
}
