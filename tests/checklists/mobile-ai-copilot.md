# 📱 移动端 AI 记账悬浮球与流式多阶段打字机抽屉测试 Checklist

> **关联项目**：`alex_miaosha_mobile`（移动端 Vue3 + Vant4）  
> **关联文档**：`TESTING_STANDARD.md`、`01-Standards/移动端开发规则与适配规约.md`  
> **最后更新**：2026-10-20  
> **维护责任**：移动端研发组 / AI 测试组

---

## 0. 元信息

| 项 | 内容 |
| :--- | :--- |
| **涵盖组件** | 1. **悬浮入口球**：`src/views/finance/financeManager/components/MobileAiFloatingBubble.vue`<br>2. **流式打字机抽屉**：`src/views/finance/financeManager/components/FinanceAiSheet.vue`<br>3. **主页集成点**：`src/views/finance/financeManager/index.vue`<br>4. **API 与类型**：`src/views/finance/financeManager/api/index.ts`、`config/index.ts` |
| **适配视口** | 390×844（iPhone 12/13/14 标准视口），兼容 360px~430px 屏幕宽度与底部安全区（`safe-area-inset-bottom`） |
| **测试分层配比** | 单元测试 (55%) + 集成契约测试 (25%) + AI/E2E 流程测试 (20%) |
| **核心触控与动效** | 垂直方向拖拽吸附（`touchstart/touchmove/touchend`）、呼吸光晕环、流式打字机逐字渲染、呼吸光标（`.typing-cursor`）、轻柔触觉震动（`navigator.vibrate` / `triggerHaptic`） |
| **关键基础设施** | `parseUniversalFinanceLedgerStream`（SSE 泛型穿透） + `triggerHaptic` + `Long2StringSerializer`（雪花 ID 精度护城河） |

---

## 1. 核心业务规则与高价值测试目标

| # | 领域 | 规则与漏洞描述 | 必测 Case | 期望结果 |
| :--- | :--- | :--- | :--- | :--- |
| **AI-M-P0-1** | 悬浮球挂载与交互 | 主页右下角需渲染 AI 悬浮球，支持点击展开抽屉与触发轻触觉反馈。 | `test_mobile_ai_floating_bubble_mount_and_click` | 正确渲染 `data-testid="mobile-btn-ai-floating-bubble"`，点击派发 `click` 事件。 |
| **AI-M-P0-2** | 垂直拖拽边界约束 | 移动端悬浮球垂直拖拽时，坐标不能超出屏幕上下边界，松手后自动贴靠最近边缘（吸附效果）。 | `test_bubble_drag_boundary_clamp` | Top 坐标严格限制在安全区域内 `[60px, windowHeight - 120px]`。 |
| **AI-M-P0-3** | 流式阶段状态机演进 | 流式连接经历 `SCENE_ANALYSIS` -> `FIELD_EXTRACTION` -> `CATEGORY_MATCHING` -> `COMPLETE` 四阶段，进度条与阶段文案实时跟随。 | `test_stream_stage_transition_and_progress` | 阶段推进依次为 10% -> 35% -> 70% -> 100%，UI 呈现对应的阶段文字。 |
| **AI-M-P0-4** | 逐字流式打字机效果 | 大模型吐字时，文本应逐字/逐块追加，并附带动态打字机呼吸光标，流式结束时光标自动隐藏。 | `test_typewriter_chunk_accumulation_and_cursor` | 文字正确累加，`[DONE]` 或 `COMPLETE` 阶段时光标消失。 |
| **AI-M-P0-5** | 触觉反馈副作用节流 | 阶段跃迁与最终完成时触发震动（`light` / `success`），文本逐字输出时必须做节流（Throttled），防止物理马达频繁振动发热。 | `test_haptic_feedback_on_stage_change` | 关键节点触发轻微触觉反馈，不频繁死循环。 |
| **AI-M-P0-6** | 雪花 ID 精度安全防御 | AI 解析出的储值卡 ID（`prepaidCardId`）、归属人 ID（`belongTo`）必须强制转换为 `string` 类型，杜绝 JS Number 截断。 | `test_ai_parse_vo_id_safety_and_mapping` | ID 字段均为 `string` 类型，金额保持 `number`。 |
| **AI-M-P0-7** | 网络异常与优雅降级 | 当 SSE 流式连接中断或后端报错时，自动无缝降级走同步解析接口，不出现白屏或死锁。 | `test_stream_fallback_to_sync_on_failure` | 优雅展示提示并切换至兜底卡片。 |

