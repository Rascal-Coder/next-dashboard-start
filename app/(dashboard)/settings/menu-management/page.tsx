"use client"

import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { ChevronRight, Columns2, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardTable } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/animate-ui/components/radix/alert-dialog"
import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnVisibility } from "@/components/reui/data-grid/data-grid-column-visibility"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { Badge } from "@/components/reui/badge"
import { PageContainer } from "@/components/reui/page-container"
import { type MenuItem, type MenuType, MENU_QUERY_KEY, fetchMenuTree, deleteMenu } from "@/services/menu"
import { MenuFormDialog } from "./menu-form-dialog"

/** 菜单类型对应的 badge 样式与中文标签 */
const menuTypeConfig: Record<MenuType, { label: string; variant: "primary-light" | "destructive-light" | "warning-light" | "success-light" }> = {
  page: { label: "页面", variant: "primary-light" },
  iframe: { label: "iframe", variant: "destructive-light" },
  link: { label: "链接", variant: "warning-light" },
  btn: { label: "按钮", variant: "success-light" },
}

export default function SettingsMenuManagementPage() {
  "use no memo"
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  /** 新增/编辑弹窗状态 */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  /** 只读详情弹窗状态 */
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  /** 删除确认弹窗状态 */
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)

  const queryClient = useQueryClient()

  /** 使用 TanStack Query 管理菜单树数据 */
  const {
    data = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: fetchMenuTree,
  })

  /** 删除菜单 mutation */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
      setDeleteTarget(null)
    },
  })

  const openCreate = useCallback(() => {
    setEditItem(null)
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((item: MenuItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }, [])

  const openDetail = useCallback((item: MenuItem) => {
    setDetailItem(item)
    setDetailOpen(true)
  }, [])

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
                  setDeleteTarget(item)
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
                  openDetail(item)
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
    [openEdit, openDetail, setDeleteTarget]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
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
            variant="default"
            size="sm"
            onClick={openCreate}
          >
            新增菜单
            <Plus className="size-4" />
            <RippleButtonRipples />
          </RippleButton>
        </div>
      }
    >
      <Card className="p-0">
        <CardTable>
          {/* 工具栏：刷新 + 列显隐 */}
          <div className="flex items-center justify-end px-4 py-3 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mr-2"
            >
              <RefreshCw
                className={`size-3.5${isFetching ? " animate-spin" : ""}`}
              />
              refresh
            </Button>
            <DataGridColumnVisibility
              table={table}
              label="Toggle columns"
              trigger={
                <Button variant="outline" size="sm" type="button">
                  <Columns2 className="size-3.5" />
                  view
                </Button>
              }
            />
          </div>
          <DataGrid
            table={table}
            recordCount={data.length}
            isLoading={isFetching}
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
      />

      {/* 详情弹窗（只读模式） */}
      <MenuFormDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        editItem={detailItem}
        menuList={data}
        readOnly
      />

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除菜单「{deleteTarget?.meta.title}」吗？此操作不可撤销，其子菜单也将一并删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id)
                }
              }}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
