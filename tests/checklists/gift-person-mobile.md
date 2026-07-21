# Gift Person（亲友管理）移动端 Checklist

> **关联项目**：`alex_miaosha_mobile`  
> **关联 Spec**：`docs/superpowers/specs/2026-07-20-gift-person-mobile-design.md`  
> **样板**：对齐后端 `tests/checklists/gift.md`  
> **最后更新**：2026-07-21

## 0. 元信息

| 项 | 内容 |
| --- | --- |
| 模块 | gift / person（移动端） |
| 列表路由 | `/finance/gift/person` |
| 详情路由 | `/finance/gift/person/giftPersonDetail` |
| 代码 | `src/views/finance/gift/person/` |
| API | `/gift-person-info-t/*` |

## 1. 字段边界（七点法）

| 字段 | 空 | 超长 | 非法 | 类型 | 默认 | 权限 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| personName | 必填拦截 | >合理长度后端拒 | XSS 文本原样 | string | - | add/edit | |
| phone | 可空 | >11 | 非 1[3-9] 开头拒 | string | - | add/edit | |
| relationType / relationOptionId | 必选 | 自定义 ≤20 | 与预设重名拒 | string | - | add/edit | |
| remark | 可空 | 长文本 | - | string | - | add/edit | |
| id | 详情必填 | - | 非数字串 | **string** | - | view | 禁 number |

## 2. 状态机

```
列表 --(点击卡片/gift:view)--> 档案
档案 --(编辑/gift:edit)--> 表单
列表 --(新增/gift:add)--> 表单(无 id)
表单 --(保存成功)--> 列表
档案 --(删除/gift:delete)--> 列表
```

## 3. 权限矩阵

| 操作 | gift:view | gift:add | gift:edit | gift:delete |
| --- | --- | --- | --- | --- |
| 进详情 | ✓ | | | |
| 新增入口 | | ✓ | | |
| 编辑按钮 | | | ✓ | |
| 删除按钮 | | | | ✓ |

Persona：`super_super` / `gift_admin` / `gift_user`

## 4. 不测理由

| 项 | 理由 |
| --- | --- |
| 导出数据 | 移动端本期不做 |
| 批量标签 | 移动端本期不做 |
| PC Drawer | 非本端交互 |
