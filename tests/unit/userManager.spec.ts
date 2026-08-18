import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserManager from '@/views/user/userManager/index.vue';
import { getUserManagerPage } from '@/views/user/userManager/api';

vi.mock('@/composables/useNavBar', () => ({
	useNavBar: vi.fn(),
}));

vi.mock('@/views/user/userManager/api', () => ({
	getUserManagerPage: vi.fn(),
	deleteUserManager: vi.fn().mockResolvedValue({ code: '200', message: '删除成功' }),
	editUserManager: vi.fn().mockResolvedValue({ code: '200', message: '保存成功' }),
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
	template: '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
	props: ['modelValue'],
};

const DrawerStub = {
	template: '<section v-if="show" v-bind="$attrs"><slot /><slot name="footer" /></section>',
	props: ['show', 'title', 'position', 'size'],
};

const CommonListStub = {
	template: '<section v-bind="$attrs"><slot name="skeleton" /><slot name="empty" /><slot /></section>',
	props: ['loading', 'refreshing', 'finished', 'isEmpty'],
};

function mountUserManager() {
	return mount(UserManager, {
		global: {
			stubs: {
				'van-button': ButtonStub,
				'van-search': InputStub,
				'van-field': InputStub,
				'van-tag': { template: '<span><slot /></span>' },
				'van-image': { template: '<img v-bind="$attrs" />' },
				'van-checkbox': { template: '<input v-bind="$attrs" type="checkbox" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
				'van-popup': DrawerStub,
				'van-empty': { template: '<div v-bind="$attrs">empty</div>' },
				'van-skeleton': { template: '<div v-bind="$attrs">skeleton</div>' },
				'common-pull-refresh': { template: '<section><slot /></section>' },
				'common-list': CommonListStub,
			},
		},
	});
}

describe('UserManager page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getUserManagerPage).mockResolvedValue({
			code: '200',
			message: 'success',
			data: {
				records: [
					{
						id: 1,
						username: 'zhangsan',
						nickName: '张三',
						orgName: '技术部',
						orgPath: '集团总部 / 技术部',
						roleNames: ['店长', '财务'],
						userStatus: '0',
						phone: '13800000000',
						lastLoginTime: '2026-05-18 09:30:00',
						updateTime: '2026-05-18 10:15:00',
					},
				],
				total: 1,
			},
		});
	});

	it('renders management buttons from the Stitch user management prototype', async () => {
		const wrapper = mountUserManager();
		await flushPromises();

		expect(wrapper.get('[data-testid="user-search-button"]').text()).toContain('查询');
		expect(wrapper.get('[data-testid="user-reset-button"]').text()).toContain('重置');
		expect(wrapper.get('[data-testid="user-add-button"]').text()).toContain('添加用户');
		expect(wrapper.get('[data-testid="user-batch-enable-button"]').text()).toContain('批量启用');
		expect(wrapper.get('[data-testid="user-batch-disable-button"]').text()).toContain('批量禁用');
		expect(wrapper.get('[data-testid="user-assign-role-button"]').text()).toContain('分配角色');
	});

	it('loads users with correct page data and refreshes when search and reset buttons are clicked', async () => {
		const wrapper = mountUserManager();
		await flushPromises();

		expect(getUserManagerPage).toHaveBeenCalledTimes(1);
		expect(wrapper.text()).toContain('zhangsan');
		expect(wrapper.text()).toContain('张三');
		expect(wrapper.text()).toContain('13800000000');
		expect(wrapper.text()).toContain('集团总部 / 技术部');
		expect(wrapper.text()).toContain('店长');
		expect(wrapper.text()).toContain('财务');
		expect(wrapper.text()).toContain('启用');
		expect(wrapper.text()).toContain('最后登录：2026-05-18 09:30:00');
		expect(wrapper.text()).toContain('更新时间：2026-05-18 10:15:00');
		expect(wrapper.text()).toContain('技术部用户列表');
		expect(wrapper.text()).toContain('1 人');
		expect(wrapper.text()).toContain('权限变更预览');

		await wrapper.get('[data-testid="user-search-button"]').trigger('click');
		await flushPromises();
		await wrapper.get('[data-testid="user-reset-button"]').trigger('click');
		await flushPromises();

		expect(getUserManagerPage).toHaveBeenCalledTimes(3);
	});

	it('opens role assignment drawer and validates selected user data', async () => {
		const wrapper = mountUserManager();
		await flushPromises();

		await wrapper.get('[data-testid="row-assign-role-1"]').trigger('click');
		expect(wrapper.text()).toContain('角色分配');
		expect(wrapper.text()).toContain('张三');
		expect(wrapper.text()).toContain('已分配角色');
		expect(wrapper.text()).toContain('权限变更预览');
		expect(wrapper.text()).toContain('店长');
		expect(wrapper.text()).toContain('财务');

		await wrapper.get('[data-testid="role-drawer-save-button"]').trigger('click');
		await wrapper.get('[data-testid="row-assign-role-1"]').trigger('click');
		await wrapper.get('[data-testid="role-drawer-cancel-button"]').trigger('click');

		expect(wrapper.find('[data-testid="role-drawer-save-button"]').exists()).toBe(false);
	});
});
