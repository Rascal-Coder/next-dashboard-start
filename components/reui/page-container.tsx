import { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps {
  /** 页面标题 */
  title?: string
  /** 页面描述文本 */
  description?: string
  /** 右侧操作区插槽，如新增按钮 */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * PageContainer：统一页面级布局容器。
 * 提供标准水平内边距、页头区域（标题 + 描述 + 操作插槽）和内容区间距。
 */
export function PageContainer({
  title,
  description,
  action,
  children,
  className,
}: PageContainerProps) {
  const hasHeader = title || description || action

  return (
    <div className={cn("px-4 lg:px-6 space-y-4", className)}>
      {hasHeader && (
        <div className="flex items-center justify-between">
          {(title || description) && (
            <div>
              {title && (
                <h1 className="text-lg font-semibold">{title}</h1>
              )}
              {description && (
                <p className="text-muted-foreground text-xs mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
