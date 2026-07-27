# Gift Event（事由管理）移动端 Checklist

> **关联项目**：`alex_miaosha_mobile`  
> **关联 Spec**：`docs/superpowers/specs/2026-07-27-gift-event-mobile-design.md`  
> **样板**：对齐 `tests/checklists/gift-person-mobile.md` / 后端 `tests/checklists/gift.md`  
> **最后更新**：2026-07-27

## 0. 元信息

| 项 | 内容 |
| --- | --- |
| 模块 | gift / event（移动端） |
| 列表路由 | `/finance/gift/event` |
| 详情路由 | `/finance/gift/event/giftEventDetail` |
| 代码 | `src/views/finance/gift/event/` |
| API | `/gift-event-info-t/*` |

## 1. 字段边界（七点法）

| 字段 | 空 | 超长 | 非法 | 类型 | 默认 | 权限 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| eventName | 必填拦截 | 后端约束 | XSS 文本原样 | string | - | add/edit | |
| eventType / eventTypeOptionId | 必选 | 自定义 ≤20 | 与 preset 重名拒 | string | - | add/edit | preset 走 optionId |
| eventTime | 可空 | - | 非法日期拒 | string | - | add/edit | `YYYY-MM-DDTHH:mm:ss` |
| remark | 可空 | 长文本 | - | string | - | add/edit | 不硬限 50 |
| id | 编辑必填 | - | 非数字串 | **string** | - | view/edit | 禁 number |

## 2. 状态机

```
列表 --(新增/gift:add)--> 表单(无 id)
列表 --(卡片/gift:edit)--> 表单(有 id)
表单 --(保存成功)--> 列表
表单 --(删除/gift:delete)--> 列表
```

无 profile 态；列表不支持「仅查看档案」。

## 3. 权限矩阵

| 操作 | gift:view | gift:add | gift:edit | gift:delete |
| --- | --- | --- | --- | --- |
| 进列表 | ✓ | | | |
| 新增入口 | | ✓ | | |
| 卡片进编辑 | | | ✓ | |
| 删除按钮 | | | | ✓ |

Persona：`super_super` / `gift_admin` / `gift_user`

## 4. 不测理由

| 项 | 理由 |
| --- | --- |
| 事由 profile / 往来历史 | 本期不做（超出 PC） |
| 礼金记录事由选择器 | 另开任务 |
| PC Drawer / 导出 | 非本端交互 |
