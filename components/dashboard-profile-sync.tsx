"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { httpRequest, isSuccess } from "@/lib/http";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

/** 在 dashboard layout 挂载后拉取 profile 写入 store，并校验 token；无 token / 失效则回登录页 */
export function DashboardProfileSync() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthStore.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      router.replace("/sign-in");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await httpRequest.get<{ user: AuthUser }>("auth/profile", undefined, {
          skipErrorHandler: true,
        });
        if (cancelled) return;
        if (!isSuccess(res.code) || !res.data?.user) {
          throw new Error(res.msg || "获取用户信息失败");
        }
        setUser(res.data.user);
      } catch {
        if (cancelled) return;
        clearSession();
        router.replace("/sign-in");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken, router, setUser, clearSession]);

  return null;
}
