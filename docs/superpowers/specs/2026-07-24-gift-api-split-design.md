# Mobile Gift API 按子域拆分设计规格

日期：2026-07-24  
范围：`alex_miaosha_mobile` `src/views/finance/gift/`  
目标：取消聚合 `gift/api/index.ts`，API 下沉到各业务目录；删除 `normalizeGiftIds`

## 1. 目标与范围

### 目标

- person / event / record 接口分文件，挂在各自页面旁 `*/api/index.ts`
- 无总 barrel（禁止 `@/views/finance/gift/api`）
- 删除 `normalizeGiftIds`（请求/响应均不再做前端 ID 归一；靠 `GiftId` 类型 + 后端 `Long2StringSerializer`）

### 不在范围

- PC `alex_miaosha_front` gift API 拆分
- 新增 analysis 独立 API（当前 analysis/dashboard 复用 record 接口即可）
- 改后端契约或 VO

## 2. 目录与职责

```text
gift/
  person/api/index.ts    # /gift-person-info-t/*
  event/api/index.ts     # /gift-event-info-t/*
  record/api/index.ts    # /gift-record-info-t/*
  config.ts              # 共享类型（保留）
```

### 删除

- `gift/api/index.ts`
- `gift/api/normalizeGiftIds.ts`
- `gift/api/normalizeGiftIds.spec.ts`
- 整个 `gift/api/` 目录

### 各 api 文件约定

- 使用 `@/views/common/api` 的 `getData` / `postData` / `putData` / `deleteData` + `baseService.finance`
- 本域 path 常量写在本文件内（如 `const base = '/gift-person-info-t'`）
- 入参直接传业务对象，**不**调用 `normalizeGiftIds`
- 导出函数名保持不变（`getGiftPersonBusinessPage`、`addGiftRecord` 等），降低迁移噪音

## 3. Import 迁移

| 调用方 | 新路径 |
|--------|--------|
| `person/index.vue`、`person/giftPersonDetail/index.vue`、`composables/useGiftRelationOptions.ts` | `@/views/finance/gift/person/api` |
| `event/index.vue` | `@/views/finance/gift/event/api` |
| `record/index.vue`、`dashboard/index.vue`、`analysis/index.vue` | `@/views/finance/gift/record/api` |

迁移后全仓禁止残留：

- `from '@/views/finance/gift/api'`
- `normalizeGiftIds` 符号

## 4. ID 安全契约（替代 normalize）

- 前端类型：`GiftId = string`；业务代码禁止把 id 当 number
- 后端：`BaseVo` / gift VO `@JsonSerialize(Long2StringSerializer)`
- 单测：删除 `normalizeGiftIds.spec.ts`；不新增等价前端归一测试

## 5. 文档与图谱

- 更新 `DEVELOPMENT.md` §9：API 在各子域 `*/api/`，不再写 `gift/api/` + normalize
- 视需要更新 `feature.md` 关联 API 路径描述
- 改 `src` 后：`graphify update src`（或 `npm run graphify:update` 若环境可用）

## 6. 验证

1. `rg "finance/gift/api'|normalizeGiftIds" src` → 无业务引用
2. `npm run lint` 通过（针对改动文件）
3. `npm run test:unit`：仅剩 `config.spec.ts` / `permission.spec.ts` 等，无 normalize 用例失败
4. 手测：亲友列表/详情、事由、礼金记录仍能请求对应 finance 接口

## 7. 成功标准

- 三域 API 物理分离，无聚合入口
- `normalizeGiftIds` 及单测已删除
- 所有原调用方 import 已切换且可编译/lint
