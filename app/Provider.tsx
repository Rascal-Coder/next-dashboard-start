"use client";

import { ProgressProvider } from "@bprogress/next/app";

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * 全局客户端 Provider：用 BProgress 包裹应用，使 `@bprogress/next/app` 的 `useRouter` 与顶部进度条在任意路由（含 not-found）下可用。
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ProgressProvider
      color="var(--foreground)"
      height="3px"
      options={{ showSpinner: true }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
