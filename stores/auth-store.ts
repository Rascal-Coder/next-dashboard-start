"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { AuthUser } from "@/types/auth"

export type { AuthUser }

export const AUTH_STORAGE_KEY = "dashboard-auth"

type AuthStore = {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
  user: AuthUser | null
  setTokens: (tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }) => void
  setUser: (user: AuthUser | null) => void
  clearSession: () => void
}

const emptySession = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  user: null,
} as const

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...emptySession,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ ...emptySession }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        user: state.user,
      }),
    },
  ),
)
