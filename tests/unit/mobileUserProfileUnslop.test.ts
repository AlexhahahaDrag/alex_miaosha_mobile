import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('移动端「我的」页面 unslop 与 Soft UI 契约校验', () => {
	it('应消除双顶栏、失效外链头像、空壳假入口与同义反复文案，并保留核心 testid', () => {
		const userSource = fs.readFileSync(
			path.resolve(process.cwd(), 'src/views/user/index.vue'),
			'utf-8',
		);

		// 核心自动化测试标识保留
		expect(userSource).toContain('data-testid="rbac-user-name"');
		expect(userSource).toContain('data-testid="rbac-user-entry-profile"');
		expect(userSource).toContain('data-testid="rbac-user-btn-theme"');
		expect(userSource).toContain('data-testid="rbac-user-entry-notice-config"');
		expect(userSource).toContain('data-testid="rbac-user-btn-logout"');

		// 头像防破图兜底与骨架屏
		expect(userSource).toContain('data-testid="user-avatar-fallback"');
		expect(userSource).toContain('data-testid="user-profile-skeleton"');
		expect(userSource).not.toContain('img.yzcdn.cn');

		// unslop: 清除重复顶栏、空壳假入口与失实/同义反复文案
		expect(userSource).not.toContain('hero-header');
		expect(userSource).not.toContain('管理平台所有功能与数据');
		expect(userSource).not.toContain('管理您的个人资料');
		expect(userSource).not.toContain('选择您喜欢的主题风格');
		expect(userSource).not.toContain('功能即将上线');
		expect(userSource).not.toContain('关于系统');
		expect(userSource).not.toContain('帮助与反馈');
		expect(userSource).not.toContain('val-arrow');
	});
});
