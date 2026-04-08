"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { Switch } from "radix-ui"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { httpRequest, isSuccess } from "@/lib/http"

/** 与后端 api/menu 接口返回结构对齐（含扩展字段 isHide） */
export type MenuType = "page" | "iframe" | "link" | "btn"

export type MenuItem = {
  id: number
  parentId: number | null
  name: string | null
  desc: string | null
  sort: number | null
  menuType: MenuType
  path: string | null
  redirect: string | null
  meta: {
    title: string
    layout?: string
    isIframe?: boolean
    icon?: string
    isAffix?: boolean
    isKeepAlive?: boolean
    link?: string
    isHide?: boolean
  }
  auth: string | null
  createTime: string
  updateTime: string | null
  children?: MenuItem[]
}

/** 递归展平树形数据，用于上级菜单选择 */
function flattenTree(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenTree(item.children) : []),
  ])
}

type FormValues = {
  parentId: string
  menuType: MenuType
  title: string
  auth: string
  sort: string
  icon: string
  path: string
  layout: string
  isKeepAlive: boolean
  isAffix: boolean
  isHide: boolean
  link: string
}

const EMPTY_VALUES: FormValues = {
  parentId: "",
  menuType: "page",
  title: "",
  auth: "",
  sort: "",
  icon: "",
  path: "",
  layout: "",
  isKeepAlive: false,
  isAffix: false,
  isHide: false,
  link: "",
}

function itemToValues(item: MenuItem): FormValues {
  return {
    parentId: item.parentId != null ? String(item.parentId) : "",
    menuType: item.menuType,
    title: item.meta.title ?? "",
    auth: item.auth ?? "",
    sort: item.sort != null ? String(item.sort) : "",
    icon: item.meta.icon ?? "",
    path: item.path ?? "",
    layout: item.meta.layout ?? "",
    isKeepAlive: item.meta.isKeepAlive ?? false,
    isAffix: item.meta.isAffix ?? false,
    isHide: item.meta.isHide ?? false,
    link: item.meta.link ?? "",
  }
}

export type MenuFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: MenuItem | null
  menuList: MenuItem[]
  onSuccess: () => void
}

/** 水平行布局 className（标签左对齐、输入右侧弹性填充） */
const ROW_CLS = "flex flex-row items-center gap-3 space-y-0"
const LABEL_CLS = "w-22 shrink-0 text-right font-normal text-muted-foreground"

