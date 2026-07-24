# 联系人详情 · Profile 高颜值视觉重构设计

日期：2026-07-24  
项目：`alex_miaosha_mobile`  
范围：子项目 3（视觉重构，含原「视觉与防错」）  
方案：单文件改造 `giftPersonDetail`（方案 1）

## 1. 背景

隐私/可用性改造后，profile 仍偏「原生卡片堆叠」，缺乏现代移动端个人详情的精致感。历史分页（「全部」）已搁置。本 spec 只做 **profile 模式视觉与信息结构重构**，保留已上线的隐私能力。

## 2. 目标

- Hero 沉浸头图区 + 胶囊操作栏（显隐 / 电话 / 复制）
- Bento 风格累计送礼/收礼
- 往来历史流水卡（图标 + 金额正负强调）
- 主按钮渐变、删除改为弱文字按钮（保留二次确认）
- 全局底色/圆角/轻阴影统一

## 3. 非目标

- 表单（新增/编辑）模式大改版
- 往来历史「全部」入口与分页（子项目 2，搁置）
- 吸底 fixed 操作栏
- Emoji 图标（一律 Vant SVG）
- 抽全局设计系统 / 多页共享组件
- 后端 API 变更

## 4. 信息架构（profile）

### 4.1 Hero

- 顶部浅蓝渐变洗底（与页面底 `#F8FAFC` 衔接）
- 头像字 + 姓名
- 副行：`关系 · 脱敏手机号`（无号：`关系 · -`）
- 有备注时第三行：备注摘要（约 2 行截断）；超长用现有 `remarkExpanded` / `gift-person-remark-toggle` 展开，**不恢复独立「基本信息」卡片**

### 4.2 胶囊操作栏

三键横排（有手机号时显示；无号整栏隐藏）：

| 键 | 图标 | 小字 | testid（保留） |
|---|---|---|---|
| 显隐 | `closed-eye` / `eye-o` | 显隐 | `gift-person-phone-toggle` |
| 电话 | `phone-o` | 电话 | `gift-person-phone-call` |
| 复制 | `records` | 复制 | `gift-person-phone-copy` |

逻辑、toast、`tel:`、clipboard 兜底、默认脱敏均不变。

### 4.3 Bento 金额

| 卡片 | 背景 | 数字色 |
|---|---|---|
| 累计送礼 | `#FFF5F5` | `#E53E3E` |
| 累计收礼 | `#F0FDF4` | `#15803D` |

`¥` 小号，金额加粗；`formatMoney` 复用。

### 4.4 往来历史

- 区块标题「往来历史」，**无「全部 >」**
- 空态文案保留
- 每条：左方向图标圆底（Vant，如 `gift-o`）+ 方向文案；右金额：`RECEIVE` → 绿 `+¥…`；`GIVE`/`RETURN` → 红或深色 `-¥…`；下行时间 `YYYY-MM-DD HH:mm` + 备注

### 4.5 底部操作

- 编辑：全宽圆角蓝渐变 `#2563EB` → `#3B82F6` + 轻蓝阴影；testid `gift-person-edit`
- 删除：居中文字「删除联系人」，中灰或弱红，无红框；testid `gift-person-delete`；`showConfirmDialog` 文案「确认删除该联系人？」

## 5. 视觉 Token（页内 CSS 变量）

```css
--gp-bg: #f8fafc;
--gp-card: #ffffff;
--gp-radius: 20px;
--gp-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
--gp-give-bg: #fff5f5;
--gp-give-fg: #e53e3e;
--gp-recv-bg: #f0fdf4;
--gp-recv-fg: #15803d;
--gp-primary-from: #2563eb;
--gp-primary-to: #3b82f6;
```

圆角统一 `16–20px`；触控目标 ≥36px；`:active { transform: scale(0.98) }` 按项目规范。

## 6. 实现边界

- 仅修改：`src/views/finance/gift/person/giftPersonDetail/index.vue`（必要时极少量 `config.ts` 若抽 `formatSignedMoney` 辅助展示，可选）
- 保留：`box-sizing: border-box` + `min-height: 100%`（避免空滚回归）
- 不改：`layouts/index.vue`、记录/列表页、后端

## 7. 测试与验收

- 隐私回归：默认脱敏、显隐、复制 toast、无 `T` 时间、testid 仍在
- 视觉：Hero / 胶囊 / Bento / 流水卡 / 文字删除对照本 spec
- 无强制新增单测（纯 UI）；改 `src` 后 `graphify:update`
- `feature.md` 补一句 profile 视觉改版说明

## 8. 与前序子项目关系

| 子项目 | 状态 |
|---|---|
| 1 信息与隐私 | 已完成，本轮保留行为 |
| 2 历史分页 /「全部」 | 搁置，本轮不放入口 |
| 3 视觉重构 | **本 spec** |
