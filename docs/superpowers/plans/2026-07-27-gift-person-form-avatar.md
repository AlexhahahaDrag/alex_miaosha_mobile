# Gift Person Form Redesign + Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增/编辑联系人表单高颜值重构（分组、手机号 3-4-4、备注 0/50、吸底保存）+ 真头像（`avatar` OSS fileId，详情/列表展示）。

**Architecture:** 后端 `gift_person_info_t.avatar` + finance 经 `OssApi.getFileInfo` 回填 URL（对齐 `TUser`）；移动端用现有 `views/file/api` 上传拿 fileId，form/profile/list 共用展示逻辑。PC 编辑 UI 不做。

**Tech Stack:** Java/Spring Feign + MyBatis-Plus；Vue3 + Vant + Vitest；OSS `alex-oss`

## Global Constraints

- 头像库存 `avatar` bigint（fileId）；读写只写 id；URL 字段只读。
- 备注前端硬限 50；库仍 `varchar(255)`。
- 手机号展示 3-4-4，提交 11 位纯数字；ID 前端 string。
- API 解构 `const { code, data, message } = await ...`；auto-import 勿重复 import Vue/Vant。
- 无 emoji；相机用 Vant `photograph`。
- 非目标：PC 上传 UI、历史分页、改备注库长、全局 layout。
- 后端工作区：`f:/workplace/project/myself/backend/alex_miaosha`
- 前端工作区：`f:/workplace/project/myself/frontend/alex_miaosha_mobile`
- 提交英文 message；Windows 注意中文乱码。
- `finance` 需新增 `oss_api` 依赖，并 `@EnableFeignClients` 增加 `com.alex.api.oss`。

---

## File Map

### Backend (`alex_miaosha`)

| File | Responsibility |
|---|---|
| `doc/sql/gift_person_avatar_20260727.sql` | 增量 ALTER |
| `doc/sql/alex_finance_gift_management.sql` | 绿场 CREATE 同步加 `avatar` 列 |
| `.../entity/GiftPersonInfo.java` | `avatar` 字段 |
| `.../vo/GiftPersonInfoVo.java` | `avatar` + URL 字段 |
| `finance_boot/pom.xml` | `oss_api` 依赖 |
| `FinanceApplication.java` | Feign scan `com.alex.api.oss` |
| `GiftPersonInfoServiceImp.java` | 回填 URL；增改透传 avatar |

### Mobile (`alex_miaosha_mobile`)

| File | Responsibility |
|---|---|
| `src/views/finance/gift/config.ts` | 类型 + phone helpers |
| `src/views/finance/gift/config.spec.ts` | phone helpers 单测 |
| `src/views/finance/gift/person/giftPersonDetail/index.vue` | form 重构 + 上传；profile 显示图 |
| `src/views/finance/gift/person/index.vue` | 列表头像 |
| `src/views/file/api/index.ts` | 确认上传返回类型（必要时修类型） |
| `feature.md` | 文档 |

---

### Task 1: Backend DDL + entity/VO fields

**Files (backend repo):**
- Create: `doc/sql/gift_person_avatar_20260727.sql`
- Modify: `doc/sql/alex_finance_gift_management.sql`（CREATE TABLE `gift_person_info_t` 在 `phone` 后加列）
- Modify: `alex_miaosha_finance/finance_boot/.../entity/GiftPersonInfo.java`
- Modify: `alex_miaosha_finance/finance_api/.../vo/GiftPersonInfoVo.java`

**Interfaces:**
- Produces: entity/VO `avatar: Long`；VO `avatarUrl` / `avatarThumbnailUrl: String`

- [ ] **Step 1: Write migrate SQL**

```sql
-- gift_person_avatar_20260727.sql
ALTER TABLE `alex_finance`.`gift_person_info_t`
  ADD COLUMN `avatar` bigint NULL COMMENT '头像 OSS 文件ID' AFTER `phone`;
```

