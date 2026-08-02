import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrgInfo from '@/views/user/orgInfo/index.vue';
import { deleteOrgInfo, getOrgInfoPage } from '@/views/user/orgInfo/api';

const push = vi.fn();

vi.mock('vue-router', () => ({
	useRouter: () => ({ push }),
	useRoute: () => ({ meta: { title: '机构管理' } }),
}));

vi.mock('@/composables/useNavBar', () => ({
	useNavBar: vi.fn(),
}));

vi.mock('@/views/user/orgInfo/api', () => ({
	getOrgInfoPage: vi.fn(),
	deleteOrgInfo: vi.fn().mockResolvedValue({ code: '200', message: 'delete success' }),
}));

vi.mock('@/views/user/userManager/api', () => ({
	getUserManagerList: vi.fn().mockResolvedValue({ code: '200', data: [] }),
}));

vi.mock('vant', () => ({
	showFailToast: vi.fn(),
	showSuccessToast: vi.fn(),
	showConfirmDialog: vi.fn().mockResolvedValue(true),
}));

const ButtonStub = {
	inheritAttrs: false,
	template: '<button :data-testid="$attrs[\'data-testid\']" type="button" @click="$emit(\'click\', $event)"><slot>{{ text }}</slot></button>',
	props: ['text'],
};

const InputStub = {
	template: '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'search\')" />',
	props: ['modelValue'],
};

const CommonListStub = {
	template: '<section v-bind="$attrs"><slot name="skeleton" /><slot name="empty" /><slot /></section>',
	props: ['loading', 'refreshing', 'finished', 'isEmpty'],
};

function mountOrgInfo() {
	return mount(OrgInfo, {
		global: {
			stubs: {
				'van-button': ButtonStub,
				'van-search': InputStub,
				'van-field': InputStub,
				'van-tag': { template: '<span><slot /></span>' },
				'van-cell': { template: '<div v-bind="$attrs"><slot /><slot name="title" /><slot name="label" /><slot name="right-icon" /></div>' },
				'van-cell-group': { template: '<div><slot /></div>' },
				'van-checkbox': { template: '<input v-bind="$attrs" type="checkbox" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
				'van-divider': { template: '<div><slot /></div>' },
				'van-empty': { template: '<div v-bind="$attrs">empty</div>' },
				'van-skeleton': { template: '<div v-bind="$attrs">skeleton</div>' },
				'van-swipe-cell': { template: '<section><slot /><slot name="right" /></section>' },
				'van-back-top': { template: '<div />' },
				'common-pull-refresh': { template: '<section><slot /></section>' },
				'common-list': CommonListStub,
			},
		},
	});
}

describe('OrgInfo page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getOrgInfoPage).mockResolvedValue({
			code: '200',
			message: 'success',
			data: {
				records: [
					{
						id: '1',
						orgCode: 'HQ',
						orgName: 'Headquarters',
						orgShortName: 'HQ',
						parentId: '0',
						parentOrgName: 'Root',
						status: '1',
					},
					{
						id: '2',
						orgCode: 'TECH',
						orgName: 'Tech Center',
						orgShortName: 'Tech',
						parentId: '1',
						parentOrgName: 'Headquarters',
						status: '1',
					},
				],
				total: 2,
			},
		});
	});

	it('renders management buttons from the Stitch org management prototype', async () => {
		const wrapper = mountOrgInfo();
		await flushPromises();

		expect(wrapper.get('[data-testid="org-search-button"]').text()).toContain('查询');
		expect(wrapper.get('[data-testid="org-reset-button"]').text()).toContain('重置');
		expect(wrapper.get('[data-testid="org-add-button"]').text()).toContain('新增机构');
		expect(wrapper.get('[data-testid="org-batch-enable-button"]').text()).toContain('批量启用');
		expect(wrapper.get('[data-testid="org-batch-disable-button"]').text()).toContain('批量禁用');
		expect(wrapper.get('[data-testid="org-drag-sort-button"]').text()).toContain('层级排序');
		expect(wrapper.get('[data-testid="org-expand-all-button"]').text()).toMatch(/展开全部|收起全部/);
	});

	it('covers toolbar buttons: add, batch actions, sorting, and expand toggle', async () => {
		const wrapper = mountOrgInfo();
		await flushPromises();

		await wrapper.get('[data-testid="org-add-button"]').trigger('click');
		await wrapper.get('[data-testid="org-batch-enable-button"]').trigger('click');
		await wrapper.get('[data-testid="org-batch-disable-button"]').trigger('click');
		await wrapper.get('[data-testid="org-drag-sort-button"]').trigger('click');
		await wrapper.get('[data-testid="org-expand-all-button"]').trigger('click');

		expect(push).toHaveBeenCalledWith({ path: '/user/orgInfo/orgInfoDetail' });
	});

	it('loads org tree and refreshes when search and reset buttons are clicked', async () => {
		const wrapper = mountOrgInfo();
		await flushPromises();

		expect(getOrgInfoPage).toHaveBeenCalledTimes(1);
		expect(wrapper.text()).toContain('Headquarters');
		expect(wrapper.text()).toContain('Tech Center');

		await wrapper.get('[data-testid="org-search-button"]').trigger('click');
		await flushPromises();
		await wrapper.get('[data-testid="org-reset-button"]').trigger('click');
		await flushPromises();

		expect(getOrgInfoPage).toHaveBeenCalledTimes(3);
	});

	it('covers row buttons: expand, add child, edit, delete, and selection', async () => {
		const wrapper = mountOrgInfo();
		await flushPromises();

		await wrapper.get('[data-testid="org-row-expand-1"]').trigger('click');
		await wrapper.get('[data-testid="org-row-select-1"]').setValue(true);
		await wrapper.get('[data-testid="org-row-add-child-1"]').trigger('click');
		await wrapper.get('[data-testid="org-row-edit-1"]').trigger('click');
		await wrapper.get('[data-testid="org-row-delete-1"]').trigger('click');
		await flushPromises();

		expect(push).toHaveBeenCalledWith({ path: '/user/orgInfo/orgInfoDetail', query: { parentId: '1', parentName: 'Headquarters' } });
		expect(push).toHaveBeenCalledWith({ path: '/user/orgInfo/orgInfoDetail', query: { id: '1' } });
		expect(deleteOrgInfo).toHaveBeenCalledWith('1');
	});
});
