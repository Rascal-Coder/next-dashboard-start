"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  clearAuthTokenCookies,
  getAccessTokenFromDocument,
  getRefreshTokenFromDocument,
  writeAuthTokenCookies,
} from "@/lib/auth-cookie"
import type { AuthUser } from "@/types/auth"

export type { AuthUser }

/** 仅缓存用户信息；token 只存在 Cookie（见 `lib/auth-cookie`） */
export const AUTH_USER_STORAGE_KEY = "dashboard-auth-user"

type AuthStore = {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  setTokens: (tokens: { token: string; refreshToken: string }) => void
  setUser: (user: AuthUser | null) => void
  clearSession: () => void
  /** 从 Cookie 把 token 同步进内存（供依赖 store 的 UI；请求头请用 `getAccessTokenFromDocument`） */
  hydrateFromCookies: () => void
}

const emptySession = {
  token: null,
  refreshToken: null,
  user: null,
} as const

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...emptySession,
      setTokens: (tokens) => {
        writeAuthTokenCookies(tokens)
        set({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        })
      },
      setUser: (user) => set({ user }),
      clearSession: () => {
        set({ ...emptySession })
        clearAuthTokenCookies()
      },
      hydrateFromCookies: () => {
        set({
          token: getAccessTokenFromDocument(),
          refreshToken: getRefreshTokenFromDocument(),
        })
      },
    }),
    {
      name: AUTH_USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
