# Theme & Sidebar Persistence Design Doc

## Purpose
Persist the Dashboard theme customizer state and sidebar layout config across page refreshes by:
1. Storing UI selections in `zustand`.
2. Persisting store state to `localStorage` via `persist` middleware.
3. Applying CSS variables on a single global entry so the UI consistently reflects persisted values after refresh.

## High-Level Data Flow
1. The user edits Theme/Radius/Sidebar options in the `ThemeCustomizer` UI.
2. The UI writes the selections into zustand stores (`stores/theme-customizer-store.ts`, `stores/sidebar-store.ts`).
3. On refresh, the global initializer reads the persisted store values and writes CSS variables into `document.documentElement`.
4. The Dashboard layout reads the persisted sidebar config from context and passes it to the Sidebar component as props.

## Persistent Stores (zustand)

### Sidebar Store
File: `stores/sidebar-store.ts`

Persist name (localStorage key): `dashboard-sidebar-config`

State:
- `config.variant` (one of: `"sidebar" | "floating" | "inset"`)
- `config.collapsible` (one of: `"offcanvas" | "icon" | "none"`)
- `config.side` (one of: `"left" | "right"`)

Actions:
- `updateConfig(partial: Partial<SidebarConfig>)`: shallow merge into `config`
- `resetConfig()`: restore `defaultSidebarConfig`

Default values (used on first load when no persisted state exists):
- `variant: "inset"`
- `collapsible: "offcanvas"`
- `side: "left"`

### Theme Customizer Store
File: `stores/theme-customizer-store.ts`

Persist name (localStorage key): `dashboard-theme-customizer`

State:
- `activeTab`: UI tab selection (`"theme"` / `"layout"`), default `"theme"`
- `selectedTheme`: shadcn theme preset value, default `"default"`
- `selectedTweakcnTheme`: tweakcn theme preset value, default `""`
- `selectedRadius`: radius CSS value string, default `"0.5rem"`
- `importedTheme`: `ImportedTheme | null` (light/dark variable maps)

Actions:
- `setActiveTab(tab: string)`
- `setSelectedTheme(theme: string)`
- `setSelectedTweakcnTheme(theme: string)`
- `setSelectedRadius(radius: string)`
- `setImportedTheme(theme: ImportedTheme | null)`
- `reset()`: restore `defaultThemeCustomizerState`

## ThemeProvider vs Theme Variables

### ThemeProvider (light/dark/system)
File: `components/theme-provider.tsx`

Role:
- Manages the top-level `theme` selection (`"light" | "dark" | "system"`).
- Adds/removes the `light` / `dark` class on `document.documentElement`.
- For `"system"`, it uses `window.matchMedia("(prefers-color-scheme: dark)")`.

Storage:
- Uses `storageKey` prop (in `app/Providers.tsx`, it is `storageKey="nextjs-ui-theme"`).

### CSS Variables for Custom Themes
File: `hooks/use-theme-manager.ts` + global initializer in `app/Providers.tsx`

`ThemeProvider` only switches `light/dark` classes.
All custom theme CSS variables (background/primary/etc) and `--radius` are applied by `useThemeManager()` via DOM writes to `document.documentElement.style`.

## Global Application Entry (single source of truth)
File: `app/Providers.tsx`

Component: `GlobalThemeInitializer`

What it does:
- Reads persisted theme selections from `useThemeCustomizerStore`.
- Reads `isDarkMode` from `useThemeManager()` (it follows the ThemeProvider theme and system preference).
- In a `useEffect`, it applies exactly one of:
  - `importedTheme` (if `importedTheme` is not null)
  - `selectedTheme` (shadcn preset)
  - `selectedTweakcnTheme` (tweakcn preset)
- It always calls `applyRadius(selectedRadius)` to keep `--radius` in sync.

Important behavior:
- The initializer ensures refresh correctness because the CSS-variable writes are performed at app startup (not only in the ThemeCustomizer component).

## Theme Application Engine
File: `hooks/use-theme-manager.ts`

Key functions:
- `resetTheme()`
  - Removes a predefined set of candidate CSS variables from `document.documentElement` (including shadcn/ui vars, chart vars, sidebar vars, fonts, shadows, spacing, etc).
  - Also removes any inline CSS variables found in `root.style`.
  - This is the cleanup step before applying any theme preset/import.
