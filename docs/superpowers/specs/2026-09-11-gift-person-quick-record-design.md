# 亲友详情「记一笔」跳转（P1 最短路径）

日期：2026-09-11  
分支：`develop-1.0-feature-org-manage`  
项目：`alex_miaosha_mobile`  
约束：Ponytail full — 跳转预填，不内嵌记单弹层

## 1. 目标

在亲友 **详情 profile** 增加「记一笔」入口：有 `gift:add` 时可见；点击跳转记账页并打开快速记礼，预填当前联系人。

## 2. 非目标

- 列表卡左滑/行内完整记单弹层
- 新建 giftRecordDetail 页
- 改 PC
- relationGrade / 筛选 / 摘要四卡

## 3. 行为

**入口（仅 profile）**

- 按钮文案「记一笔」，`data-testid="gift-person-quick-record"`
- 放在「编辑资料」上方或同区次要主按钮（视觉次于编辑亦可；plan 锁：编辑上方、同宽 block）
- 权限：`gift:add`；无权限不渲染
- haptic `navigator.vibrate?.(50)`

**跳转**

```
path = getRoutePathByName(router, GIFT_RECORD_NAME, '/finance/gift/record')
query = { open: 'create', personId: String(personId) }
```

记账页默认方向为 **GIVE**（现网 `openQuickRecord`）：预填 **`receiverPersonId = personId`**（给这位亲友随礼）。不传 `direction` query。

**记账页（最小改动）**

- `onMounted` / `watch route.query`：若 `open=create` 且 `gift:add` → `openQuickRecord()`
- 若有 `personId`：按当前/默认 `direction` 写入 `giverPersonId` 或 `receiverPersonId`（string）
- `router.replace` 清掉 `open`（保留或不保留 personId 均可；建议清 open，personId 写入 form 后也可清，避免返回再弹）

## 4. 文件

| 文件                                | 改动                                |
| ----------------------------------- | ----------------------------------- |
| `person/giftPersonDetail/index.vue` | profile 增按钮 + 跳转               |
| `record/index.vue`                  | 读 query 打开 popup + 预填 personId |

## 5. 验收

- 详情有权限见「记一笔」→ 进记账且弹出快速记礼，对应人员已选
- 无 `gift:add` 不见按钮
- 从详情返回不反复自动弹窗

## 6. 实现顺序

1. record 支持 `?open=create&personId=`
2. person detail 加按钮跳转
3. lint + 可选 feature 一行 + graphify
