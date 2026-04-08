import { httpRequest, isSuccess } from "@/lib/http"

/** 与后端约定一致；若路径不同可只改此处 */
export const CAPTCHA_PATH = "captcha"

export type CaptchaResult = {
  img: string
  id: string
}

/** GET：返回可写入 DOM 的图片 HTML 与校验用 id */
export async function getCaptcha(): Promise<CaptchaResult> {
  const res = await httpRequest.get<CaptchaResult>(CAPTCHA_PATH, undefined, {
    skipAuth: true,
    skipErrorHandler: true,
  })
  if (!isSuccess(res.code) || res.data == null) {
    throw new Error(res.msg || "获取验证码失败")
  }
  const { img, id } = res.data as CaptchaResult
  return { img, id }
}
