"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { ProgressProvider } from "@bprogress/next/app";

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * 全局客户端 Provider：用 BProgress 包裹应用，使 `@bprogress/next/app` 的 `useRouter` 与顶部进度条在任意路由（含 not-found）下可用。
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
      <ProgressProvider
        color="var(--primary)"
        options={{ showSpinner: true }}
        shallowRouting
      >
        <SidebarConfigProvider>
          {children}
        </SidebarConfigProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
}
