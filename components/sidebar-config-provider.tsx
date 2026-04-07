"use client"

import * as React from "react"
import { SidebarContext } from "@/contexts/sidebar-context"
import { useSidebarStore } from "@/stores/sidebar-store"

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const config = useSidebarStore((state) => state.config)
  const updateConfig = useSidebarStore((state) => state.updateConfig)

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  )
}
