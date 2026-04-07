import type { AuthUser } from "@/types/auth"

/** 开发环境：登录时登记 accessToken，profile 据此解析用户（单进程内存，仅限 NODE_ENV=development）。 */
const accessTokenToUser = new Map<string, AuthUser>()

export function devRegisterAccessToken(accessToken: string, user: AuthUser) {
  accessTokenToUser.set(accessToken, { ...user })
}

export function devResolveUserByAccessToken(accessToken: string): AuthUser | undefined {
  return accessTokenToUser.get(accessToken)
}

export function devRevokeAccessToken(accessToken: string): void {
  accessTokenToUser.delete(accessToken)
}
