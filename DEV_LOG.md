# Simpod 开发日志

## 2026-02-28 开发总结

### 🌟 里程碑
成功将项目从纯前端开发环境迁移至 **Vercel Serverless** 架构，实现了稳定的生产环境部署，并支持了 PWA（渐进式 Web 应用）。

### 🚀 核心功能与架构更新
1.  **混合 API 架构 (Hybrid API Strategy)**
    *   **生产环境**：使用 Vercel Serverless Functions (`api/`) 代理 Podcast Index 搜索请求，彻底解决 CORS 跨域问题。
    *   **本地开发**：保留了基于公共代理 (corsproxy.io) 和 iTunes API 的降级方案，确保本地 `npm run dev` 也能正常运行。
    *   **智能搜索优化**：实现了搜索降级策略。当 Podcast Index (严格匹配) 无结果时，自动切换至 iTunes API (模糊匹配)，修复了 "6minutes" 等关键词搜索失败的问题。

2.  **PWA 支持 (Progressive Web App)**
    *   配置了 `vite-plugin-pwa`。
    *   添加了 `manifest.json` 和应用图标。
    *   支持“添加到主屏幕”，提供原生 App 般的沉浸式体验（无地址栏）。

3.  **UI/UX 优化**
    *   **移动端适配**：移除了遮挡界面的 `vite-plugin-trae-solo-badge`，修复了手机端底部布局变形的问题。
    *   **播放器修复**：解决了波形图和进度条“僵硬”的问题，确保播放状态与 UI 实时同步。
    *   **Vercel 部署**：解决了白屏问题（环境变量配置），并输出了详细的 [部署文档](docs/DEPLOYMENT.md)。

### 🐛 问题修复
*   修复了 Vercel 部署后的中文乱码和 API 请求 500 错误。
*   修复了本地开发环境与 `vite-plugin-vercel` 的冲突。
*   优化了 `User-Agent` 设置，符合 API 提供商的规范。

---
*记录人：Trae AI Assistant*
