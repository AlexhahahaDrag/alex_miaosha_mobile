# Mobile 亲友管理（礼尚往来）设计规格

日期：2026-07-20  
范围：`alex_miaosha_mobile` 礼尚往来 · 亲友管理  
参考：PC `alex_miaosha_front` `src/views/finance/gift/person/` + `t_menu_info` 菜单约定

## 1. 目标与范围

### 目标

在移动端补齐与 PC 亲友管理对等的核心能力：业务列表、汇总、关系筛选、新增/编辑/删除、详情档案（含往来历史），并接入 `gift:view/add/edit/delete` 按钮权限。

### 在范围内

- 列表：`business-page` + 搜索 + 关系快捷筛选 + 汇总
- 详情页：档案展示 / 表单新增编辑 / 删除
- API、类型、`usePermission`、`useGiftRelationOptions` 对齐 PC 契约
- `t_menu_info` 隐藏详情菜单与文件路径约定
- 单元测试、checklist、Midscene 用例扩展

### 不在范围内

- 导出数据、批量标签
- 新建独立「表单路由」（不拆 `form` 页，统一走 `giftPersonDetail`）
- 修改后端接口契约（复用已有 finance gift person API）

## 2. 信息架构与路由（对齐 `t_menu_info`）

### 已有菜单

| name         | path                   | component                                  | permission    | hide_in_menu |
| ------------ | ---------------------- | ------------------------------------------ | ------------- | ------------ |
| `giftPerson` | `/finance/gift/person` | `/src/views/finance/gift/person/index.vue` | `gift:person` | `0`          |

### 需新增隐藏菜单

| name               | path                                    | component                                                   | permission    | hide_in_menu |
| ------------------ | --------------------------------------- | ----------------------------------------------------------- | ------------- | ------------ |
| `giftPersonDetail` | `/finance/gift/person/giftPersonDetail` | `/src/views/finance/gift/person/giftPersonDetail/index.vue` | `gift:person` | `1`          |

parent：礼尚往来顶级菜单 `gift`（id `1900000000000001000`），命名与路径遵循现有 mobile 惯例（如 `menuInfoDetail`、`personalGiftDetail`）。

### 页面文件

- `src/views/finance/gift/person/index.vue` — 列表
- `src/views/finance/gift/person/giftPersonDetail/index.vue` — 详情（档案 + 表单）

### 交互

- 无 `id` → 新增表单（需 `gift:add`）
- 有 `id` 默认 → 档案模式（需 `gift:view`）：头像、关系、手机、备注、累计出/入、往来历史
- 档案内「编辑」→ 同页切表单（需 `gift:edit`）
- 删除在详情页，二次确认（需 `gift:delete`）
- 列表卡片点击进详情；NavBar 右上「新增」进详情无 id
- 触觉：卡片点击 / 保存 / 删除触发 `navigator.vibrate?.(50)`

## 3. 数据流 / API / 类型

### API（`src/views/finance/gift/api/index.ts`，对齐 PC）

| 方法                                                      | 路径意图                                    | 用途                   |
| --------------------------------------------------------- | ------------------------------------------- | ---------------------- |
| `getGiftPersonBusinessPage`                               | `POST .../gift-person-info-t/business-page` | 列表（收支、最后往来） |
| `getGiftPersonSummary`                                    | `GET .../summary`                           | 汇总                   |
| `getGiftPersonProfile`                                    | `GET .../profile?id=`                       | 档案 + 往来历史        |
| `getGiftPersonRelationOptions`                            | `GET .../relation-options`                  | 关系预设/自定义        |
| `getGiftPersonDetail`                                     | `GET .../gift-person-info-t?id=`            | 单条（表单回填备用）   |
| `addGiftPerson` / `updateGiftPerson` / `deleteGiftPerson` | POST/PUT/DELETE                             | CRUD                   |

所有 `*Id` / `id` 经 `normalizeGiftIds` 转为 **string**，禁止按 number 处理。

响应统一解构：`const { code, data, message } = await api()`。

### 类型（扩 `src/views/finance/gift/config`）

- `GiftPersonInfo`、`GiftPersonBusinessInfo`、`GiftPersonSummary`
- `GiftPersonProfile`、`GiftPersonQuery`
- 关系选项：`GiftRelationOptionItem`、表单态 `GiftPersonFormState`（含预设/自定义映射）
- 工具：`formatMoney`、`directionText` / `directionLabel`（与记录页一致）