- `applyTheme(themeValue: string, darkMode: boolean)`
  - Finds the preset from `colorThemes` (`config/theme-data.ts`).
  - Calls `resetTheme()`.
  - Writes each preset style entry as `--{key}` into `document.documentElement`.
  - Updates brand-color inputs by mapping `baseColors` to the applied theme values.
- `applyTweakcnTheme(themePreset: ThemePreset, darkMode: boolean)`
  - Same concept as `applyTheme`, but uses the tweakcn preset object.
- `applyImportedTheme(themeData: ImportedTheme, darkMode: boolean)`
  - Applies `themeData.light` or `themeData.dark` by writing `--{variable}` for each entry.
  - Updates brand-color inputs based on `baseColors`.
- `applyRadius(radius: string)`
  - Sets `document.documentElement.style.setProperty("--radius", radius)`.

## ThemeCustomizer UI (writes store + triggers immediate apply)
File: `components/theme-customizer/index.tsx`

Responsibilities:
1. Binds UI controls to `useThemeCustomizerStore` values and store actions.
2. Uses `useThemeManager()` to apply effects immediately when the user changes settings (so the UI reacts without waiting for refresh).
3. Provides a reset action that restores both theme CSS variables and sidebar config.

Reset behavior in the UI:
- `resetThemeCustomizer()` clears the zustand theme selections.
- `setBrandColorsValues({})` clears brand-color UI state.
- `resetTheme()` removes custom CSS variables via the engine.
- `applyRadius("0.5rem")` restores default radius.
- `resetSidebarConfig()` restores default sidebar layout config.

Import behavior:
- When a user imports a theme, the UI sets `importedTheme` and clears `selectedTheme` and `selectedTweakcnTheme` so the imported theme becomes the active source.
- It then calls `applyImportedTheme(importedTheme, isDarkMode)`.

## Import Theme JSON/CSS Structure Contract
File: `components/theme-customizer/import-modal.tsx`

Input expectation (paste CSS text):
- The text must include:
  - a `:root { ... }` section for light mode
  - a `.dark { ... }` section for dark mode
- CSS variable syntax is expected as:
  - `--<variable-name>: <value>;`

Parsing rule (implementation detail):
- The parser strips comments `/* ... */`.
- It extracts variables under `:root` into `ImportedTheme.light`.
- It extracts variables under `.dark` into `ImportedTheme.dark`.
- The stored keys are the variable names without the leading `--`.

Application rule:
- `useThemeManager.applyImportedTheme()` writes `--{variable}` into the DOM for each parsed entry.

## Sidebar Persistence & Rendering

### Context Provider
File: `components/sidebar-config-provider.tsx`

Responsibilities:
- Reads `config` and `updateConfig` from `useSidebarStore`.
- Exposes them via `SidebarContext.Provider`.

### Where layout config is consumed
File: `app/(dashboard)/layout.tsx`

Responsibilities:
- Reads `config` from `useSidebarConfig()`.
- Passes the config into the Sidebar component as props:
  - `variant={config.variant}`
  - `collapsible={config.collapsible}`
  - `side={config.side}`
- Chooses layout structure based on `config.side`.
- Applies an extra class when `config.collapsible === "none"`: `sidebar-none-mode`.

### Additional UI usage
File: `components/site-footer.tsx`

- Uses `sidebarConfig.variant` to compute some class-based style (example: footer border radius for `"inset"`).

## ThemeCustomizer Layout Tab (writes sidebar config)
File: `components/theme-customizer/layout-tab.tsx`

Responsibilities:
- Provides UI controls for:
  - sidebar `variant`
  - sidebar `collapsible`
  - sidebar `side`
- Writes changes by calling `updateConfig({ variant/collapsible/side })`.

## What to Verify Locally

1. Run `pnpm install`
2. Run `pnpm dev`
3. Change:

   - Theme preset (shadcn)
   - Tweakcn preset
   - Radius
   - Sidebar variant/collapsible/side
4. Refresh the page and verify:

   - Theme CSS variables and `--radius` remain consistent with the persisted selections.
   - Sidebar layout config remains consistent with persisted selections.