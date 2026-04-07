"use client";

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { parseBaseUrl } from "@/env/parse";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/stores/auth-store";

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
  raw?: boolean;
};

function getClientAccessToken(): string | null {
  const live = useAuthStore.getState().accessToken;
  if (live) return live;
  return null;
}

function notifyDestructive(description: string) {
  if (typeof window === "undefined") return;
  void import("@/hooks/use-toast").then(({ toast }) => {
    toast({ variant: "destructive", description });
  });
}

/**
 * 浏览器走 Next rewrites（相对路径）；服务端直连 `NEXT_PUBLIC_*` 中的完整 URL，避免 Node 下相对 baseURL 无效。
 */
export function getApiBaseUrl(): string {
  const isDev = process.env.NODE_ENV === "development";
  const env = process.env as Record<string, string | undefined>;
  const parsed = parseBaseUrl(env, isDev);

  if (parsed.startsWith("http")) {
    return parsed;
  }

  if (typeof window !== "undefined") {
    return parsed;
  }

  const publicUrl = env.NEXT_PUBLIC_API_URL ?? "";
  if (publicUrl.startsWith("http")) {
    return publicUrl;
  }

  const port = env.PORT ?? "3000";
  const path = parsed.startsWith("/") ? parsed : `/${parsed}`;
  return `http://127.0.0.1:${port}${path}`;
}

const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

function isApiEnvelope(x: unknown): x is ApiEnvelope {
  return (
    typeof x === "object" &&
    x !== null &&
    "code" in x &&
    typeof (x as { code: unknown }).code === "number"
  );
}

function pickErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  if (!("msg" in data)) return undefined;
  const msg = (data as { msg: unknown }).msg;
  return typeof msg === "string" ? msg : undefined;
}

function appendQuery(url: string, params?: object) {
  if (!params || Object.keys(params).length === 0) return url;
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    u.set(k, String(v));
  }
  const q = u.toString();
  return q ? `${url}?${q}` : url;
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.raw || config.skipAuth) {
      return config;
    }

    const headers = new AxiosHeaders(config.headers);
    const existing = headers.get("Authorization");
    if (typeof existing === "string" && existing.length > 0) {
      config.headers = headers;
      return config;
    }

    const token = typeof window !== "undefined" ? getClientAccessToken() : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
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
 * HTTP 错误或 `raw: true` 时返回值依拦截器而定。
 */
export const httpRequest = {
  get<T = unknown>(url: string, params?: object, config?: HttpRequestConfig): Promise<ApiResponse<T>> {
    return request.get(appendQuery(url, params), {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },

  post<T = unknown>(url: string, data?: object, config?: HttpRequestConfig): Promise<ApiResponse<T>> {
    return request.post(url, data, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },

  put<T = unknown>(url: string, data?: object, config?: HttpRequestConfig): Promise<ApiResponse<T>> {
    return request.put(url, data, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },

  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ApiResponse<T>> {
    return request.delete(url, {
      ...config,
      headers: config?.headers ?? new AxiosHeaders(),
    }) as Promise<ApiResponse<T>>;
  },
};

export const http = request;
export default request;
