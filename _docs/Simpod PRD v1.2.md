# Simpod PRD v1.2 - 智能泛听引擎

## 1. 背景与核心理念 (Core Philosophy)
Simpod 聚焦在英语泛听与播客学习场景，核心理念为 **"Flow Priority" (心流优先)** 和 **"Batch Processing" (批量处理)**。
我们致力于将传统学习中“听-停-查-记-听”的破碎流程，重构为 **"纯粹盲听 (标记) -> 智能热区 (生成) -> 批量复盘 (学习)"** 的现代化闭环。

### 1.1 达成指标 (KPIs)
*   **体验指标**: 主流程（盲听阶段）平均无干扰率 > 95%。
*   **成本指标**: 通过端侧算力 (Local AI) 将单用户运营成本降低 80% 以上。
*   **内容指标**: 支持主流 RSS 播客源直接订阅与解析，并支持全文 Transcript 的分层加载。

---

## 2. 核心场景 (User Stories)

### 2.1 盲听插锚 (Blind Marking)
*   **场景**: 用户在通勤/运动时，通过耳机线控（下一首键）或屏幕盲操，对听不懂的片段进行“无打断打点”。
*   **关键**: 此时**不**进行任何文本展示或查词，保护听力心流。

### 2.2 智能热区与批量复盘 (Hotzones & Batch Review)
*   **场景**: 听力结束后，用户点击“生成热区”。系统自动根据锚点截取片段，并转写出精确的文本。
*   **视觉 - 无限流上下文 (Infinite Context Stream)** **[Updated in v1.2]**:
    *   **问题**: 仅转写热区片段会导致用户想看上下文时“断片”。
    *   **方案**: 
        *   **Local First**: 优先在本地生成当前热区的文本。
        *   **On-Demand Fetch**: 当用户在 Review Deck 中向上/下滑动超出热区范围时，自动触发临近片段的转写（或加载已有的全文），实现“无缝衔接”。
        *   **Full Transcript Overlay**: 对于热门节目，若后台已存在全文 Transcript，Review Deck 将直接映射到全文的对应位置，允许用户在“聚焦模式”与“全文模式”间平滑切换。

### 2.3 播客订阅 (RSS Podcast Aggregator)
*   **场景**: 用户无需手动上传文件，直接输入 RSS Feed 或搜索热门播客。
*   **功能**:
    *   解析 RSS XML，展示节目列表。
    *   支持流式播放 (Stream) 与离线缓存 (Cache)。

### 2.4 AI 播客助手 (AI Podcast Assistant) **[New in v1.2]**
*   **场景**: 针对长难播客，单纯的转写不足以解决理解障碍。
*   **功能**:
    *   **同义替换 (Simplify)**: 用户选中难句，AI 生成同义的简单句。
    *   **智能回溯 (Smart Rewind)**: 语音唤醒“刚才那句没听清”，AI 自动定位上一完整句并慢速重放。
    *   **互动问答 (Chat)**: 基于全文内容回答用户关于剧情或观点的提问。

---

## 3. 技术架构策略 (Technical Strategy)

### 3.1 混合 AI 转写引擎 (Hybrid Transcription Engine)
为了平衡用户体验（速度）与运营成本（API费用），采用 **"Cloud-Edge Hybrid"** 策略：

1.  **Cloud Mode (Groq Whisper)**: 适用于 MVP、低性能设备。按需计费。
2.  **Edge Mode (Local WebGPU/WASM)**: 
    *   **策略升级**: 
        *   **Hotzone First**: 优先利用本地算力快速转写用户标记的“热区片段”（几秒钟）。
        *   **Background Full-Text**: 在用户听的过程中（或 WiFi 闲置时），后台静默转写全文。这样当用户复盘时，全文已经准备好了。

### 3.2 数据分层 (Data Layering)
*   **Layer 1 (Anchor)**: 仅时间戳。
*   **Layer 2 (Hotzone Text)**: 锚点周边的精确转写。
*   **Layer 3 (Full Transcript)**: 整个音频的文本。
    *   对于热门节目，Layer 3 数据可以众包共享（一次转写，全员可用）。
    *   对于冷门/个人节目，Layer 3 由用户本地算力按需生成。

---

## 4. 功能模块规划 (Roadmap)

### Phase 1: MVP Core (已完成)
*   [x] 音频引擎 (useAudioEngine)
*   [x] 盲听插锚逻辑
*   [x] 基础热区生成 (Groq Cloud)
*   [x] 复盘 UI (Review Deck)

### Phase 2: Content & Context (进行中)
*   [ ] **RSS 播客订阅**: 实现 RSS 解析与播放列表。
*   [ ] **无限流上下文**: 改造 Review Deck，支持“下拉加载更多文本”（基于按需转写或全文索引）。
*   [ ] **Hybrid AI 基础**: 引入 `Transformers.js`。

### Phase 3: AI Assistant & Social
*   [ ] **AI 辅助理解**: 选词解释、长难句简化。
*   [ ] **全文共享机制**: 热门节目转写共享。
*   [ ] 用户账户体系 (Supabase Auth)。

---

## 5. UI/UX 规范更新
*   **交互**: Review Deck 增加“展开全文”手势。
*   **视觉**: 区分“已验证文本”（AI生成）与“未生成区域”（波形占位）。
