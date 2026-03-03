# Simpod 修复与改进方案 (2026-03-02 晚间)

## 1. 热区生成位置/内容错乱问题

### 现象分析
用户反馈“在 1 分钟处打点，热区生成在最开头”。
*   **日志证据**：`[RemoteSlice] Fetching 0–2832393 bytes...`。
*   **根本原因**：`sliceRemoteAudio` 在请求远程音频时，可能未正确发送 `Range` 请求头，或者计算出的 Byte Range 总是从 0 开始。如果服务器不支持 Range 请求（返回 200 OK 而非 206 Partial Content），或者代码逻辑有误，导致下载了从头开始的音频。ASR 引擎接收到的是开头片段，自然生成了开头的文本，导致时间戳与内容不匹配。

### 修复方案
1.  **修正切片逻辑 (`src/utils/audioUtils.ts`)**：
    *   检查 `sliceRemoteAudio` 函数，确保根据 `startTime` 和 `bitrate` 正确计算 `Range: bytes=X-Y`。
    *   **强制检查响应状态**：如果服务器返回 200（不支持 Range），需在内存中手动裁剪（虽然效率低，但能保证正确性）。
2.  **ASR 时间戳校准**：
    *   确保传递给 ASR 的音频确实是切片后的。
    *   在 `processAnchorsToHotzones` 中，再次确认 `newStartTime = hz.start_time + relativeStart` 的基准 `hz.start_time` 是切片的起始时间。

## 2. 第二次生成失败 (主键冲突)

### 现象分析
错误：`409 Conflict`, `duplicate key value violates unique constraint "hotzones_pkey"`.
*   **根本原因**：`saveHotzone` 函数目前使用的是 `supabase.from('hotzones').insert()`。
*   **触发场景**：
    *   **场景 A (扩展热区)**：当触发“智能扩展”逻辑时，我们复用了已存在的 `hotzone.id`。再次保存时，`insert` 试图插入已存在的 ID，导致冲突。
    *   **场景 B (重复生成)**：用户未刷新页面再次点击生成，前端可能未清除旧状态，导致重复提交相同 ID。

### 修复方案
1.  **改用 Upsert (`src/lib/api.ts`)**：
    *   将 `saveHotzone` 中的 `.insert()` 改为 `.upsert()`。
    *   Supabase 的 `upsert` 会自动处理：如果 ID 存在则更新，不存在则插入。
2.  **前端状态管理**：
    *   生成前清除临时状态，确保每次操作的原子性。

## 3. RSS 链接搜索失败

### 现象分析
错误：500 (Proxy), 408 (Timeout), 403 (Forbidden)。
*   **根本原因**：
    *   **500**: Vercel Serverless Function (`/api/rss-proxy`) 内部报错，可能是 URL 解码问题或 Fetch 异常未捕获。
    *   **403/408**: 公共代理（corsproxy.io, allorigins）被目标站点（如 Buzzsprout）反爬屏蔽。

### 修复方案
1.  **增强自建 Proxy (`api/rss-proxy.ts`)**：
    *   **错误捕获**：用 `try-catch` 包裹 `fetch`，捕获并返回具体的错误信息（而不是崩成 500）。
    *   **Headers 伪装**：设置更真实的 `User-Agent`（模拟 Chrome/Safari），防止被识别为 Bot。
    *   **超时控制**：增加 `AbortController`，设置合理的超时时间（如 15s）。
2.  **前端降级策略**：
    *   尝试顺序：`自建 Proxy` -> `直连 (尝试 CORS)` -> `前端提示失败`。
    *   对于 Buzzsprout 等已知严格站点，考虑硬编码的特殊处理（如使用特定的 API 端点，如果有）。

---

## 下一步行动计划 (Next Actions)

1.  **Fix API**: 修改 `saveHotzone` 为 `upsert` 模式。
2.  **Fix Audio**: 调试并重写 `sliceRemoteAudio`，确保 Range 请求正确发送及处理。
3.  **Fix Proxy**: 优化 `rss-proxy.ts` 的健壮性。
