<template>
	<div class="gift-person-profile-view">
		<section class="profile-hero">
			<div class="profile-hero__wash" />
			<div class="profile-hero__card">
				<div class="avatar">
					<img
						v-if="profileAvatarUrl"
						class="avatar-img"
						:src="profileAvatarUrl"
						alt=""
					/>
					<template v-else>{{ firstName(profile.person?.personName) }}</template>
				</div>
				<strong class="profile-hero__name">{{ profile.person?.personName || '-' }}</strong>
				<p class="profile-hero__sub">
					{{ relationLabel(profile.person?.relationType) }}
					<template v-if="hasPhone"> · {{ displayPhone }}</template>
					<template v-else> · -</template>
				</p>
				<div
					v-if="remarkText"
					class="profile-hero__remark"
				>
					<span>{{ displayRemark }}</span>
					<button
						v-if="remarkCollapsible"
						type="button"
						class="remark-toggle"
						data-testid="gift-person-remark-toggle"
						:aria-label="remarkExpanded ? '收起备注' : '展开备注'"
						@click="remarkExpanded = !remarkExpanded"
					>
						{{ remarkExpanded ? '收起' : '展开' }}
					</button>
				</div>
				<div
					v-if="hasPhone"
					class="capsule-bar"
				>
					<button
						type="button"
						class="capsule-btn"
						data-testid="gift-person-phone-toggle"
						:aria-label="phoneVisible ? '隐藏手机号' : '显示手机号'"
						@click="togglePhoneVisible"
					>
						<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
						<span>显隐</span>
					</button>
					<button
						type="button"
						class="capsule-btn"
						data-testid="gift-person-phone-call"
						aria-label="拨打电话"
						@click="callPhone"
					>
						<van-icon name="phone-o" />
						<span>电话</span>
					</button>
					<button
						type="button"
						class="capsule-btn"
						data-testid="gift-person-phone-copy"
						aria-label="复制手机号"
						@click="copyPhone"
					>
						<van-icon name="records" />
						<span>复制</span>
					</button>
				</div>
			</div>
		</section>

		<section class="profile-metrics">
			<div class="metric-card metric-card--give">
				<span>累计送礼</span>
				<strong> <small>￥</small>{{ metricNumber(profile.person?.totalGiveAmount) }} </strong>
			</div>
			<div class="metric-card metric-card--recv">
				<span>累计收礼</span>
				<strong> <small>￥</small>{{ metricNumber(profile.person?.totalReceiveAmount) }} </strong>
			</div>
		</section>

		<section class="history-block">
			<h3>往来历史</h3>
			<div
				v-if="!(profile.records || []).length"
				class="profile-empty"
			>
				暂无往来记录
			</div>
			<div
				v-for="item in profile.records || []"
				:key="item.id"
				class="history-card"
			>
				<div
					class="history-card__icon"
					:class="directionClass(item.direction)"
				>
					<van-icon :name="directionIconName(item.direction)" />
				</div>
				<div class="history-card__body">
					<strong>{{ directionText(item.direction) }}</strong>
					<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
				</div>
				<strong
					class="history-card__amount"
					:class="directionClass(item.direction)"
				>
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
				@click="emit('edit')"
			>
				编辑资料
			</van-button>
			<button
				v-if="hasPermission('gift:delete')"
				type="button"
				class="btn-delete-text"
				data-testid="gift-person-delete"
				:disabled="deleting"
				@click="emit('delete')"
			>
				{{ deleting ? '删除中…' : '删除联系人' }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { usePermission } from '@/composables/usePermission';
import { formatTime, dataTimeFormat } from '@/utils/dayjs';
import type { GiftPersonProfile } from '@/views/finance/gift/config';
import {
	collapseRemark,
	directionClass,
	directionIconName,
	directionText,
	formatSignedMoney,
	maskPhone,
	personAvatarSrc,
	shouldCollapseRemark,
} from '@/views/finance/gift/config';

const props = withDefaults(
	defineProps<{
		profile: GiftPersonProfile;
		relationLabel: (relationType?: number | string) => string;
		deleting?: boolean;
	}>(),
	{
		deleting: false,
	},
);

const emit = defineEmits<{
	(e: 'edit'): void;
	(e: 'delete'): void;
}>();

const { hasPermission } = usePermission();

const phoneVisible = ref<boolean>(false);
const remarkExpanded = ref<boolean>(false);

const rawPhone = computed(() => props.profile.person?.phone?.trim() || '');
const hasPhone = computed(() => !!rawPhone.value);
const displayPhone = computed(() => {
	if (!rawPhone.value) return '-';
	return phoneVisible.value ? rawPhone.value : maskPhone(rawPhone.value) || rawPhone.value;
});

const remarkText = computed(() => props.profile.person?.remark?.trim() || '');
const remarkCollapsible = computed(() => shouldCollapseRemark(remarkText.value));
const displayRemark = computed(() => {
	if (!remarkText.value) return '-';
	if (!remarkCollapsible.value || remarkExpanded.value) return remarkText.value;
	return collapseRemark(remarkText.value);
});

/** 详情 Hero：缩略图优先，否则原图 */
const profileAvatarUrl = computed(() => personAvatarSrc(props.profile.person));

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const metricNumber = (value?: number | string) => Number(value || 0).toFixed(2);

const formatPayTime = (payTime?: string) => {
	if (!payTime) return '-';
	return formatTime(payTime, dataTimeFormat) || '-';
};

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
		showSuccessToast('已复制');
	} catch {
		showFailToast('复制失败');
	}
};
</script>

<style scoped lang="less">
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
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2563eb;
	background: #eff6ff;
	font-weight: 800;
	font-size: 24px;
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
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
	margin-top: 16px;
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
	color: #64748b;
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
		color: #2563eb;
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
	/* 微红灰：可读性优于纯浅灰，危险感仍克制 */
	color: rgba(153, 27, 27, 0.55);
	font-size: 14px;
	cursor: pointer;

	&:active {
		color: #991b1b;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
</style>
