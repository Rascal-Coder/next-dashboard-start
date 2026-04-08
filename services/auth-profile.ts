import { httpRequest, isSuccess } from "@/lib/http"
import type { AuthUser } from "@/types/auth"

/** 与后端约定一致；若路径不同可只改此处 */
export const AUTH_PROFILE_PATH = "/auth/profile"

export async function fetchAuthProfile(): Promise<AuthUser> {
  const res = await httpRequest.get<AuthUser>(AUTH_PROFILE_PATH, undefined, {
    skipErrorHandler: true,
  })
  if (!isSuccess(res.code) || res.data == null) {
    throw new Error(res.msg || "获取用户信息失败")
  }
  return res.data
}
