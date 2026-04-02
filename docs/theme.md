# Theme 与 Sidebar 持久化说明

## 目标

将 `theme-customizer` 和 `sidebar` 的配置从组件本地状态迁移到 `zustand`，并通过 `persist` 中间件持久化到 `localStorage`，实现刷新后配置自动恢复。

## 新增依赖

- `zustand`

## 新增 Store

### 1) Sidebar Store

文件：`stores/sidebar-store.ts`

- 持久化 key：`dashboard-sidebar-config`
- 状态：
  - `config.variant`
  - `config.collapsible`
  - `config.side`
- 方法：
  - `updateConfig(partial)`
  - `resetConfig()`

### 2) Theme Customizer Store

文件：`stores/theme-customizer-store.ts`

- 持久化 key：`dashboard-theme-customizer`
- 状态：
  - `activeTab`
  - `selectedTheme`
  - `selectedTweakcnTheme`
  - `selectedRadius`
  - `importedTheme`
- 方法：
  - `setActiveTab`
  - `setSelectedTheme`
  - `setSelectedTweakcnTheme`
  - `setSelectedRadius`
  - `setImportedTheme`
  - `reset`

## 接入点

### Sidebar Context

文件：`contexts/sidebar-context.tsx`

- 将原来的 `useState` 改为读取 `useSidebarStore`
- 对外 API（`config` + `updateConfig`）保持不变，因此现有消费代码无需改动

### Theme Customizer

文件：`components/theme-customizer/index.tsx`

- 将以下本地状态迁移到 `useThemeCustomizerStore`：
  - `activeTab`
  - `selectedTheme`
  - `selectedTweakcnTheme`
  - `selectedRadius`
  - `importedTheme`
- `handleReset` 改为调用：
  - `resetThemeCustomizer()`
  - `resetSidebarConfig()`
- 新增一个副作用，在 `selectedRadius` 变化时重新应用 `--radius`，保证刷新后样式与持久化状态一致

## 初始化位置说明

- `ThemeProvider` 仍在 `app/Provider.tsx` 挂载，负责 light/dark/system 模式。
- `theme-customizer` 与 `sidebar` 的初始化现在由各自的 zustand store 默认值提供：
  - `stores/theme-customizer-store.ts`
  - `stores/sidebar-store.ts`
- 首次进入使用默认值；后续刷新会自动从 `localStorage` 恢复。

## 本地验证建议

1. 运行安装（若尚未安装依赖）：
   - `pnpm install`
2. 启动项目：
   - `pnpm dev`
3. 在 Customizer 中修改 Theme、Radius、Sidebar 配置后刷新页面，确认状态与样式保持一致。
