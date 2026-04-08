"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react"

import { Card, CardTable } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple"
import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { Badge } from "@/components/reui/badge"
import { PageContainer } from "@/components/reui/page-container"

type MenuType = "page" | "iframe" | "link" | "button"

type MenuItem = {
  id: string
  name: string
  type: MenuType
  path?: string
  permission?: string
  children?: MenuItem[]
}

/** 菜单类型对应的 badge 样式与中文标签 */
const menuTypeConfig: Record<MenuType, { label: string; variant: "primary-light" | "destructive-light" | "warning-light" | "success-light" }> = {
  page:    { label: "页面",  variant: "primary-light" },
  iframe:  { label: "iframe", variant: "destructive-light" },
  link:    { label: "链接",  variant: "warning-light" },
  button:  { label: "按钮",  variant: "success-light" },
}

const mockData: MenuItem[] = [
  {
    id: "1",
    name: "home",
    type: "page",
    path: "/home",
  },
  {
    id: "2",
    name: "link",
    type: "page",
    path: "/link",
    children: [
      { id: "2-1", name: "iframe",   type: "iframe", path: "/link/iframe" },
      { id: "2-2", name: "external", type: "link",   path: "/link/external" },
    ],
  },
  {
    id: "3",
    name: "system",
    type: "page",
    path: "/system",
    children: [
      {
        id: "3-1",
        name: "user",
        type: "page",
        path: "/system/user",
        children: [
          { id: "3-1-1", name: "Add",  type: "button", permission: "user.add" },
          { id: "3-1-2", name: "Edit", type: "button", permission: "user.edit" },
          { id: "3-1-3", name: "Del",  type: "button", permission: "user.del" },
        ],
      },
    ],
  },
]

export default function SettingsUserManagementPage() {
  const [data, setData] = useState<MenuItem[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>(true)
  const [isLoading, setIsLoading] = useState(false)

  /** 加载数据，首次挂载和手动刷新均复用 */
  const loadData = useCallback(() => {
    setIsLoading(true)
    setData([])
    const timer = setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
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
                {row.getIsExpanded() ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
        meta: {
          skeleton: <Skeleton className="h-4 w-24" />,
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="菜单类型" />
        ),
        cell: ({ row }) => {
          const config = menuTypeConfig[row.original.type]
          return (
            <Badge variant={config.variant}>{config.label}</Badge>
          )
        },
        meta: {
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
            {row.original.path ?? ""}
          </span>
        ),
        meta: {
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
            {row.original.permission ?? ""}
          </span>
        ),
        meta: {
          skeleton: <Skeleton className="h-4 w-20" />,
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="操作" />
        ),
        enableSorting: false,
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
                  // TODO: 接入编辑弹窗逻辑
                  console.log("edit menu", item)
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
    []
  )

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: undefined,
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
            onClick={() => {
              // TODO: 接入新增菜单弹窗逻辑
              console.log("create menu")
            }}
          >
            新增菜单
            <RippleButtonRipples />
          </RippleButton>
        </div>
      }
    >
      <Card className="p-0">
        <CardTable>
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
    </PageContainer>
  )
}
