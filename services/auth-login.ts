import { httpRequest, isSuccess } from "@/lib/http"

/** 与后端约定一致；若路径不同可只改此处 */
export const LOGIN_PATH = "/login"

export type LoginTokens = {
  token: string
  refreshToken: string
}

export type LoginPayload = {
  username: string
  password: string
  code: string
  codeId: string
}

export async function login(payload: LoginPayload): Promise<LoginTokens> {
  const res = await httpRequest.post<LoginTokens>(
    LOGIN_PATH,
    {
      username: payload.username,
      password: payload.password,
      code: payload.code,
      codeId: payload.codeId,
    },
    {
      skipAuth: true,
      skipErrorHandler: true,
    },
  )
  if (!isSuccess(res.code) || !res.data) {
    throw new Error(res.msg || "登录失败，请重试")
  }
  return res.data
}