- [ ] **Step 2: Update greenfield CREATE in `alex_finance_gift_management.sql`**

在 `` `phone` varchar(32) ... `` 后增加：

```sql
  `avatar` bigint NULL DEFAULT NULL COMMENT '头像 OSS 文件ID',
```

- [ ] **Step 3: Entity field**

```java
@ApiModelProperty(value = "头像 OSS 文件ID")
@TableField("avatar")
private Long avatar;
```

- [ ] **Step 4: VO fields**

```java
@JsonSerialize(using = Long2StringSerializer.class)
@ApiModelProperty(value = "avatar file id")
private Long avatar;

@ApiModelProperty(value = "avatar url")
private String avatarUrl;

@ApiModelProperty(value = "avatar thumbnail url")
private String avatarThumbnailUrl;
```

- [ ] **Step 5: Commit (backend)**

```bash
cd f:/workplace/project/myself/backend/alex_miaosha
git add doc/sql/gift_person_avatar_20260727.sql doc/sql/alex_finance_gift_management.sql \
  alex_miaosha_finance/finance_boot/src/main/java/com/alex/finance/gift/person/entity/GiftPersonInfo.java \
  alex_miaosha_finance/finance_api/src/main/java/com/alex/api/finance/gift/person/vo/GiftPersonInfoVo.java
git commit -m "feat(gift): add person avatar file id column and VO fields"
```

---

### Task 2: Backend OssApi wiring + URL fill

**Files (backend):**
- Modify: `alex_miaosha_finance/finance_boot/pom.xml`（加 `oss_api`）
- Modify: `alex_miaosha_finance/finance_boot/.../FinanceApplication.java`
- Modify: `GiftPersonInfoServiceImp.java`
- Create test (optional but preferred): `.../gift/person/GiftPersonAvatarFillTest.java` 或现有测试目录同风格

**Interfaces:**
- Consumes: `OssApi.getFileInfo(List<Long>)` → `FileInfoVo.preUrl` / `preThumbnailUrl`（对齐 `TUserServiceImpl.setAvatarUrls`）
- Produces: `toVo` / 批量列表出口均带 URL（失败留空）

- [ ] **Step 1: pom dependency**

```xml
<dependency>
    <groupId>com.alex</groupId>
    <artifactId>oss_api</artifactId>
</dependency>
```

（version 随 parent BOM；与 `user_boot` 一致。）

- [ ] **Step 2: EnableFeignClients**

```java
@EnableFeignClients(basePackages = {"com.alex.api.user", "com.alex.api.ai", "com.alex.api.oss"})
```

- [ ] **Step 3: Inject OssApi and fill helpers in ServiceImp**

参考 `TUserServiceImpl`：

```java
@Resource
private OssApi ossApi;

private void fillAvatarUrls(GiftPersonInfoVo vo) { /* single id */ }

private void fillAvatarUrls(Collection<? extends GiftPersonInfoVo> records) { /* batch */ }
```

在 `toVo` 末尾调用 `fillAvatarUrls(vo)`；`business-page` 转换列表后批量 fill；`getProfile` 的 person 已走 `toVo`/`toBusinessVo` 即可。

增改：`BeanUtils.copyProperties` 已含 `avatar`，无需特殊；勿把 `avatarUrl` 写回 entity。

- [ ] **Step 4: Unit test (mock OssApi)**

最小用例：

1. `avatar != null` 且 OSS 返回 success → URL 被设置  
2. OSS 抛异常 → VO 仍返回，URL 为 null  

- [ ] **Step 5: Compile**

```bash
cd f:/workplace/project/myself/backend/alex_miaosha
mvn -pl alex_miaosha_finance/finance_boot -am test -Dtest=GiftPersonAvatarFillTest -q
```

（若测试类名不同，按实际调整；至少 `mvn -pl ... -am compile -q` 通过。）

- [ ] **Step 6: Commit**

