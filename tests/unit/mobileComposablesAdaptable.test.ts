import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, effectScope, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useNavBar, type NavBarConfig } from '@/composables/useNavBar';
import { useNavBarStore } from '@/store/modules/navbar';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';

vi.mock('@/views/finance/gift/event/api', () => ({
	getGiftEventTypeOptions: vi
		.fn()
		.mockResolvedValue({ code: '200', data: { presets: [], customs: [] } }),
}));

vi.mock('@/views/finance/gift/person/api', () => ({
	getGiftPersonRelationOptions: vi
		.fn()
		.mockResolvedValue({ code: '200', data: { presets: [], customs: [] } }),
}));

describe('移动端业务 Composables 现代化与生命周期闭环测试 (vuejs-skills)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	describe('1. useNavBar 响应式配置同步与生命周期闭环 (onScopeDispose)', () => {
		it('支持静态 NavBarConfig 初始配置同步', () => {
			const store = useNavBarStore();
			useNavBar({ title: '随礼明细', rightButton: '导出' });

			expect(store.info.title).toBe('随礼明细');
			expect(store.info.rightButton).toBe('导出');
		});

		it('支持 Ref<NavBarConfig> 响应式动态配置联动', async () => {
			const store = useNavBarStore();
			const configRef = ref<NavBarConfig>({ title: '记账本', rightButton: '保存' });

			useNavBar(configRef);
			expect(store.info.title).toBe('记账本');

			// 动态修改响应式配置
			configRef.value = { title: '编辑账单', rightButton: '完成' };
			await nextTick();

			expect(store.info.title).toBe('编辑账单');
			expect(store.info.rightButton).toBe('完成');
		});

		it('作用域销毁时 (onScopeDispose) 自动清理 rightClickHandler 杜绝悬挂内存泄漏', () => {
			const store = useNavBarStore();
			const onSave = vi.fn();

			const scope = effectScope();
			scope.run(() => {
				useNavBar({ title: '新建账单', onRightClick: onSave });
			});

			expect(store.rightClickHandler).toBe(onSave);

			// 模拟组件销毁，触发 scope 垃圾回收
			scope.stop();

			expect(store.rightClickHandler).toBeNull();
		});
	});

	describe('2. 移动端随礼 Hooks 多态入参 (MaybeRefOrGetter) 支持', () => {
		it('useGiftEventTypeOptions isPresetEventType 支持 Ref 与 Getter', () => {
			const { isPresetEventType, eventLabel } = useGiftEventTypeOptions();

			const eventRef = ref('WEDDING');
			expect(isPresetEventType(eventRef)).toBe(true);
			expect(eventLabel(eventRef)).toBe('婚礼');

			const getter = () => 'BIRTH';
			expect(isPresetEventType(getter)).toBe(true);
			expect(eventLabel(getter)).toBe('满月');
		});

		it('useGiftRelationOptions isPresetRelationType 支持 Ref 与 Getter', () => {
			const { isPresetRelationType, relationLabel } = useGiftRelationOptions();

			const relRef = ref('RELATIVE');
			expect(isPresetRelationType(relRef)).toBe(true);
			expect(relationLabel(relRef)).toBe('亲属');

			const getter = () => 'FRIEND';
			expect(isPresetRelationType(getter)).toBe(true);
			expect(relationLabel(getter)).toBe('朋友');
		});
	});
});
