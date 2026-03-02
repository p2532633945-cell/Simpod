# Simpod 下午开发规划 (2026-03-02 PM)

## 1. 核心任务：Hotzone 智能增量生成与回溯 (Smart Incremental Generation)

**当前问题**：
目前的幂等性逻辑过于激进，只要 Anchor 落在现有 Hotzone 范围内（含 Buffer）即完全跳过。导致用户在 Hotzone 末尾打点希望扩展内容时，系统未能响应。

**改进目标**：
实现“基于差异的增量转录”。当新锚点产生的区域与现有区域重叠时，**复用已有部分，仅转录新增部分**。

### 1.1 逻辑与算法方案
*   **区间关系判定 (Interval Relation)**：
    *   定义新锚点触发的理论区域：`TargetZone = [Anchor - 10s, Anchor + 10s]`。
    *   与现有 `ExistingZone` 对比：
        *   **完全包含 (Covered)**: `TargetZone ⊆ ExistingZone` → **跳过 (Keep Current Logic)**。
        *   **右侧溢出 (Partial Right)**: `TargetZone.end > ExistingZone.end` 且重叠 → **扩展 (Extend)**。
            *   *Action*: 计算 `Diff = [ExistingZone.end, TargetZone.end]`。
            *   *ASR*: 仅对 `Diff` 进行切片和转录。
            *   *Merge*: `ExistingZone.text + Diff.text`，更新 `ExistingZone.end`。
        *   **左侧溢出 (Partial Left)**: 类似右侧溢出，向左扩展。
        *   **无重叠 (Disjoint)**: 视为全新 Hotzone，完整转录。
*   **状态机更新**：
    *   `PENDING` -> `CALCULATING_DIFF` -> `PARTIAL_ASR` -> `MERGING` -> `FINALIZED`。

### 1.2 数据结构与复用
*   **分离存储**：
    *   **Hotzones (User Layer)**: 用户标记的“关注区”，记录 `start_time`, `end_time`, `metadata`。
    *   **Transcripts (Data Layer)**: 实际的文本片段库，记录 `audio_id`, `start`, `end`, `text`, `words` (JSON)。
*   **映射逻辑**：
    *   一个 Hotzone 可能由多个 Transcript Segments 拼接而成。
    *   下午优先实现：**基于时间戳的动态拼接**（暂不引入复杂的 Segment ID 映射，直接查库拼接）。

### 1.3 前端与可观测性
*   **UI 反馈**：
    *   当发生扩展时，Review Deck 或 Toast 提示：“已复用 15s，新转录 5s”。
    *   Hotzone 列表高亮显示“新增部分”。
*   **日志优化 (Console)**：
    *   废弃单纯的 `[Skipped]`。
    *   新增详细原因：
        *   `[SKIP_FULL_COVER] Anchor at 105s covered by [100-120s]`
        *   `[EXTEND_RIGHT] Anchor at 118s triggers extension. Diff: [120s-128s] (8s)`

---

## 2. 数据源扩展：RSS 与官方文档抓取 (Data Sourcing)

**目标**：
在调用 Groq ASR 之前，穷尽所有可能的免费/官方文本来源。

### 2.1 官方 RSS 解析增强
*   **抓取策略**：
    *   解析 RSS Feed 中的特殊标签：
        *   `<podcast:transcript url="..." type="text/html" />` (Podcast Index 规范)。
        *   `<content:encoded>` (部分 Show Notes 包含全文)。
        *   `<description>` (提取带时间戳的 Show Notes)。
*   **实现步骤**：
    1.  **Parser 升级**: 扩展 `rss-proxy` 或前端解析器，支持 `podcast` 命名空间。
    2.  **Fetcher**: 如果发现 `transcript` URL，由后端 (Supabase Edge Function) 代理获取内容（避开 CORS）。
    3.  **Normalizer**: 将 HTML/SRT/JSON 统一转换为 Simpod 的 `TranscriptSegment[]` 格式。

### 2.2 外部数据源调研 (Research)
*   **Podcast Index API**: 调研免费 API 额度，测试通过 `kilo_id` 或 `feed_url` 查找 Transcript 的命中率。
*   **Spotify/Apple**: 调研是否能通过公开页面抓取（需评估反爬与合规性，优先级较低）。

---

## 3. 下午执行路线图 (Milestones)

1.  **14:00 - 15:30**: **重构 Hotzone 生成逻辑 (后端/Utils)**
    *   实现 `calculateCoverage(anchor, existingZones)` 函数。
    *   实现 `sliceRemoteAudio` 的精确切片（支持 offset）。
    *   完成“扩展右侧”的端到端流程。

2.  **15:30 - 16:30**: **前端交互与日志**
    *   在 Console 输出详细的 Diff 计算日志。
    *   在 UI 上区分显示“复用”和“新增”状态（可选）。

3.  **16:30 - 18:00**: **RSS Transcript 原型**
    *   选取 3-5 个带有 `<podcast:transcript>` 的 RSS 源进行测试。
    *   实现基础的解析器。

---

## 4. 待确认问题
*   **数据库变更**：是否需要立即拆分 `hotzones` 和 `transcripts` 表？（建议：MVP 阶段先在 `hotzones` 的 `metadata` 中存储 `transcript_source` 标记，后续再拆分，减少迁移成本）。
