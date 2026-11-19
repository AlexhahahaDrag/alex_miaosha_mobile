import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('移动端登录页 unslop 与标准属性契约校验', () => {
	it('应保留核心 data-testid、补全 autocomplete 属性并清除空壳按钮与 AI 套话', () => {
		const loginSource = fs.readFileSync(
			path.resolve(process.cwd(), 'src/views/login/index.vue'),
			'utf-8',
		);

		// 核心自动化测试标识保留
		expect(loginSource).toContain('data-testid="mobile-login-username"');
		expect(loginSource).toContain('data-testid="mobile-login-password"');
		expect(loginSource).toContain('data-testid="mobile-login-submit"');

		// 浏览器原生自动填充规范
		expect(loginSource).toContain('autocomplete="username"');
		expect(loginSource).toContain('autocomplete="current-password"');

		// unslop: 清除 AI 套话、空壳按钮与无用装饰层
		expect(loginSource).not.toContain('企业级通用管理终端');
		expect(loginSource).not.toContain('保留所有权利');
		expect(loginSource).not.toContain('安全登录');
		expect(loginSource).not.toContain('忘记密码？');
		expect(loginSource).not.toContain('注册账号');
		expect(loginSource).not.toContain('隐私政策');
		expect(loginSource).not.toContain('ambient-orb');
		expect(loginSource).not.toContain('hero-backdrop');
		expect(loginSource).toContain('Alex 管理平台');
		expect(loginSource).toContain('© 2026 Alex');
		expect(loginSource).toContain('data-testid="mobile-login-remembered"');
		expect(loginSource).toContain('data-testid="mobile-login-switch-account"');
		expect(loginSource).toContain('data-testid="mobile-login-theme"');
		expect(loginSource).toContain('alex_mobile_last_profile');
		expect(loginSource).toContain('theme-male');
		expect(loginSource).toContain('theme-female');
		expect(loginSource).toContain('is-covering');
		expect(loginSource).toContain('is-peeking');
	});
});