### Composable

- `src/composables/usePermission.ts`：基于 userStore 权限上下文，提供 `hasPermission` / `isSuperAdmin`（对齐 PC）
- `src/composables/useGiftRelationOptions.ts`：`loadRelationOptions`、`relationLabel`、`quickRelations`、`mapRelationToFormFields`、`resolveFilterRelationType`

若 mobile `utils/permission` 缺少 `buildPermissionSet` / `canAccessPermission`，从 PC 侧等价逻辑移植最小集，不改登录协议。

### 数据流

```
列表: loadRelationOptions → summary + business-page(keyword, relationType)
详情: profile(id) → 档案；编辑保存 PUT/POST → 回列表
删除: delete(ids) → 回列表
```

## 4. UI / 权限 / 错误处理

### 列表

- `van-search` + 关系快捷 tag（`quickRelations`）
- 汇总：总联系人、年度往来；待回礼金额提示行
- 卡片：首字头像、姓名、关系 tag、手机、累计出/入、最后往来；`:active { scale(0.98) }`
- `CommonPullRefresh` + `CommonList` + `usePagination`；骨架 + 空态
- NavBar「新增」仅 `gift:add`
- 关键 DOM 挂 `data-testid`（如 `gift-person-list`、`gift-person-card`、`gift-person-add`）

### 详情

- 档案：指标 + 基本信息 + 往来历史
- 表单：姓名\*、手机、关系 Picker（预设 + 自定义输入）、备注
- 底栏按权限显隐：编辑 / 删除 / 保存
- 可交互节点挂 `data-testid`

### 权限矩阵

| 能力     | 权限码                    |
| -------- | ------------------------- |
| 进详情   | `gift:view`               |
| 新增     | `gift:add`                |
| 编辑     | `gift:edit`               |
| 删除     | `gift:delete`             |
| 页面可见 | `gift:person`（菜单已控） |

无权限隐藏按钮；写操作仍以后端鉴权为准。

### 错误与状态

- `code !== '200'` → `showFailToast(message || 默认文案)`
- 删除 `van-dialog` 二次确认
- 保存/删除 `loading` 防重复提交

### 视觉

遵循 `.cursorrules`：卡片圆角 16px、侧边距、浅色低饱和、无 Emoji、SVG 图标优先。

## 5. 测试

| 层        | 内容                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 单元      | `normalizeGiftIds`；关系映射；`hasPermission` 边界                                                                                       |
| 组件/集成 | 列表分页筛选；详情档案/表单切换；无权限按钮隐藏                                                                                          |
| Midscene  | 扩 `tests/midscene/gift/cases/`：进 person → 新增 → 详情 → 编辑 → 删除；`waitForResponse` 等 business-page/profile；try/finally API 清理 |
| Checklist | 新增 `tests/checklists/gift-person-mobile.md`（七点法、状态、权限矩阵、不测理由）                                                        |

Persona：`super_super` / `gift_admin` / `gift_user`（无 edit 时隐藏编辑）。

不测：导出、批量标签、PC 抽屉交互。

## 6. 实现文件清单（预期）

- 修改：`src/views/finance/gift/person/index.vue`
- 新增：`src/views/finance/gift/person/giftPersonDetail/index.vue`
- 修改：`src/views/finance/gift/api/index.ts`、`src/views/finance/gift/config.ts`（或迁入 `config/`）
- 新增：`src/composables/usePermission.ts`、`src/composables/useGiftRelationOptions.ts`
- 视需要：`src/utils/permission` 权限集合工具补齐
- SQL：后端 `alex_miaosha/doc/sql/` 增量脚本插入 `t_menu_info.giftPersonDetail`（parent=`gift` 顶级菜单）
- 测试：`tests/checklists/gift-person-mobile.md`、`tests/midscene/gift/cases/*`
- 文档：`DEVELOPMENT.md` / `feature.md` 亲友管理段落同步；改完后 `npm run graphify:update`

## 7. 成功标准

1. 有 `gift:person` 权限用户可打开列表，搜索/关系筛选/下拉分页正常
2. 汇总数字与 PC 同源 API 一致
3. 完整走通新增 → 详情档案 → 编辑 → 删除，ID 全程 string
4. 无对应按钮权限时 UI 不展示操作入口
5. Midscene smoke 与 checklist 字段覆盖完成；`npm run lint` 通过