```bash
git add alex_miaosha_finance/finance_boot/pom.xml \
  alex_miaosha_finance/finance_boot/src/main/java/com/alex/finance/FinanceApplication.java \
  alex_miaosha_finance/finance_boot/src/main/java/com/alex/finance/gift/person/service/impl/GiftPersonInfoServiceImp.java \
  alex_miaosha_finance/finance_boot/src/test/java/com/alex/finance/gift/person/
git commit -m "feat(gift): resolve person avatar URLs via OssApi"
```

---

### Task 3: Mobile phone helpers (TDD)

**Files (mobile):**
- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**
- Produces:
  - `normalizePhoneDigits(phone?: string): string` — 仅保留数字
  - `formatPhoneDisplay(phone?: string): string` — 11 位 → `182 2222 2222`；否则原样（已 normalize 后的数字串）

- [ ] **Step 1: Failing tests**

```ts
import { normalizePhoneDigits, formatPhoneDisplay } from './config';

describe('gift person phone format helpers', () => {
	it('normalizePhoneDigits strips non-digits', () => {
		expect(normalizePhoneDigits('182 2222 2222')).toBe('18222222222');
		expect(normalizePhoneDigits(undefined)).toBe('');
	});

	it('formatPhoneDisplay applies 3-4-4 for 11 digits', () => {
		expect(formatPhoneDisplay('18222222222')).toBe('182 2222 2222');
		expect(formatPhoneDisplay('12345')).toBe('12345');
	});
});
```

- [ ] **Step 2: Run FAIL → implement → PASS**

```ts
export function normalizePhoneDigits(phone?: string): string {
	return (phone ?? '').replace(/\D/g, '');
}

export function formatPhoneDisplay(phone?: string): string {
	const digits = normalizePhoneDigits(phone);
	if (digits.length !== 11) return digits || (phone?.trim() ?? '');
	return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}
```

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add phone display and normalize helpers"
```

---

### Task 4: Types + form UI (avatar upload, groups, sticky save)

**Files (mobile):**
- Modify: `src/views/finance/gift/config.ts`（`GiftPersonInfo` 加 `avatar?` / `avatarUrl?` / `avatarThumbnailUrl?`）
- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`
- Modify if needed: `src/views/file/api/index.ts`（返回类型改为 `ResponseBody<FileInfoData>` 若实际返回对象）

**Interfaces:**
- Consumes: Task 3 helpers；`addFileManager` from `@/views/file/api`
- Produces: form 模式完整 UI；保存 payload 含 `avatar` string id、phone 纯数字、remark ≤50

- [ ] **Step 1: Extend GiftPersonInfo**

```ts
avatar?: GiftId;
avatarUrl?: string;
avatarThumbnailUrl?: string;
```

- [ ] **Step 2: Form state for display phone**

- `phoneDisplay` ref，与 `formState.phone` 双向：输入时 `normalize` 写 phone，display 用 `formatPhoneDisplay`
- 或 computed get/set 包装（任选清晰一种）

- [ ] **Step 3: Replace form template**

结构要点（testid 必须）：

- 头像区：`gift-person-avatar-upload` / `gift-person-avatar-clear`
- 分组标题「基础信息」「更多信息」
- 姓名 / 手机号（clearable）/ 关系 is-link / 自定义关系
- 备注 textarea maxlength 50 + `{{ remarkLen }}/50`
- 吸底：`gift-person-save`，`:disabled="!canSave"`，文案新增「保存」编辑「保存更改」
- 内容区 `padding-bottom` ≥ 吸底高度 + safe-area

必填星：CSS `.req { color:#EF4444; font-size:12px; margin-right:2px; }`

- [ ] **Step 4: Upload / clear / canSave / savePerson**

