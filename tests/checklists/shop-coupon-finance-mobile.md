# 📱 移动端垂直业务领域（消费券/储值卡/日常记账/商品）测试 Checklist

> **关联项目**：`alex_miaosha_mobile`（移动端 Vue3 + Vant4）  
> **关联文档**：`TESTING_STANDARD.md`、`01-Standards/移动端开发规则与适配规约.md`  
> **最后更新**：2026-10-19  
> **维护责任**：移动端研发组 / 测试组

---

## 0. 元信息

| 项 | 内容 |
| :--- | :--- |
| **涵盖模块** | 1. **消费券**：`src/views/cpn-coupon/cpn-coupon-info`、`src/views/cpn-coupon/cpn-user-coupon-info`<br>2. **储值卡**：`src/views/selfFinance/prepaidCardInfoT`<br>3. **日常记账与预算**：`src/views/finance/financeManager`、`budgetManage`<br>4. **商品与库存**：`src/views/finance/shopProduct`、`shopStock` |
| **适配视口** | 390×844 (iPhone 12/13/14 标准视口)，支持安全区与暗黑模式 |
| **核心触控与动效** | 触觉震动反馈（`navigator.vibrate` / `installHapticProbe` 拦截校验）、滑动卡片（`van-swipe`）、底部动作面板（`van-action-sheet`）、数字键盘（`van-number-keyboard`） |
| **关键基础设施** | `@alex_miaosha_mobile/src/utils/dayjs` + `getBalanceParts`（大字号金额拆分） + `Long2StringSerializer`（雪花 ID 精度防御） |

---

## 1. 核心业务规则与高价值测试目标

| # | 领域 | 规则与漏洞描述 | 必测 Case | 期望结果 |
| :--- | :--- | :--- | :--- | :--- |
| **M-P0-1** | 雪花 ID 精度安全 | 移动端网络层或视图层若将后端传递的 Long 主键转为 JS `number`，低位数字将丢失（例如 `18293019283019283` 会变成 `18293019283019200`）。 | `normalizeMobileIds_should_convert_all_ids_to_string` | 所有 `id` / `*Id` 字段严格保持 `string` 类型，零精度损耗。 |
| **M-P1-1** | 金额拆分健壮性 | 移动端 Hero 卡片金额展示（如储值卡、记账汇总）需拆分整数（大字号 32px）与小数（小字号 18px）。`getBalanceParts` 必须防御负数、千分位逗号、带货币符号 `￥` 及非法非数字输入。 | `getBalanceParts_should_parse_integers_and_decimals_safely` | 返回 `{ integer: string, decimal: string }`，异常值兜底为 `0` 与 `.00`。 |
| **M-P1-2** | 消费券表单必填校验 | 移动端发券/领券表单必须校验券名、发行总数量（正整数）、面值（大于 0）与截止日期必填。 | `test_coupon_rules_ref_validation` | 空值触发对应中文提示，不合法数量前置拦截。 |
| **M-P1-3** | 储值卡视觉映射 | 储值卡网格墙根据卡片索引循环赋予品牌色系（`getCardColor` 6 色调色板），并根据商户品牌名准确匹配对应 SVG 图标资源（`typeIconMap`）。 | `test_prepaid_card_color_and_icon_mapping` | 索引循环计算准确，未匹配图标采用默认保底。 |
| **M-P1-4** | 记账支付渠道字典 | 移动端九宫格记账键盘支付方式必须与后端 `fromSourceTransferList`（现金、银行卡、微信、支付宝、美团、花呗、白条等 13 项）一一对齐。 | `test_from_source_transfer_list_integrity` | 选项完整无遗漏，支持中英双向映射。 |
| **M-P1-5** | 预算超支算力推导 | 移动端预算卡片需动态计算实际支出占预算总额的百分比，超出 100% 时触发红色超支预警徽标与触觉震动提示。 | `calc_budget_usage_and_overbudget_warning` | 正确计算使用率并标定 `isOverBudget` 状态。 |

---

## 2. 字段边界与异常处理

1. **金额输入边界（数字键盘）**：
   - 允许一位小数点且最多两位小数；
   - 拦截连续输入两个小数点（如 `12..5`）；
   - 拦截以多个 0 开头（如 `008`）；
2. **日期选择器边界（`van-date-picker` / `van-time-picker`）**：
   - 有效期截止日期不得早于开始日期；
   - 格式化输出必须严格走 `@alex_miaosha_mobile/src/utils/dayjs` 预设 Formatter；
3. **触觉震动边界**：
   - 非触屏设备或不支持震动的设备上降级静默，不抛异常崩溃。

---

## 3. 不测理由清单 (What We Do NOT Test)

1. **Vant 内部底层动画与手势阻尼计算**：如 `van-swipe` 的松手回弹微动效、`van-popup` 的贝塞尔缓动曲线；
2. **手机硬件物理振动器硬件频率**：重点通过 `installHapticProbe` 拦截验证调用次数与 pattern，不测硬件级振幅；
3. **操作系统级虚拟键盘弹出高度**：软键盘弹起由各移动端 WebView 原生控制，主要通过 CSS `safe-area-inset-bottom` 规避遮挡。
