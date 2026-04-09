<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:api-service-rules -->
# API 请求统一放置到 services 目录

所有对后端接口的 HTTP 请求（包括 GET、POST、PUT、DELETE 等）必须封装在 `services/` 目录下的模块文件中，禁止在页面组件或其他非 service 文件中直接调用 `httpRequest` 或任何 fetch/axios 方法。

规范：
- 按业务模块命名，例如 `services/menu.ts`、`services/user.ts`
- 每个 service 文件只导出纯函数，函数负责发起请求并返回结果
- 页面/组件通过导入 service 函数来获取数据，不得绕过 service 层直接请求
<!-- END:api-service-rules -->
