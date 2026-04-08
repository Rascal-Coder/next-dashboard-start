import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** 为 true 时不自动附加 `Authorization:`（如登录） */
    skipAuth?: boolean;
    /** 为 true 时不按业务信封解析 / 不弹业务错误 toast，仍返回 `response.data`（仍会带 token，除非同时 `skipAuth`） */
    raw?: boolean;
    /** 为 true 时拦截器返回完整 `AxiosResponse`（含 headers，便于下载文件名等）；与 `raw` 同时设时以此为准 */
    fullResponse?: boolean;
    /** 为 true 时不走拦截器里的默认错误 toast（由调用方自行处理） */
    skipErrorHandler?: boolean;
  }
}
