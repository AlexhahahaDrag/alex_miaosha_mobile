### Task 1: Signed money + direction icon helpers (TDD)

**Files:**

- Modify: `src/views/finance/gift/config.ts`
- Test: `src/views/finance/gift/config.spec.ts`

**Interfaces:**

- Consumes: `formatMoney`, `GiftDirection`
- Produces:
  - `formatSignedMoney(direction?: string, amount?: number | string): string` 鈥?`RECEIVE` 鈫?`+` + `formatMoney(amount)`锛涘叾浠栨柟鍚?鈫?`-` + `formatMoney(amount)`锛堢鍙锋帴鍦?`锟 鍓嶏細`+锟?.00` / `-锟?.00`锛?
  - `directionIconName(direction?: string): string` 鈥?`RECEIVE` 鈫?`gift-o`锛沗GIVE` 鈫?`cash-back-record`锛沗RETURN` 鈫?`replay`锛涢粯璁?`orders-o`

- [ ] **Step 1: Write failing tests**

```ts
import { formatSignedMoney, directionIconName } from './config';

describe('gift person visual helpers', () => {
	it('formatSignedMoney prefixes + for RECEIVE', () => {
		expect(formatSignedMoney('RECEIVE', 700)).toBe('+锟?00.00');
	});

	it('formatSignedMoney prefixes - for GIVE and RETURN', () => {
		expect(formatSignedMoney('GIVE', 100)).toBe('-锟?00.00');
		expect(formatSignedMoney('RETURN', 50)).toBe('-锟?0.00');
	});

	it('directionIconName maps directions', () => {
		expect(directionIconName('RECEIVE')).toBe('gift-o');
		expect(directionIconName('GIVE')).toBe('cash-back-record');
		expect(directionIconName('RETURN')).toBe('replay');
		expect(directionIconName(undefined)).toBe('orders-o');
	});
});
```

- [ ] **Step 2: Run 鈥?expect FAIL**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- [ ] **Step 3: Implement**

```ts
export function formatSignedMoney(direction?: string, amount?: number | string): string {
	const money = formatMoney(amount);
	return direction === 'RECEIVE' ? `+${money}` : `-${money}`;
}

export function directionIconName(direction?: string): string {
	if (direction === 'RECEIVE') return 'gift-o';
	if (direction === 'GIVE') return 'cash-back-record';
	if (direction === 'RETURN') return 'replay';
	return 'orders-o';
}
```

- [ ] **Step 4: Run 鈥?expect PASS**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/views/finance/gift/config.ts src/views/finance/gift/config.spec.ts
git commit -m "feat(gift): add signed money and direction icon helpers"
```

---


