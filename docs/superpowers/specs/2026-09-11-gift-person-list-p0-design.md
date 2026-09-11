# 移动端亲友列表 P0 展示升级

日期：2026-09-11  
分支：`develop-1.0-feature-org-manage`  
项目：`alex_miaosha_mobile`  
参考：PC `alex_miaosha_front/.../gift/person/index.vue`（仅对照展示字段，不搬筛选/记单）  
约束：Ponytail full — 最短 diff

## 1. 背景

列表卡最近往来时间直接渲染 ISO（如 `2024-08-25T00:00:00`）；缺事由名；有 `netAmount` 未展示。详情页已用 `formatTime`，列表未复用。

## 2. 目标（仅 P0）

1. `latestRecordTime` → `formatTime(..., dataTimeFormat)`  
2. 有 `latestEventName` 时显示在方向后  
3. 卡片展示人情余额 `netAmount`（`formatMoney`）

## 3. 非目标

- relationGrade / relationStatus / personScope 筛选  
- 摘要改 PC 四卡  
- 快捷记单、导出、新组件、改详情/表单  

## 4. 改动面

| 文件 | 改动 |
| --- | --- |
| `src/views/finance/gift/person/index.vue` | 模板 + 引入 `formatTime`/`dataTimeFormat`；余额一行 |

复用：`@/utils/dayjs`、`formatMoney` / `directionText`（config 已有）。

## 5. 展示约定

- 无往来时间：保持「暂无往来」  
- 有时间无事由：`{格式化时间} · {方向}`  
- 有时间有事由：`{格式化时间} · {方向} · {事由}`  
- 余额：`净 {formatMoney(netAmount)}`（与出/入同一信息块，不新卡片）

## 6. 验收

- 列表不再出现裸 `T00:00:00` ISO  
- 有 `latestEventName` 的记录可见事由  
- 有净额数据时可见「净 ¥x.xx」  
- lint 通过；graphify 按仓库规则更新  

## 7. 实现顺序

1. 改 `person/index.vue` 模板/导入  
2. 肉眼/页面核对  
3. lint + graphify（若改 src）  
4. 可选：`feature.md` 一行说明列表时间格式化  

P1（记一笔、等级等）另开 spec。
