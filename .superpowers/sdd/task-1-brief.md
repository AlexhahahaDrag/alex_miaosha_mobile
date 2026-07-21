### Task 1: Config 绫诲瀷涓庣函鍑芥暟 + Vitest

**Files:**

- Modify: `src/views/finance/gift/config.ts`
- Create: `src/views/finance/gift/config.spec.ts`
- Modify: `package.json`锛堝姞 `vitest` + `test:unit`锛?

**Interfaces:**

- Produces: `GiftId`, `GiftPersonBusinessInfo`, `GiftPersonSummary`, `GiftPersonProfile`, `GiftPersonQuery`, `GiftPersonRelationOptions`, `GiftRelationOptionItem`, `GiftPersonFormState`, `RELATION_CUSTOM`, `FALLBACK_GIFT_RELATION_OPTIONS`, `GIFT_PERSON_PATH`, `GIFT_PERSON_DETAIL_NAME`, `resolvePresetCode`, `mapRelationToFormFields`, `buildRelationTypeForSave`, `relationLabel`, `directionLabel`, `formatMoney`锛堜繚鐣欑幇鏈夊埆鍚嶅吋瀹癸級

- [ ] **Step 1: 瀹夎 Vitest**

```bash
npm i -D vitest
```

鍦?`package.json` scripts 澧炲姞锛歚"test:unit": "vitest run"`銆?

- [ ] **Step 2: 鍐欏け璐ュ崟娴?*

`src/views/finance/gift/config.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
	RELATION_CUSTOM,
	buildRelationTypeForSave,
	mapRelationToFormFields,
	relationLabel,
	resolvePresetCode,
	FALLBACK_GIFT_RELATION_OPTIONS,
} from './config';

describe('gift person relation helpers', () => {
	it('resolvePresetCode maps 浜插睘 id to RELATIVE', () => {
		expect(resolvePresetCode('9000000000000000001')).toBe('RELATIVE');
	});

	it('mapRelationToFormFields uses CUSTOM for unknown relation', () => {
		const form = mapRelationToFormFields({ relationType: '鍙戝皬' });
		expect(form.relationMode).toBe(RELATION_CUSTOM);
		expect(form.customRelation).toBe('鍙戝皬');
	});

	it('buildRelationTypeForSave returns relationOptionId for preset mode', () => {
		const payload = buildRelationTypeForSave({
			relationMode: '9000000000000000002',
		});
		expect(payload).toEqual({ relationOptionId: '9000000000000000002' });
	});

	it('relationLabel resolves RELATIVE to 浜插睘', () => {
		expect(relationLabel('RELATIVE', FALLBACK_GIFT_RELATION_OPTIONS)).toBe('浜插睘');
	});
});
```

- [ ] **Step 3: 璺戞祴纭澶辫触**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL锛堢己灏戝鍑哄嚱鏁帮級

- [ ] **Step 4: 鎵╁睍 `config.ts`**

鍦ㄧ幇鏈夋枃浠朵笂杩藉姞/鏇挎崲锛堜繚鐣?`directionOptions` / `formatMoney` / `directionText` 鍏煎 record 椤碉級锛?

```ts
export type GiftId = string;
export type GiftPersonScope = 'CONTACT' | 'ORG_MEMBER' | 'ALL';

export interface GiftPersonInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	bindUserId?: GiftId;
	personName?: string;
	phone?: string;
	relationType?: string;
	relationOptionId?: string;
	remark?: string;
	createTime?: string;
	totalGiveAmount?: number;
	totalReceiveAmount?: number;
}

export interface GiftPersonBusinessInfo extends GiftPersonInfo {
	netAmount?: number;
	latestRecordTime?: string;
	latestEventName?: string;
	latestDirection?: GiftDirection;
	pendingReturnAmount?: number;
}

export interface GiftPersonSummary {
	personCount?: number;
	yearTotalAmount?: number;
	pendingReturnAmount?: number;
}

export interface GiftPersonProfile {
	person?: GiftPersonBusinessInfo;
	records?: GiftRecordInfo[];
}

export interface GiftPersonQuery {
	keyword?: string;
	relationType?: string;
	personScope?: GiftPersonScope;
}

export interface GiftRelationOptionItem {
	id: string;
	name: string;
}

export interface GiftPersonRelationOptions {
	presets?: GiftRelationOptionItem[];
	customs?: GiftRelationOptionItem[];
}

export interface GiftRelationSelectOption {
	label: string;
	value: string;
}

export interface GiftRelationSelectGroup {
	label: string;
	options: GiftRelationSelectOption[];
}

export interface GiftPersonFormState extends GiftPersonInfo {
	relationMode?: string;
	customRelation?: string;
}

export const GIFT_PERSON_PATH = '/finance/gift/person';
export const GIFT_PERSON_DETAIL_NAME = 'giftPersonDetail';

export const FALLBACK_GIFT_RELATION_OPTIONS: GiftRelationOptionItem[] = [
	{ id: '9000000000000000001', name: '浜插睘' },
	{ id: '9000000000000000002', name: '鏈嬪弸' },
	{ id: '9000000000000000003', name: '鍚屼簨' },
	{ id: '9000000000000000004', name: '閭婚噷' },
	{ id: '9000000000000000005', name: '鍏朵粬' },
];

export const RELATION_CUSTOM = 'CUSTOM';

const PRESET_NAME_TO_CODE: Record<string, string> = {
	浜插睘: 'RELATIVE',
	鏈嬪弸: 'FRIEND',
	鍚屼簨: 'COLLEAGUE',
	閭婚噷: 'NEIGHBOR',
	鍏朵粬: 'OTHER',
};

// 浠?PC config 鎷疯礉锛歵oSelectOptions / resolvePresetCode / buildGiftRelationSelectOptions /
// isPresetRelationType / findOptionIdByRelationType / mapRelationToFormFields /
// buildRelationTypeForSave / relationLabel
// directionLabel 鍙笌 directionText 绛変环锛歭abel 鐢ㄤ腑鏂囨枃妗?
```

灏?`GiftPersonInfo.id` 浠?`string | number` 鏀逛负 `GiftId`锛坄string`锛夛紱`GiftEventInfo` / `GiftRecordInfo` 鐨?`*Id` 鍚屾鏀逛负 `GiftId`銆?

- [ ] **Step 5: 璺戞祴閫氳繃**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add person types and relation helpers with unit tests"
```

---

