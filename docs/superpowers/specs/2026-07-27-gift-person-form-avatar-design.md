# 联系人编辑表单重构 + 真头像设计

日期：2026-07-27  
项目：`alex_miaosha_mobile` + `alex_miaosha`（finance）  
范围：新增/编辑表单视觉与交互 + `avatar` fileId（OSS）  
方案：对齐 `TUser.avatar` 的 fileId 模式（方案 1）

## 1. 背景

编辑/新增联系人表单层级扁平、缺少输入/选择 affordance、保存按钮悬空；详情页已有 Hero 首字头像但无真实头像能力。`gift_person_info_t` 当前无头像字段。

## 2. 目标

- 表单：分组卡片、手机号 3-4-4、备注 `0/50`、关系选择器区分、必填星精致化、吸底保存 + safe-area、必填未齐时 disabled
- 头像：库存 `avatar`（OSS fileId），读写解析 URL；上传/清除；详情与列表优先显示图，否则首字
- 新增与编辑共用同一套 form UI

## 3. 非目标

- PC 端编辑 UI / 上传 UI（VO 字段兼容即可）
- 往来历史分页、「全部」
- 修改备注库字段长度（仍 `varchar(255)`，前端硬限 50）
- Emoji；吸底以外的全局 layout 改造
- 头像裁剪器 / 多尺寸本地生成（依赖 OSS 缩略图）

## 4. 数据与后端

### 4.1 DDL

```sql
ALTER TABLE `alex_finance`.`gift_person_info_t`
  ADD COLUMN `avatar` bigint NULL COMMENT '头像 OSS 文件ID' AFTER `phone`;
```

同步写入 `doc/sql`（增量脚本或并入 `alex_finance_gift_management.sql` 表结构注释区 + 独立 migrate 文件二选一，plan 锁定一种）。

### 4.2 Entity / VO

| 字段         | 类型         | 说明                                              |
| ------------ | ------------ | ------------------------------------------------- |
| `avatar`     | `Long`       | 写库；序列化 `Long2StringSerializer`              |
| `fileInfoVo` | `FileInfoVo` | 只读，OSS 回填（`preUrl` / `preThumbnailUrl` 等） |

增改请求只接收 `avatar`（string/long id）；忽略客户端传入的 URL。

### 4.3 OSS 回填

- `finance_boot` 引入 `OssApi`（Feign，与 user 服务同类用法）
- 在 person `detail` / `profile` / `business-page`（及必要的 list 转换）中批量 `getFileInfo`，填充 URL
- OSS 失败时 URL 留空，不阻断主流程

## 5. 前端表单（form 模式）

### 5.1 布局

1. **头像区**：大号圆形/圆角方图（有 URL）或首字；右下角 Vant `photograph` 相机标；小字「更换头像」；`data-testid="gift-person-avatar-upload"`；清除 `gift-person-avatar-clear`
2. **基础信息**卡：姓名*、手机号、关系*、（条件）自定义关系
3. **更多信息**卡：备注 textarea + `n/50` 右对齐字数
4. **吸底栏**：渐变保存按钮 + `safe-area-inset-bottom`；内容区 `padding-bottom` 防遮挡

### 5.2 手机号

- 展示：`formatPhoneDisplay` → `182 2222 2222`
- 存储/提交：`normalizePhoneDigits` → 11 位数字
- `clearable`；校验规则不变

### 5.3 备注

- `maxlength=50`，展示 `{{ len }}/50`
- 库仍 255；仅前端硬限

### 5.4 保存禁用

启用条件：

- `personName` trim 非空
- `relationMode` 已选；若 `RELATION_CUSTOM` 则 `customRelation` trim 非空

禁用时半透明；仍走 `van-form` rules 兜底。

### 5.5 必填星

小号、`#EF4444`，不撑破 label 排版。

### 5.6 上传

- 走现有 OSS（`baseService` / `/api/am-oss`…`file-info`，对齐 PC `my-upload` 成功结构取 id + 预览 URL）
- loading / 失败 toast；成功写 `formState.avatar` 并本地预览
- 清除：`avatar` 置空，预览回首字

## 6. 展示侧

- **详情 Hero / 列表卡片**：`fileInfoVo.preThumbnailUrl || fileInfoVo.preUrl` 优先；否则首字（保持现视觉语言）
- Profile 隐私能力（脱敏等）不变

## 7. 测试

| 层              | 内容                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| 单元            | `formatPhoneDisplay` / `normalizePhoneDigits`；可选 `maskPhone` 回归         |
| 后端            | OSS 回填 mock（有 fileId → URL；无/失败 → 空）                               |
| 手动 / Midscene | 上传头像保存后详情可见；无头像首字；手机号格式；吸底；disabled；备注 50 截断 |

`data-testid`：`gift-person-form`、`gift-person-save`、`gift-person-avatar-upload`、`gift-person-avatar-clear`。

## 8. 文档

- 移动端 `feature.md`：表单重构 + 头像
- 后端视需要更新 finance 相关 DEVELOPMENT / SQL 说明
- 改 `src` / Java 后各自 graphify（若项目有）

## 9. 与前序关系

| 项                  | 状态                             |
| ------------------- | -------------------------------- |
| Profile 视觉 / 隐私 | 已完成，本轮 form + 头像展示对齐 |
| 历史分页            | 仍搁置                           |
| PC 编辑 UI          | 非本轮                           |