export function MenuFormDialog({
  open,
  onOpenChange,
  editItem,
  menuList,
  onSuccess,
}: MenuFormDialogProps) {
  const isEdit = !!editItem

  const form = useForm<FormValues>({ defaultValues: EMPTY_VALUES })
  const menuType = form.watch("menuType")

  /** 弹窗打开或编辑对象变化时，重置表单 */
  useEffect(() => {
    if (open) {
      form.reset(editItem ? itemToValues(editItem) : EMPTY_VALUES)
    }
  }, [open, editItem, form])

  /** 展平并过滤非按钮菜单，作为上级菜单备选项 */
  const parentOptions = useMemo(
    () => flattenTree(menuList).filter((m) => m.menuType !== "btn"),
    [menuList]
  )

  const showPageIframe = menuType === "page" || menuType === "iframe"
  const showLink = menuType === "iframe" || menuType === "link"
  const showIcon = showPageIframe || menuType === "link"

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...(isEdit ? { id: editItem!.id } : {}),
      parentId: values.parentId ? Number(values.parentId) : null,
      name: values.title,
      menuType: values.menuType,
      sort: values.sort !== "" ? Number(values.sort) : null,
      path: showPageIframe ? values.path || null : null,
      auth: values.auth || null,
      meta: {
        title: values.title,
        ...(showIcon && values.icon ? { icon: values.icon } : {}),
        ...(showPageIframe
          ? {
              layout: values.layout || undefined,
              isIframe: values.menuType === "iframe",
              isKeepAlive: values.isKeepAlive,
              isAffix: values.isAffix,
              isHide: values.isHide,
            }
          : {}),
        ...(showLink && values.link ? { link: values.link } : {}),
      },
    }

    const res = isEdit
      ? await httpRequest.put("/menu/update", payload)
      : await httpRequest.post("/menu/create", payload)

    if (isSuccess(res.code)) {
      onOpenChange(false)
      onSuccess()
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl top-[25%] translate-y-0">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑" : "新增"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 py-1">
            {/* 菜单类型 Tabs */}
            <FormField
              control={form.control}
              name="menuType"
              render={({ field }) => (
                <FormItem className={ROW_CLS}>
                  <FormLabel className={LABEL_CLS}>菜单类型</FormLabel>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <TabsList>
                      <TabsTrigger value="page">页面</TabsTrigger>
                      <TabsTrigger value="iframe">iframe</TabsTrigger>
                      <TabsTrigger value="link">链接</TabsTrigger>
                      <TabsTrigger value="btn">按钮</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />

            {/* 两列网格字段区域 */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* 上级菜单 */}
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem className={ROW_CLS}>
                    <FormLabel className={LABEL_CLS}>上级菜单</FormLabel>
                    <SelectRoot
                      value={field.value || "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">无（顶级）</SelectItem>
                        {parentOptions.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.meta.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </FormItem>
                )}
              />

              {/* 菜单名称（必填） */}
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "菜单名称为必填项" }}
                render={({ field }) => (
                  <FormItem className={ROW_CLS}>
                    <FormLabel className={LABEL_CLS}>
                      <span className="text-destructive mr-0.5">*</span>菜单名称
                    </FormLabel>
                    <div className="flex-1 space-y-1">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* 权限标识 */}
              <FormField
                control={form.control}
                name="auth"
                render={({ field }) => (
                  <FormItem className={ROW_CLS}>
                    <FormLabel className={LABEL_CLS}>权限标识</FormLabel>
                    <FormControl>
                      <Input className="flex-1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 排序 */}
              <FormField
                control={form.control}
                name="sort"
                render={({ field }) => (
                  <FormItem className={ROW_CLS}>
                    <FormLabel className={LABEL_CLS}>排序</FormLabel>
                    <FormControl>
                      <Input type="number" className="w-24" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 菜单图标（页面 / iframe / 链接） */}
              {showIcon && (
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>菜单图标</FormLabel>
                      <FormControl>
                        <Input className="flex-1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 路由路径（页面 / iframe） */}
              {showPageIframe && (
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>路由路径</FormLabel>
                      <FormControl>
                        <Input className="flex-1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 布局（页面 / iframe） */}
              {showPageIframe && (
                <FormField
                  control={form.control}
                  name="layout"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>布局</FormLabel>
                      <SelectRoot
                        value={field.value || "__default__"}
                        onValueChange={(v) =>
                          field.onChange(v === "__default__" ? "" : v)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__default__">默认</SelectItem>
                          <SelectItem value="full">全屏</SelectItem>
                          <SelectItem value="blank">空白</SelectItem>
                        </SelectContent>
                      </SelectRoot>
                    </FormItem>
                  )}
                />
              )}

              {/* 页面缓存（页面 / iframe） */}
              {showPageIframe && (
                <FormField
                  control={form.control}
                  name="isKeepAlive"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>页面缓存</FormLabel>
                      <FormControl>
                        <Switch.Root
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors focus:outline-none data-[state=checked]:bg-primary"
                        >
                          <Switch.Thumb className="block h-4 w-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5" />
                        </Switch.Root>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 固定Tab（页面 / iframe） */}
              {showPageIframe && (
                <FormField
                  control={form.control}
                  name="isAffix"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>固定Tab</FormLabel>
                      <FormControl>
                        <Switch.Root
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors focus:outline-none data-[state=checked]:bg-primary"
                        >
                          <Switch.Thumb className="block h-4 w-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5" />
                        </Switch.Root>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 是否隐藏（页面 / iframe） */}
              {showPageIframe && (
                <FormField
                  control={form.control}
                  name="isHide"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>是否隐藏</FormLabel>
                      <FormControl>
                        <Switch.Root
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors focus:outline-none data-[state=checked]:bg-primary"
                        >
                          <Switch.Thumb className="block h-4 w-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5" />
                        </Switch.Root>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* 链接地址（iframe / 链接） */}
              {showLink && (
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem className={ROW_CLS}>
                      <FormLabel className={LABEL_CLS}>链接地址</FormLabel>
                      <FormControl>
                        <Input className="flex-1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "提交中..." : "确定"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
