### Task 2: Profile template + styles redesign

**Files:**

- Modify: `src/views/finance/gift/person/giftPersonDetail/index.vue`

**Interfaces:**

- Consumes: Task 1 helpers锛涚幇鏈?`maskPhone`/remark/phone actions 涓嶅彉
- Produces: Spec 搂4 UI

- [ ] **Step 1: Update imports from config**

澧炲姞锛歚formatSignedMoney`, `directionIconName`銆?

- [ ] **Step 2: Replace profile template block**

鐢ㄤ笅鍒楃粨鏋勬浛鎹?`v-if="isProfileMode"` 鍐呭唴瀹癸紙淇濈暀鎵€鏈?phone/remark 鏂规硶涓?computed锛夛細

```vue
<template v-if="isProfileMode">
	<section class="profile-hero">
		<div class="profile-hero__wash" />
		<div class="profile-hero__card">
			<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
			<strong class="profile-hero__name">{{ profile.person?.personName || '-' }}</strong>
			<p class="profile-hero__sub">
				{{ relationLabel(profile.person?.relationType) }}
				<template v-if="hasPhone"> 路 {{ displayPhone }}</template>
				<template v-else> 路 -</template>
			</p>
			<div v-if="remarkText" class="profile-hero__remark">
				<span>{{ displayRemark }}</span>
				<button
					v-if="remarkCollapsible"
					type="button"
					class="remark-toggle"
					data-testid="gift-person-remark-toggle"
					:aria-label="remarkExpanded ? '鏀惰捣澶囨敞' : '灞曞紑澶囨敞'"
					@click="remarkExpanded = !remarkExpanded"
				>
					{{ remarkExpanded ? '鏀惰捣' : '灞曞紑' }}
				</button>
			</div>
			<div v-if="hasPhone" class="capsule-bar">
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-toggle"
					:aria-label="phoneVisible ? '闅愯棌鎵嬫満鍙? : '鏄剧ず鎵嬫満鍙?"
					@click="togglePhoneVisible"
				>
					<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
					<span>鏄鹃殣</span>
				</button>
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-call"
					aria-label="鎷ㄦ墦鐢佃瘽"
					@click="callPhone"
				>
					<van-icon name="phone-o" />
					<span>鐢佃瘽</span>
				</button>
				<button
					type="button"
					class="capsule-btn"
					data-testid="gift-person-phone-copy"
					aria-label="澶嶅埗鎵嬫満鍙?
					@click="copyPhone"
				>
					<van-icon name="records" />
					<span>澶嶅埗</span>
				</button>
			</div>
		</div>
	</section>

	<section class="profile-metrics">
		<div class="metric-card metric-card--give">
			<span>绱閫佺ぜ</span>
			<strong> <small>锟?/small>{{ metricNumber(profile.person?.totalGiveAmount) }} </strong>
		</div>
		<div class="metric-card metric-card--recv">
			<span>绱鏀剁ぜ</span>
			<strong> <small>锟?/small>{{ metricNumber(profile.person?.totalReceiveAmount) }} </strong>
		</div>
	</section>

	<section class="history-block">
		<h3>寰€鏉ュ巻鍙?/h3>
		<div v-if="!(profile.records || []).length" class="profile-empty"> 鏆傛棤寰€鏉ヨ褰?</div>
		<div v-for="item in profile.records || []" :key="item.id" class="history-card">
			<div class="history-card__icon" :class="directionClass(item.direction)">
				<van-icon :name="directionIconName(item.direction)" />
			</div>
			<div class="history-card__body">
				<strong>{{ directionText(item.direction) }}</strong>
				<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
			</div>
			<strong class="history-card__amount" :class="directionClass(item.direction)">
				{{ formatSignedMoney(item.direction, item.amount) }}
			</strong>
		</div>
	</section>

	<div class="detail-actions">
		<van-button
			v-if="hasPermission('gift:edit')"
			block
			round
			class="btn-edit"
			data-testid="gift-person-edit"
			@click="openEdit"
		>
			缂栬緫璧勬枡
		</van-button>
		<button
			v-if="hasPermission('gift:delete')"
			type="button"
			class="btn-delete-text"
			data-testid="gift-person-delete"
			:disabled="deleting"
			@click="removePerson"
		>
			{{ deleting ? '鍒犻櫎涓€? : '鍒犻櫎鑱旂郴浜? }}
		</button>
	</div>
</template>
```

- [ ] **Step 3: Add metricNumber helper in script**

```ts
import {
	directionClass,
	directionIconName,
	formatSignedMoney /* existing */,
} from '@/views/finance/gift/config';

