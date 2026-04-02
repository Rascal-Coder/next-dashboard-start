"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { ImportedTheme } from "@/types/theme-customizer"

interface ThemeCustomizerState {
  activeTab: string
  selectedTheme: string
  selectedTweakcnTheme: string
  selectedRadius: string
  importedTheme: ImportedTheme | null
}

interface ThemeCustomizerStore extends ThemeCustomizerState {
  setActiveTab: (tab: string) => void
  setSelectedTheme: (theme: string) => void
  setSelectedTweakcnTheme: (theme: string) => void
  setSelectedRadius: (radius: string) => void
  setImportedTheme: (theme: ImportedTheme | null) => void
  reset: () => void
}

const defaultThemeCustomizerState: ThemeCustomizerState = {
  activeTab: "theme",
  selectedTheme: "default",
  selectedTweakcnTheme: "",
  selectedRadius: "0.5rem",
  importedTheme: null,
}

export const useThemeCustomizerStore = create<ThemeCustomizerStore>()(
  persist(
    (set) => ({
      ...defaultThemeCustomizerState,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedTheme: (theme) => set({ selectedTheme: theme }),
      setSelectedTweakcnTheme: (theme) => set({ selectedTweakcnTheme: theme }),
      setSelectedRadius: (radius) => set({ selectedRadius: radius }),
      setImportedTheme: (theme) => set({ importedTheme: theme }),
      reset: () => set(defaultThemeCustomizerState),
    }),
    {
      name: "dashboard-theme-customizer",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        selectedTheme: state.selectedTheme,
        selectedTweakcnTheme: state.selectedTweakcnTheme,
        selectedRadius: state.selectedRadius,
        importedTheme: state.importedTheme,
      }),
    }
  )
)
