import { httpRequest, isSuccess } from "@/lib/http"

export type MenuType = "page" | "iframe" | "link" | "btn"

export type MenuItem = {
  id: number
  parentId: number | null
  name: string | null
  desc: string | null
  sort: number | null
  menuType: MenuType
  path: string | null
  redirect: string | null
  meta: {
    title: string
    layout?: string
    isIframe?: boolean
    icon?: string
    isAffix?: boolean
    isKeepAlive?: boolean
    link?: string
    isHide?: boolean
  }
  auth: string | null
  createTime: string
  updateTime: string | null
  children?: MenuItem[]
}

type MenuTreeResponse = {
  list: MenuItem[]
  total: number
}

export type MenuMutationPayload = {
  parentId: number | null
  name: string | null
  menuType: MenuType
  sort: number | null
  path: string | null
  auth: string | null
  meta: {
    title: string
    icon?: string
    layout?: string
    isIframe?: boolean
    isKeepAlive?: boolean
    isAffix?: boolean
    isHide?: boolean
    link?: string
  }
}

/** TanStack Query 统一 key，供 invalidateQueries 与 useQuery 共享 */
export const MENU_QUERY_KEY = ["menu-tree"] as const

/** 获取菜单树（含按钮节点） */
export async function fetchMenuTree(): Promise<MenuItem[]> {
  const res = await httpRequest.get<MenuTreeResponse>("/menu/tree", { hasBtn: true })
  if (!isSuccess(res.code) || res.data == null) {
    throw new Error(res.msg || "获取菜单列表失败")
  }
  return res.data.list
}

/** 新增菜单 */
export async function createMenu(payload: MenuMutationPayload): Promise<void> {
  const res = await httpRequest.post("/menu/create", payload)
  if (!isSuccess(res.code)) {
    throw new Error(res.msg || "创建菜单失败")
  }
}

/** 更新菜单 */
export async function updateMenu(payload: MenuMutationPayload & { id: number }): Promise<void> {
  const res = await httpRequest.put("/menu/update", payload)
  if (!isSuccess(res.code)) {
    throw new Error(res.msg || "更新菜单失败")
  }
}

/** 删除菜单 */
export async function deleteMenu(id: number): Promise<void> {
  const res = await httpRequest.delete("/menu/delete", { data: { id } })
  if (!isSuccess(res.code)) {
    throw new Error(res.msg || "删除菜单失败")
  }
}
