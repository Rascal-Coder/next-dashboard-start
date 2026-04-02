"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { SidebarConfig } from "@/contexts/sidebar-context"

interface SidebarStore {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
  resetConfig: () => void
}

const defaultSidebarConfig: SidebarConfig = {
  variant: "inset",
  collapsible: "offcanvas",
  side: "left",
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      config: defaultSidebarConfig,
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),
      resetConfig: () => set({ config: defaultSidebarConfig }),
    }),
    {
      name: "dashboard-sidebar-config",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ config: state.config }),
    }
  )
)
