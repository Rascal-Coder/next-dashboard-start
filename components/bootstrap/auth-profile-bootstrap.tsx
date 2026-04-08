"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { fetchAuthProfile } from "@/services/auth-profile"
import { useAuthStore } from "@/stores/auth-store"

/**
 * 在受保护布局内：有 access token 时拉取 `/auth/profile` 并写入 `useAuthStore`。
 * queryKey 含 token，避免换账号登录时误用旧缓存。
 */
export function AuthProfileBootstrap() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)

  const { data } = useQuery({
    queryKey: ["auth", "profile", token],
    queryFn: fetchAuthProfile,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!token || !data) return
    setUser(data)
  }, [token, data, setUser])

  return null
}
