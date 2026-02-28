# Simpod PRD v1.1 - 智能泛听引擎

## 1. 背景与核心理念 (Core Philosophy)
Simpod 聚焦在英语泛听与播客学习场景，核心理念为 **"Flow Priority" (心流优先)** 和 **"Batch Processing" (批量处理)**。
我们致力于将传统学习中“听-停-查-记-听”的破碎流程，重构为 **"纯粹盲听 (标记) -> 智能热区 (生成) -> 批量复盘 (学习)"** 的现代化闭环。

### 1.1 达成指标 (KPIs)
*   **体验指标**: 主流程（盲听阶段）平均无干扰率 > 95%。
*   **成本指标**: 通过端侧算力 (Local AI) 将单用户运营成本降低 80% 以上。
*   **内容指标**: 支持主流 RSS 播客源直接订阅与解析。

---

## 2. 核心场景 (User Stories)

### 2.1 盲听插锚 (Blind Marking)
*   **场景**: 用户在通勤/运动时，通过耳机线控（下一首键）或屏幕盲操，对听不懂的片段进行“无打断打点”。
*   **关键**: 此时**不**进行任何文本展示或查词，保护听力心流。

### 2.2 智能热区与批量复盘 (Hotzones & Batch Review)
*   **场景**: 听力结束后，用户点击“生成热区”。系统自动根据锚点截取片段，并转写出精确的文本。
*   **交互**: 用户在“Review Deck”中像刷卡片一样，逐个攻克难点。
*   **视觉**: "Spotlight View" —— 仅高亮当前难句，上下文虚化，减少认知负荷。

### 2.3 播客订阅 (RSS Podcast Aggregator) **[New in v1.1]**
*   **场景**: 用户无需手动上传文件，直接输入 RSS Feed 或搜索热门播客（如 6 Minute English, This American Life）。
*   **功能**:
    *   解析 RSS XML，展示节目列表。
    *   支持流式播放 (Stream) 与离线缓存 (Cache)。
    *   对流式音频同样支持“时间轴插锚”与“事后切片转写”。

---

## 3. 技术架构策略 (Technical Strategy)

### 3.1 混合 AI 转写引擎 (Hybrid Transcription Engine) **[New in v1.1]**
为了平衡用户体验（速度）与运营成本（API费用），采用 **"Cloud-Edge Hybrid"** 策略：

1.  **Cloud Mode (Groq Whisper)**:
    *   **适用**: MVP 阶段、低性能设备、用户未下载本地模型时。
    *   **优势**: 速度极快 (LPU 推理)，无需下载大模型。
    *   **成本**: 按 Token/Audio 秒数计费（需持续监控）。

2.  **Edge Mode (Local WebGPU/WASM)**:
    *   **适用**: 高性能 PC/手机、WiFi 环境、高频重度用户。
    *   **技术**: 使用 `Transformers.js` 或 `Whisper.wasm` 在浏览器端直接运行 Whisper Tiny/Base 模型。
    *   **优势**: **零 API 成本**，隐私保护，离线可用。
    *   **策略**: 默认推荐用户在 WiFi 下预加载模型 (Preload)，优先使用本地算力；本地失败或过慢时降级回 Cloud。

### 3.2 播客解析层
*   **RSS Parser**: 需处理跨域问题 (CORS)。方案：使用 Serverless Function (Supabase Edge Functions) 作为代理，或使用公开的 RSS-to-JSON 服务。

---

## 4. 功能模块规划 (Roadmap)

### Phase 1: MVP Core (已完成)
*   [x] 音频引擎 (useAudioEngine)
*   [x] 盲听插锚逻辑
*   [x] 基础热区生成 (Groq Cloud)
*   [x] 复盘 UI (Review Deck)

### Phase 2: Content & Cost (进行中)
*   [ ] **RSS 播客订阅**: 实现 RSS 解析与播放列表。
*   [ ] **Hybrid AI 基础**: 调研并引入 `Transformers.js`，实现本地 Whisper 的 Hello World。
*   [ ] **PWA 增强**: Service Worker 缓存策略，确保离线也能打开 App 并使用本地 AI。

### Phase 3: Social & Data
*   [ ] 用户账户体系 (Supabase Auth)
*   [ ] 学习数据统计与热力图

---

## 5. UI/UX 规范更新
*   **新增**: "AI Mode" 切换开关（Cloud / Local）。
*   **新增**: "Library" 底部导航栏，用于管理 RSS 订阅。