---

## 2. 字段边界（七点法）与异常处理

| 字段 / 场景 | 极小值/空值 | 典型正常值 | 极大值/超长 | 格式边界/非法字符 | 预期处理 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **用户记账输入文本** | 空字符串 `""`、全空格 `"   "` | `"昨天午饭微信付了35元"` | 500+ 字超长小票文本 | 纯特殊标点 `!@#$%^&*`、包含 emoji 🍕🍔 | 空值前置禁用提交按钮；超长文本按限制截断并滚动展示；特殊字符与 emoji 正常透传解析。 |
| **解析金额** | `0.00` | `35.00`、`128.50` | `99999999.99` | 负数 `-50`、非数字 `"NaN"` | 金额必须强制为正数；解析异常时默认为 `0.00`。 |
| **小票明细条目** | 0 件商品（空数组 `[]`） | 1~5 件常规商品 | 50+ 件超长商超小票 | 单价为 0、数量为小数 | 空明细不渲染清单模块；超长清单支持内部垂直平滑滚动；字段均有防御默认值。 |

---

## 3. 状态机流转矩阵 (State Machine Transitions)

```
[IDLE (静止/等待)]
    │
    ▼ (点击「开始 AI 智能解析」)
[CONNECTING (建立流式连接, progress: 10%)]
    │
    ▼ (接收到 SCENE_ANALYSIS)
[ANALYZING (分析流水语境, progress: 35%)]
    │
    ▼ (接收到 FIELD_EXTRACTION & 思考链打字机)
[EXTRACTING (提取关键字段与思考, progress: 70%)]
    │
    ▼ (接收到 CATEGORY_MATCHING)
[MATCHING (智能匹配财务分类, progress: 90%)]
    │
    ▼ (接收到 COMPLETE / 终态结构体)
[PREVIEW (完成解析, 呈现卡片预览, progress: 100%)]
    │
    ├─► 点击「一键填入并保存账目」 ──► [APPLIED (回填跳转)]
    └─► 点击抽屉关闭 ───────────────► [RESET (重置回 IDLE)]
```

---

## 4. 触觉副作用与性能安全矩阵

1. **触觉震动策略**：
   - 打开悬浮球：`triggerHaptic('light')` (10ms)；
   - 快捷示例标签点击：`triggerHaptic('light')` (10ms)；
   - 阶段转换（`onStage`）：`triggerHaptic('light')`；
   - 解析完成（`onComplete`）：`triggerHaptic('success')`；
   - 异常告警：`triggerHaptic('error')`；
2. **内存与防抖**：
   - 抽屉关闭时自动 abort 正在进行的 `fetch` 流式请求，释放 `TextDecoder` 与 reader 资源；
   - 悬浮球拖拽采用 `requestAnimationFrame` 驱动位置更新，避免频繁 reflow。

---

## 5. 不测理由清单 (What We Do NOT Test)

1. **浏览器底层 `ReadableStream` 的内存分片算法**：由浏览器引擎原生保障，测试重点关注应用层 `onStage`/`onComplete` 回调解析逻辑；
2. **手机硬件振动马达的实际物理振动强弱与音频共振**：通过 Vitest mock / Midscene `installHapticProbe` 拦截 `navigator.vibrate` 记录与断言调用参数；
3. **第三方大模型 DeepSeek API 的真实外网延迟**：单元测试与 CI 采用标准 Mock SSE 帧与结构体进行闭环验证。
