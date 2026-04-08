"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronRight, Columns2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardTable } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple"
import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnVisibility } from "@/components/reui/data-grid/data-grid-column-visibility"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { Badge } from "@/components/reui/badge"
import { PageContainer } from "@/components/reui/page-container"
import { httpRequest, isSuccess } from "@/lib/http"
import { type MenuItem, type MenuType, MenuFormDialog } from "./menu-form-dialog"

type MenuTreeResponse = {
  list: MenuItem[]
  total: number
}

/** 菜单类型对应的 badge 样式与中文标签 */
const menuTypeConfig: Record<MenuType, { label: string; variant: "primary-light" | "destructive-light" | "warning-light" | "success-light" }> = {
  page:   { label: "页面",   variant: "primary-light" },
  iframe: { label: "iframe", variant: "destructive-light" },
  link:   { label: "链接",   variant: "warning-light" },
  btn:    { label: "按钮",   variant: "success-light" },
}

export default function SettingsUserManagementPage() {
  const [data, setData] = useState<MenuItem[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [isLoading, setIsLoading] = useState(false)

  /** 新增/编辑弹窗状态 */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)

  const openCreate = useCallback(() => {
    setEditItem(null)
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((item: MenuItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }, [])

  /** 加载数据，首次挂载和手动刷新均复用 */
  const loadData = useCallback(() => {
    setIsLoading(true)
    setData([])
    let cancelled = false
    httpRequest
      .get<MenuTreeResponse>("/menu/tree", { hasBtn: true })
      .then((res) => {
        if (cancelled) return
        if (isSuccess(res.code) && res.data) {
          setData(res.data.list)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return loadData()
  }, [loadData])

  const handleRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="菜单名称" />
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center gap-1"
            style={{ paddingLeft: `${row.depth * 20}px` }}
          >
            {row.getCanExpand() ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  row.toggleExpanded()
                }}
                className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded transition-colors"
              >
                <ChevronRight
                  className={`size-4 transition-transform duration-200 ${row.getIsExpanded() ? "rotate-90" : ""}`}
                />
              </button>
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <span className="font-medium">{row.original.meta.title}</span>
          </div>
        ),
        meta: {
          headerTitle: "菜单名称",
          skeleton: <Skeleton className="h-4 w-24" />,
        },
      },
      {
        accessorKey: "menuType",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="菜单类型" />
        ),
        cell: ({ row }) => {
          const config = menuTypeConfig[row.original.menuType]
          return (
            <Badge variant={config.variant}>{config.label}</Badge>
          )
        },
        meta: {
          headerTitle: "菜单类型",
          skeleton: <Skeleton className="h-5 w-12 rounded-sm" />,
        },
      },
      {
        accessorKey: "path",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="路由路径" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.path ?? "--"}
          </span>
        ),
        meta: {
          headerTitle: "路由路径",
          skeleton: <Skeleton className="h-4 w-36" />,
        },
      },
      {
        accessorKey: "permission",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="权限标识" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.auth ?? "--"}
          </span>
        ),
        meta: {
          headerTitle: "权限标识",
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="操作" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-1">
              <RippleButton
                hoverScale={1}
                tapScale={0.95}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: 接入删除确认逻辑
                  console.log("delete menu", item)
                }}
              >
                删除
                <RippleButtonRipples />
              </RippleButton>
              <RippleButton
                hoverScale={1}
                tapScale={0.95}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  openEdit(item)
                }}
              >
                编辑
                <RippleButtonRipples />
              </RippleButton>
              <RippleButton
                hoverScale={1}
                tapScale={0.95}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: 接入详情弹窗逻辑
                  console.log("detail menu", item)
                }}
              >
                详情
                <RippleButtonRipples />
              </RippleButton>
            </div>
          )
        },
        meta: {
          headerTitle: "操作",
          skeleton: (
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-10" />
            </div>
          ),
        },
      },
    ],
    [openEdit]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <PageContainer
      title="菜单管理"
      description="使用内置 data-grid 组件管理系统菜单，可按需接入后端接口。"
      action={
        <div className="flex items-center gap-2">
          <RippleButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={`size-3.5${isLoading ? " animate-spin" : ""}`}
            />
            刷新
            <RippleButtonRipples />
          </RippleButton>
          <RippleButton
            variant="default"
            size="sm"
            onClick={openCreate}
          >
            新增菜单
            <RippleButtonRipples />
          </RippleButton>
        </div>
      }
    >
      <Card className="p-0">
        <CardTable>
          {/* 工具栏：右侧显示列 */}
          <div className="flex items-center justify-end px-4 py-3 border-b">
            <DataGridColumnVisibility
              table={table}
              label="显示列"
              trigger={
                <Button variant="outline" size="sm" type="button">
                  <Columns2 className="size-3.5" />
                  显示列
                </Button>
              }
            />
          </div>
          <DataGrid
            table={table}
            recordCount={data.length}
            isLoading={isLoading}
            loadingMode="skeleton"
            tableLayout={{
              cellBorder: true,
              rowBorder: true,
              headerBackground: true,
              headerBorder: true,
              stripped: false,
              dense: false,
              columnsResizable: false,
              columnsVisibility: true,
              columnsPinnable: true,
              columnsMovable: true,
              headerSticky: true,
              width: "auto",
            }}
            onRowClick={(row) => {
              // TODO: 行点击时可直接进入编辑
              console.log("row click", row)
            }}
          >
            <ScrollArea className="max-h-[calc(100vh-320px)]">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGrid>
        </CardTable>
      </Card>
      <MenuFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        menuList={data}
        onSuccess={handleRefresh}
      />
    </PageContainer>
  )
}
