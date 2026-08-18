### Task 2: Profile UI 鈥?header privacy actions + remark + time

**Files:**

- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`

**Interfaces:**

- Consumes: `maskPhone`, `shouldCollapseRemark`, `collapseRemark` from `@/views/finance/gift/config`
- Consumes: `formatTime`, `dataTimeFormat` from `@/utils/dayjs`
- Produces: profile UI as per spec 搂4

- [ ] **Step 1: Add state and computed in script**

鍦?script 涓紙閬靛惊鐜版湁澹版槑椤哄簭锛歩mports 鈫?hooks 鈫?state 鈫?methods 鈫?lifecycle锛夛細

```ts
import { formatTime, dataTimeFormat } from '@/utils/dayjs';
import {
	// existing imports...
	maskPhone,
	shouldCollapseRemark,
	collapseRemark,
} from '@/views/finance/gift/config';

const phoneVisible = ref(false);
const remarkExpanded = ref(false);

const rawPhone = computed(() => profile.value.person?.phone?.trim() || '');
const hasPhone = computed(() => !!rawPhone.value);
const displayPhone = computed(() => {
	if (!rawPhone.value) return '-';
	return phoneVisible.value ? rawPhone.value : maskPhone(rawPhone.value) || rawPhone.value;
});

const remarkText = computed(() => profile.value.person?.remark?.trim() || '');
const remarkCollapsible = computed(() => shouldCollapseRemark(remarkText.value));
const displayRemark = computed(() => {
	if (!remarkText.value) return '-';
	if (!remarkCollapsible.value || remarkExpanded.value) return remarkText.value;
	return collapseRemark(remarkText.value);
});

const formatPayTime = (payTime?: string) => {
	if (!payTime) return '-';
	return formatTime(payTime, dataTimeFormat) || '-';
};
```

杩涘叆 profile 鍔犺浇鎴愬姛鏃朵繚鎸?`phoneVisible = false`锛沗openEdit` / 绂诲紑涓嶅繀寮哄埗锛屼絾 `init` 杩?profile 鏃堕噸缃細

```ts
// inside loadProfile success / init profile branch:
phoneVisible.value = false;
remarkExpanded.value = false;
```

- [ ] **Step 2: Rewrite profile template sections**

澶撮儴鍓 + 鎿嶄綔锛堢ず渚嬬粨鏋勶紝鏍峰紡 class 鍙井璋冧絾 testid/aria 蹇呴』涓€鑷达級锛?

```vue
<section class="profile-head">
	<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
	<strong>{{ profile.person?.personName || '-' }}</strong>
	<div class="profile-head-meta">
		<span>
			{{ relationLabel(profile.person?.relationType) }}
			<template v-if="hasPhone"> 路 {{ displayPhone }}</template>
			<template v-else> 路 -</template>
		</span>
		<div
			v-if="hasPhone"
			class="profile-phone-actions"
		>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-toggle"
				:aria-label="phoneVisible ? '闅愯棌鎵嬫満鍙? : '鏄剧ず鎵嬫満鍙?"
				@click="togglePhoneVisible"
			>
				<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
			</button>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-call"
				aria-label="鎷ㄦ墦鐢佃瘽"
				@click="callPhone"
			>
				<van-icon name="phone-o" />
			</button>
			<button
				type="button"
				class="icon-btn"
				data-testid="gift-person-phone-copy"
				aria-label="澶嶅埗鎵嬫満鍙?
				@click="copyPhone"
			>
				<van-icon name="records" />
			</button>
		</div>
	</div>
</section>
```

鍩烘湰淇℃伅浠呭娉細

```vue
<section class="profile-block">
	<h3>鍩烘湰淇℃伅</h3>
	<van-cell title="澶囨敞">
		<template #value>
			<div class="remark-value">
				<span>{{ displayRemark }}</span>
				<button
					v-if="remarkCollapsible"
					type="button"
					class="remark-toggle"
					data-testid="gift-person-remark-toggle"
					@click="remarkExpanded = !remarkExpanded"
				>
					{{ remarkExpanded ? '鏀惰捣' : '灞曞紑' }}
				</button>
			</div>
		</template>
	</van-cell>
</section>
```

鍘嗗彶鏃堕棿锛?

```vue
<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
```

鍒犻櫎鍘熴€屽熀鏈俊鎭€嶉噷鐨勬墜鏈哄彿銆佸叧绯?`van-cell`銆?

- [ ] **Step 3: Implement action methods**

```ts
const togglePhoneVisible = () => {
	navigator.vibrate?.(50);
	phoneVisible.value = !phoneVisible.value;
};

const callPhone = () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	window.location.href = `tel:${rawPhone.value}`;
};

const copyPhone = async () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(rawPhone.value);
		} else {
			const input = document.createElement('textarea');
			input.value = rawPhone.value;
			input.setAttribute('readonly', 'true');
			input.style.position = 'fixed';
			input.style.opacity = '0';
			document.body.appendChild(input);
			input.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(input);
			if (!ok) throw new Error('copy failed');
		}
		showSuccessToast('宸插鍒?);
	} catch {
		showFailToast('澶嶅埗澶辫触');
	}
};
```

- [ ] **Step 4: Add scoped styles for meta row / icon buttons / remark**

```less
.profile-head-meta {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
	width: 100%;

	> span {
		color: #8a94a6;
		font-size: 13px;
	}
}

.profile-phone-actions {
	display: flex;
	gap: 12px;
}

.icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: #eaf6ff;
	color: #2098ee;
	cursor: pointer;

	&:active {
		transform: scale(0.96);
	}
}

.remark-value {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
	max-width: 70%;
	text-align: right;
	word-break: break-all;
}

.remark-toggle {
	border: none;
	padding: 0;
	background: transparent;
	color: #1989fa;
	font-size: 12px;
}
```

淇濈暀鏃㈡湁 `.gift-person-detail { box-sizing: border-box; ... }`銆?

- [ ] **Step 5: Manual smoke**

1. 鎵撳紑鏈夋墜鏈哄彿鐨勮仈绯讳汉璇︽儏锛氶粯璁よ `182 **** 2222`锛屾棤鏄庢枃銆?
2. 鐐圭溂鐫?鈫?鏄庢枃锛涘啀鐐?鈫?鑴辨晱銆?
3. 鐐瑰鍒?鈫?toast銆屽凡澶嶅埗銆嶃€?
4. 寰€鏉ュ巻鍙叉椂闂存棤 `T`銆?
5. 澶囨敞 >60 瀛楀彲灞曞紑/鏀惰捣锛涚煭澶囨敞鏃犳寜閽€?

- [ ] **Step 6: Lint + unit tests**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/config.ts"
```

Expected: PASS / 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "feat(gift): privacy-friendly person detail profile header"
```

---


