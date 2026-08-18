### Task 1: Phone/remark helpers (TDD)

**Files:**

- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**

- Consumes: none
- Produces:
  - `maskPhone(phone?: string): string`
  - `shouldCollapseRemark(text?: string, limit = 60): boolean`
  - `collapseRemark(text?: string, limit = 60): string` 鈥?鎶樺彔鏃跺彇 `trim` 鍚庡墠 `limit` 瀛?+ `鈥锛涗笉鎶樺彔鍒欒繑鍥炲師 `trim` 鏂囨湰锛堢┖ 鈫?`''`锛?

- [ ] **Step 1: Write failing tests**

鍦?`config.spec.ts` 杩藉姞锛?

```ts
import { maskPhone, shouldCollapseRemark, collapseRemark } from './config';

describe('gift person privacy helpers', () => {
	it('maskPhone masks 11-digit china mobile', () => {
		expect(maskPhone('18222222222')).toBe('182 **** 2222');
	});

	it('maskPhone returns empty for empty input', () => {
		expect(maskPhone('')).toBe('');
		expect(maskPhone(undefined)).toBe('');
	});

	it('maskPhone keeps non-11-digit as-is', () => {
		expect(maskPhone('12345')).toBe('12345');
	});

	it('shouldCollapseRemark uses trim length > 60', () => {
		expect(shouldCollapseRemark('a'.repeat(60))).toBe(false);
		expect(shouldCollapseRemark('a'.repeat(61))).toBe(true);
		expect(shouldCollapseRemark(`  ${'a'.repeat(61)}  `)).toBe(true);
	});

	it('collapseRemark truncates with ellipsis when over limit', () => {
		const text = 'a'.repeat(61);
		expect(collapseRemark(text)).toBe(`${'a'.repeat(60)}鈥);
		expect(collapseRemark('short')).toBe('short');
	});
});
```

- [ ] **Step 2: Run tests 鈥?expect FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: FAIL 鈥?`maskPhone` / helpers not exported.

- [ ] **Step 3: Implement helpers in config.ts**

```ts
const CHINA_MOBILE_11 = /^1[3-9]\d{9}$/;

export function maskPhone(phone?: string): string {
	const value = phone?.trim() ?? '';
	if (!value) return '';
	if (!CHINA_MOBILE_11.test(value)) return value;
	return `${value.slice(0, 3)} **** ${value.slice(7)}`;
}

export function shouldCollapseRemark(text?: string, limit = 60): boolean {
	return (text?.trim().length ?? 0) > limit;
}

export function collapseRemark(text?: string, limit = 60): string {
	const value = text?.trim() ?? '';
	if (value.length <= limit) return value;
	return `${value.slice(0, limit)}鈥;
}
```

- [ ] **Step 4: Run tests 鈥?expect PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

Expected: all tests in file PASS (existing relation + new privacy).

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add maskPhone and remark collapse helpers"
```

---