```ts
const canSave = computed(() => {
  const nameOk = !!formState.value.personName?.trim();
  if (!formState.value.relationMode) return false;
  if (formState.value.relationMode === RELATION_CUSTOM) {
    return nameOk && !!formState.value.customRelation?.trim();
  }
  return nameOk;
});

const onAvatarAfterRead = async (file: any) => {
  // FormData + addFileManager('image' or project type), parse { code, data }
  // data.id → formState.avatar; preview from data.preThumbnailUrl || data.preUrl
};

const clearAvatar = () => {
  formState.value.avatar = undefined;
  // clear local preview url
};

// toSavePayload: phone = normalizePhoneDigits(...); remark truncated 50; include avatar
```

上传 API：使用 `@/views/file/api` 的 `addFileManager`；先读实际响应结构（PC `my-upload` 用 `id` / `preUrl` / `preThumbnailUrl`）。若 mobile 类型写成 `boolean`，改为真实 `FileInfoData` 并修正。

- [ ] **Step 5: Styles**

对齐详情 token：`--gp-*`、分组白卡圆角 20、吸底 glass/白底 + 顶部分割 + 渐变按钮；`padding-bottom: calc(72px + env(safe-area-inset-bottom))` 于 form 滚动区。

- [ ] **Step 6: Lint + unit + smoke**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/config.ts"
```

手动：新增/编辑填全 → 保存可点；缺姓名 disabled；手机号显示空格；备注超 50 截断；上传头像后保存回详情见图片。

- [ ] **Step 7: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/person/giftPersonDetail/index.vue src/views/file/api/index.ts
git commit -m "feat(gift): redesign person form with sticky save and avatar upload"
```

---

### Task 5: Profile + list avatar display

**Files:**
- Modify: `giftPersonDetail/index.vue`（profile Hero）
- Modify: `person/index.vue`（列表卡片 avatar）

**Interfaces:**
- Consumes: `avatarThumbnailUrl || avatarUrl`

- [ ] **Step 1: Profile Hero**

有 URL 时 `<img>`（圆角 20）；否则保持首字。勿破坏隐私胶囊栏。

- [ ] **Step 2: List card**

同样优先图，否则首字。

- [ ] **Step 3: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue src/views/finance/gift/person/index.vue
git commit -m "feat(gift): show person avatar image on detail and list"
```

---

### Task 6: Docs + graphify

**Files:**
- Modify mobile: `feature.md`
- Backend: 在 `doc/sql` 旁或 finance README/注释一句（若无 DEVELOPMENT 则仅 SQL 即可）
- Run: mobile `graphify`（Python314）；backend 若有 graphify 规则则按 AGENTS

- [ ] **Step 1: feature.md bullet**

```markdown
- 联系人新增/编辑：表单分组、手机号 3-4-4、备注 0/50、吸底保存；支持 OSS 头像（avatar fileId），详情与列表优先展示头像图。
```

- [ ] **Step 2: graphify mobile**

```bash
"C:\Users\Administrator\AppData\Local\Programs\Python\Python314\python.exe" -m graphify update src
npm run graphify:augment
# commit only GRAPH_REPORT.md graph.html graph.json (not cache)
```

- [ ] **Step 3: Commit**

```bash
git add feature.md src/graphify-out/GRAPH_REPORT.md src/graphify-out/graph.html src/graphify-out/graph.json
git commit -m "docs(gift): note person form avatar UX and update graphify"
```

---

## Spec Coverage Checklist

| Spec item | Task |
|---|---|
| DDL avatar | Task 1 |
| VO + Long2String + URLs | Task 1–2 |
| OssApi fill | Task 2 |
| Phone 3-4-4 helpers | Task 3–4 |
| Form groups / sticky / 0/50 / disabled | Task 4 |
| Upload / clear testids | Task 4 |
| Detail + list image | Task 5 |
| feature.md + graphify | Task 6 |
| PC UI 非目标 | Global Constraints |

## Manual DB note

执行 `gift_person_avatar_20260727.sql` 后重启 finance；否则读写 avatar 列失败。