const metricNumber = (value?: number | string) => Number(value || 0).toFixed(2);
```

- [ ] **Step 4: Update delete confirm copy**

```ts
await showConfirmDialog({ title: '纭鍒犻櫎璇ヨ仈绯讳汉锛? });
```

- [ ] **Step 5: Replace profile-related styles**

淇濈暀 form 鐩稿叧鏍峰紡涓嶅姩銆傚皢 profile 鏍峰紡鏀逛负锛堟牳蹇冪墖娈碉紝鍙暣娈垫浛鎹㈡棫 `.profile-*` / `.detail-actions` profile 鐢ㄩ€旓級锛?

```less
.gift-person-detail {
	--gp-bg: #f8fafc;
	--gp-card: #ffffff;
	--gp-radius: 20px;
	--gp-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	--gp-give-bg: #fff5f5;
	--gp-give-fg: #e53e3e;
	--gp-recv-bg: #f0fdf4;
	--gp-recv-fg: #15803d;
	--gp-primary-from: #2563eb;
	--gp-primary-to: #3b82f6;

	box-sizing: border-box;
	min-height: 100%;
	padding: 12px 16px 28px;
	background: var(--gp-bg);
}

.profile-hero {
	position: relative;
	margin-bottom: 14px;
}

.profile-hero__wash {
	position: absolute;
	inset: 0 0 40% 0;
	border-radius: var(--gp-radius);
	background: linear-gradient(180deg, #dbeafe 0%, rgba(248, 250, 252, 0) 100%);
	pointer-events: none;
}

.profile-hero__card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28px 16px 18px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);
}

.avatar {
	width: 64px;
	height: 64px;
	margin-bottom: 12px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2563eb;
	background: #eff6ff;
	font-weight: 800;
	font-size: 24px;
}

.profile-hero__name {
	color: #0f172a;
	font-size: 20px;
}

.profile-hero__sub {
	margin: 6px 0 0;
	color: #64748b;
	font-size: 13px;
}

.profile-hero__remark {
	margin-top: 10px;
	max-width: 100%;
	text-align: center;
	color: #94a3b8;
	font-size: 12px;
	line-height: 1.5;
	word-break: break-all;
}

.capsule-bar {
	display: flex;
	justify-content: center;
	gap: 18px;
	margin-top: 18px;
	width: 100%;
}

.capsule-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	min-width: 56px;
	padding: 0;
	border: none;
	background: transparent;
	color: #2563eb;
	font-size: 11px;
	cursor: pointer;

	.van-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 999px;
		background: #eff6ff;
		font-size: 20px;
	}

	&:active {
		transform: scale(0.96);
	}
}

.profile-metrics {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-bottom: 14px;
}

.metric-card {
	padding: 14px 16px;
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	span {
		display: block;
		color: #64748b;
		font-size: 12px;
	}

	strong {
		display: block;
		margin-top: 8px;
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.02em;

		small {
			margin-right: 2px;
			font-size: 13px;
			font-weight: 600;
		}
	}

	&--give {
		background: var(--gp-give-bg);
		strong {
			color: var(--gp-give-fg);
		}
	}

	&--recv {
		background: var(--gp-recv-bg);
		strong {
			color: var(--gp-recv-fg);
		}
	}
}

.history-block {
	padding: 14px 16px 8px;
	margin-bottom: 14px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	h3 {
		margin: 0 0 10px;
		font-size: 15px;
		color: #0f172a;
	}
}

.history-card {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 0;
	border-top: 1px solid #f1f5f9;

	&:first-of-type {
		border-top: none;
	}
}

.history-card__icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: #f1f5f9;
	color: #64748b;
	flex-shrink: 0;

	&.is-income {
		background: var(--gp-recv-bg);
		color: var(--gp-recv-fg);
	}

	&.is-give,
	&.is-return {
		background: var(--gp-give-bg);
		color: var(--gp-give-fg);
	}
}

.history-card__body {
	flex: 1;
	min-width: 0;

	strong {
		display: block;
		color: #0f172a;
		font-size: 14px;
	}

	p {
		margin: 4px 0 0;
		color: #94a3b8;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.history-card__amount {
	flex-shrink: 0;
	font-size: 15px;
	font-weight: 700;

	&.is-income {
		color: var(--gp-recv-fg);
	}
	&.is-give,
	&.is-return {
		color: var(--gp-give-fg);
	}
}

.profile-empty {
	padding: 16px 0 20px;
	color: #94a3b8;
	font-size: 13px;
	text-align: center;
}

.detail-actions {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 8px 0 12px;
	padding-bottom: env(safe-area-inset-bottom, 0);
}

.btn-edit {
	border: none;
	background: linear-gradient(90deg, var(--gp-primary-from), var(--gp-primary-to));
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
}

.btn-delete-text {
	border: none;
	padding: 10px;
	background: transparent;
	color: #9ca3af;
	font-size: 14px;
	cursor: pointer;

	&:active {
		color: #ef4444;
	}

	&:disabled {
		opacity: 0.6;
	}
}

.remark-toggle {
	border: none;
	margin-left: 6px;
	padding: 0;
	background: transparent;
	color: #2563eb;
	font-size: 12px;
}
```

鍒犻櫎宸叉棤鐢ㄧ殑鏃?class锛歚.profile-head`銆乣.profile-block`锛堣嫢 form 鏈敤锛夈€佹棫 `.icon-btn` 绛夛紝閬垮厤姝绘牱寮忓爢绉€?

- [ ] **Step 6: Lint + unit**

```bash
npm run test:unit -- src/views/finance/gift/config.spec.ts
npx eslint --max-warnings=0 "src/views/finance/gift/person/giftPersonDetail/index.vue" "src/views/finance/gift/config.ts"
```

- [ ] **Step 7: Manual smoke**

1. Profile锛欻ero/鑳跺泭/Bento/娴佹按鍗?娓愬彉缂栬緫/鏂囧瓧鍒犻櫎鍙銆?
2. 闅愮锛氶粯璁よ劚鏁忋€佹樉闅愩€佸鍒?toast銆佹椂闂存棤 `T`銆?
3. 鍒犻櫎浠嶅脊纭銆?
4. 鏃犮€屽叏閮ㄣ€嶃€?
5. 琛ㄥ崟鏂板/缂栬緫浠嶅彲鐢ㄣ€?

- [ ] **Step 8: Commit**

```bash
git add src/views/finance/gift/person/giftPersonDetail/index.vue
git commit -m "feat(gift): redesign person detail profile visuals"
```

---


