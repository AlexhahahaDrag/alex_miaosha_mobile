# 联系人详情 · 信息与隐私 UX 优化设计

日期：2026-07-24  
项目：`alex_miaosha_mobile`  
范围：子项目 1（信息与隐私）— 全量优化中的第一段  
方案：页内改造 + `gift/config.ts` 工具函数（方案 1）

## 1. 背景

`giftPersonDetail` profile 模式存在：手机号/关系在头部与「基本信息」重复；往来历史时间带 ISO `T`；手机号全明文；缺少拨号/复制；备注无折叠。

全量需求已拆为：

1. **本 spec（信息与隐私）**
2. 往来历史分页 /「全部」
3. 视觉与防错（删除弱化、金额徽标、吸底 safe-area）

## 2. 目标

- 消除手机号/关系重复展示（布局 B）
- 手机号默认脱敏，支持显隐
- 一键拨号、复制
- 备注超长折叠
- 往来历史时间可读格式化

## 3. 非目标

- 往来历史分页 /「全部 >」入口
- 删除按钮视觉弱化、吸底按钮、safe-area（已有 `showConfirmDialog`，样式留给子项目 3）
- 金额色块徽标、卡片间距大改
- 编辑/新增表单模式改动（仍明文编辑）
- 新建全局公共组件（`views/components`）

## 4. 信息架构（profile）

### 4.1 头部卡

- 头像字 + 姓名
- 副行：`关系 · 脱敏手机号`（默认 `phoneVisible = false`）
- 同行操作（仅当存在有效手机号时显示）：
  - 眼睛：切换明文/脱敏（Vant 图标 `eye-o` / `closed-eye`，禁止 emoji）
  - 电话：`tel:` 拨号 + `navigator.vibrate?.(50)`
  - 复制：clipboard（失败兜底）+ `showSuccessToast('已复制')` + 触觉

### 4.2 基本信息

- 仅保留「备注」
- 字数 `> 60` 默认折叠，提供「展开/收起」
- 无备注显示 `-`

### 4.3 往来历史（本子项目仅时间）

- `payTime` 使用 `@/utils/dayjs`：`formatTime(payTime, dataTimeFormat)` → `YYYY-MM-DD HH:mm`
- 空值显示 `-`
- 不做分页 /「全部」

## 5. 工具函数（`src/views/finance/gift/config.ts`）

| 函数 | 行为 |
|---|---|
| `maskPhone(phone?: string): string` | 11 位国内号 → `182 **** 2222`；空 → `''`；非 11 位 → 原样返回 |
| `shouldCollapseRemark(text?: string, limit = 60): boolean` | `trim` 后长度 `> limit` 为 true |
| `collapseRemark(text?: string, limit = 60): string` | 折叠时截断并加 `…`（实现细节在 plan 中写死） |

拨号/复制逻辑留在页面方法（依赖浏览器 API），不强制抽到 config。

## 6. data-testid

| 元素 | testid |
|---|---|
| 显隐手机号 | `gift-person-phone-toggle` |
| 拨号 | `gift-person-phone-call` |
| 复制 | `gift-person-phone-copy` |
| 备注展开/收起 | `gift-person-remark-toggle` |

图标按钮需 `aria-label`：`显示手机号` / `隐藏手机号` / `拨打电话` / `复制手机号`。

## 7. 边界

- 无手机号：隐藏三图标，副行只显示关系（或 `关系 · -`）
- 非 11 位手机号：不脱敏；复制仍可用；拨号仍尝试 `tel:`（浏览器/系统决定能否拨出）
- clipboard 不可用：execCommand 兜底；仍失败则 `showFailToast('复制失败')`
- 离开页面再进：`phoneVisible` 重置为 `false`（默认脱敏）

## 8. 测试

- Vitest：`maskPhone`、`shouldCollapseRemark`（及 `collapseRemark` 若导出）写入 `config.spec.ts`
- 无强制 E2E；testid 供后续 Midscene
- 手动：默认脱敏 → 眼睛明文 → 复制 toast → 拨号唤起（真机/模拟器）→ 长备注折叠

## 9. 文档

- 本子项目完成后视需要在 `feature.md` 补一句联系人详情隐私展示行为；不强制改 `.cursorrules`

## 10. 后续子项目（备忘，不在本 spec）

2. 往来历史「全部」+ 分页/无限滚动  
3. 危险按钮弱化、金额徽标、吸底 + `safe-area-inset-bottom`
