import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RolePermissionInfo from '@/views/user/rolePermissionInfo/index.vue';
import {
	addRolePermissionInfo,
	deleteRolePermissionInfo,
	getRolePermissionInfoPage,
} from '@/views/user/rolePermissionInfo/api';

const push = vi.fn();

vi.mock('vue-router', () => ({
	useRouter: () => ({ push }),
	useRoute: () => ({ meta: { title: '角色权限分配' } }),
}));

vi.mock('@/composables/useNavBar', () => ({
	useNavBar: vi.fn(),
}));

vi.mock('@/views/user/rolePermissionInfo/api', () => ({
	getRolePermissionInfoPage: vi.fn(),
	deleteRolePermissionInfo: vi.fn().mockResolvedValue({ code: '200', message: 'delete success' }),
	addRolePermissionInfo: vi.fn().mockResolvedValue({ code: '200', message: 'save success' }),
}));

vi.mock('@/views/user/userManager/api', () => ({
	getUserManagerList: vi.fn().mockResolvedValue({ code: '200', data: [] }),
}));

vi.mock('vant', () => ({
	showFailToast: vi.fn(),
	showSuccessToast: vi.fn(),
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

function mountRolePermissionInfo() {
	return mount(RolePermissionInfo, {
		global: {
			stubs: {
				'van-button': ButtonStub,
				'van-search': InputStub,
				'van-field': InputStub,
				'van-tag': { template: '<span><slot /></span>' },
				'van-checkbox': { template: '<input v-bind="$attrs" type="checkbox" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
				'van-divider': { template: '<div><slot /></div>' },
				'van-empty': { template: '<div v-bind="$attrs">empty</div>' },
				'van-skeleton': { template: '<div v-bind="$attrs">skeleton</div>' },
				'van-back-top': { template: '<div />' },
				'common-pull-refresh': { template: '<section><slot /></section>' },
				'common-list': CommonListStub,
			},
		},
	});
}

describe('RolePermissionInfo page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getRolePermissionInfoPage).mockResolvedValue({
			code: '200',
			message: 'success',
			data: {
				records: [
					{
						id: '1',
						roleId: 'admin',
						roleName: 'Admin',
						permissionId: 'menu:user',
						permissionName: 'User Menu',
						permissionCode: 'user:view',
						status: '1',
					},
				],
				total: 1,
			},
		});
	});

	it('renders toolbar buttons from the Stitch role permission prototype', async () => {
		const wrapper = mountRolePermissionInfo();
		await flushPromises();

		expect(wrapper.get('[data-testid="role-permission-search-button"]').text()).toContain('查询');
		expect(wrapper.get('[data-testid="role-permission-reset-button"]').text()).toContain('重置');
		expect(wrapper.get('[data-testid="role-permission-add-button"]').text()).toContain('新增关联');
		expect(wrapper.get('[data-testid="role-permission-batch-grant-button"]').text()).toContain('批量授权');
		expect(wrapper.get('[data-testid="role-permission-batch-remove-button"]').text()).toContain('批量移除');
		expect(wrapper.get('[data-testid="role-permission-preview-button"]').text()).toContain('权限预览');
		expect(wrapper.get('[data-testid="role-permission-refresh-cache-button"]').text()).toContain('刷新缓存');
		expect(wrapper.get('[data-testid="role-permission-save-button"]').text()).toContain('保存提交');
	});

	it('loads permission assignments and refreshes on search and reset', async () => {
		const wrapper = mountRolePermissionInfo();
		await flushPromises();

		expect(getRolePermissionInfoPage).toHaveBeenCalledTimes(1);
		expect(wrapper.text()).toContain('Admin');
		expect(wrapper.text()).toContain('User Menu');

		await wrapper.get('[data-testid="role-permission-search-button"]').trigger('click');
		await flushPromises();
		await wrapper.get('[data-testid="role-permission-reset-button"]').trigger('click');
		await flushPromises();

		expect(getRolePermissionInfoPage).toHaveBeenCalledTimes(3);
	});

	it('covers row buttons and save submission flow', async () => {
		const wrapper = mountRolePermissionInfo();
		await flushPromises();

		await wrapper.get('[data-testid="role-permission-row-select-1"]').setValue(true);
		await wrapper.get('[data-testid="role-permission-row-preview-1"]').trigger('click');
		await wrapper.get('[data-testid="role-permission-row-edit-1"]').trigger('click');
		await wrapper.get('[data-testid="role-permission-row-delete-1"]').trigger('click');
		await flushPromises();
		await wrapper.get('[data-testid="role-permission-save-button"]').trigger('click');
		await flushPromises();

		expect(deleteRolePermissionInfo).toHaveBeenCalledWith('1');
		expect(addRolePermissionInfo).toHaveBeenCalled();
		expect(push).toHaveBeenCalledWith({ path: '/user/rolePermissionInfo/rolePermissionInfoDetail', query: { id: '1' } });
	});
});
