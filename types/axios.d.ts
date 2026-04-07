import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** 为 true 时不自动附加 `Authorization: Bearer`（如登录） */
    skipAuth?: boolean;
    /** 为 true 时不按业务信封解析，保持原始 `response.data` */
    raw?: boolean;
    /** 为 true 时不走拦截器里的默认错误 toast（由调用方自行处理） */
    skipErrorHandler?: boolean;
  }
}
