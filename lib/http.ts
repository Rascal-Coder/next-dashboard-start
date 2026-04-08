"use client";

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { parseBaseUrl } from "@/env/parse";
import { getAccessTokenFromDocument } from "@/lib/auth-cookie";

/** 后端统一业务响应（与 `app/api` 下 JSON 一致） */
export type ApiEnvelope<T = unknown> = {
  code: number;
  msg: string;
  data?: T;
};

export type ApiResponse<T = unknown> = ApiEnvelope<T>;

/** 与参考工程一致：`code === 0` 为成功 */
export function isSuccess(code: number): boolean {
  return code === 0;
}

type HttpRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
  /** 不按 `{ code, msg }` 处理，直接返回 `response.data`；仍会附加 token（请用 `skipAuth` 跳过） */
  raw?: boolean;
  /** 返回完整 `AxiosResponse`（如 `responseType: 'blob'` 时读 `Content-Disposition`） */
  fullResponse?: boolean;
};


function notifyDestructive(description: string) {
  if (typeof window === "undefined") return;
  import("@/hooks/use-toast").then(({ toast }) => {
    toast({ variant: "destructive", description });
  });
}

/**
 * 浏览器走 Next rewrites（相对路径）；服务端直连 `NEXT_PUBLIC_*` 中的完整 URL，避免 Node 下相对 baseURL 无效。
 */
export const baseURL = parseBaseUrl(
  {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DEV_API_PREFIX: process.env.NEXT_PUBLIC_DEV_API_PREFIX,
    NEXT_PUBLIC_DEV_PROXY: process.env.NEXT_PUBLIC_DEV_PROXY,
  },
  process.env.NODE_ENV === "development",
)

const request = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 判断响应体是否为后端约定的“业务信封”结构。
 *
 * 仅检查最关键的 `code: number` 字段，用于在拦截器里决定是否按 `{ code, msg, data }` 处理。
 */
function isApiEnvelope(x: unknown): x is ApiEnvelope {
  return (
    typeof x === "object" &&
    x !== null &&
    "code" in x &&
    typeof (x as { code: unknown }).code === "number"
  );
}

/**
 * 从非标准错误响应中尝试提取可展示的错误信息。
 *
 * 场景：当后端没有返回统一的 `{ code, msg }` 结构时（例如网关/反向代理/框架默认错误页），
 * 仍尽量从 `data.msg` 里拿到字符串消息以改善提示。
 */
function pickErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  if (!("msg" in data)) return undefined;
  const msg = (data as { msg: unknown }).msg;
  return typeof msg === "string" ? msg : undefined;
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.skipAuth) {
      return config;
    }

    const headers = new AxiosHeaders(config.headers);
    const existing = headers.get("Authorization");
    if (typeof existing === "string" && existing.length > 0) {
      config.headers = headers;
      return config;
    }

    const token = typeof window !== "undefined" ? getAccessTokenFromDocument() : null;
    if (token) {
      // Bearer
      headers.set("Authorization", `${token}`);
    }
    config.headers = headers;
    return config;
  },
  (error: AxiosError) => {
    notifyDestructive(error.message || "请求发起失败");
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.fullResponse) {
      return response;
    }
    if (response.config.raw) {
      return response.data;
    }

    const payload = response.data;
    if (isApiEnvelope(payload)) {
      const skip = response.config.skipErrorHandler;
      if (!isSuccess(payload.code) && !skip) {
        notifyDestructive(payload.msg || "请求失败");
      }
      return payload;
    }

    return payload;
  },
  (error: AxiosError) => {
    const skip = error.config?.skipErrorHandler;
    const data = error.response?.data;
    if (isApiEnvelope(data)) {
      error.message = data.msg || error.message;
    } else {
      const msg = pickErrorMessage(data);
      if (msg) {
        error.message = msg;
      }
    }

    if (!skip) {
      notifyDestructive(error.message || "网络异常，请稍后重试");
    }

    return Promise.reject(error);
  },
);

/**
 * 与参考工程类似的便捷方法；成功时返回完整信封 `{ code, msg, data }`。
 * `raw: true` 时返回原始 `data`；`fullResponse: true` 时返回整份 `AxiosResponse`（建议下载等场景直接用 `default request` 并传该选项）。
 */
export const httpRequest = {
  get<T = unknown>(
    url: string,
    params?: object,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>> {
    return request.get(url, {
      ...config,
      params,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },

  post<T = unknown>(
    url: string,
    data?: object,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>> {
    return request.post(url, data, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;    
  },

  put<T = unknown>(
    url: string,
    data?: object,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>> {
    return request.put(url, data, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },

  delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>> {
    return request.delete(url, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },
};

export default request;
