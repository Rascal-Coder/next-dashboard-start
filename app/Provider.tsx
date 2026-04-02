"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { tweakcnThemes } from "@/config/theme-data";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { useThemeCustomizerStore } from "@/stores/theme-customizer-store";
import { ProgressProvider } from "@bprogress/next/app";

type ProvidersProps = {
  children: React.ReactNode;
};

/** 根据持久化的 customizer 状态把 CSS 变量写到 document（全站唯一入口；仪表盘里的 ThemeCustomizer 只改 store / 即时操作，不再重复 useEffect）。 */
function GlobalThemeInitializer() {
  const { isDarkMode, applyTheme, applyTweakcnTheme, applyImportedTheme, applyRadius } = useThemeManager();
  const selectedTheme = useThemeCustomizerStore((state) => state.selectedTheme);
  const selectedTweakcnTheme = useThemeCustomizerStore((state) => state.selectedTweakcnTheme);
  const importedTheme = useThemeCustomizerStore((state) => state.importedTheme);
  const selectedRadius = useThemeCustomizerStore((state) => state.selectedRadius);

  useEffect(() => {
    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode);
    } else if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode);
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find((theme) => theme.value === selectedTweakcnTheme)?.preset;
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode);
      }
    }
    applyRadius(selectedRadius);
  }, [
    applyImportedTheme,
    applyRadius,
    applyTheme,
    applyTweakcnTheme,
    isDarkMode,
    importedTheme,
    selectedRadius,
    selectedTheme,
    selectedTweakcnTheme,
  ]);

  return null;
}

/**
 * 全局客户端 Provider：用 BProgress 包裹应用，使 `@bprogress/next/app` 的 `useRouter` 与顶部进度条在任意路由（含 not-found）下可用。
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
      <GlobalThemeInitializer />
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
