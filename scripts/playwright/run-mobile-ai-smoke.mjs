import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config({ override: true });

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'playwright');
const screenshotDir = path.join(rootDir, 'screenshots', 'playwright');
const logDir = path.join(rootDir, 'logs', 'playwright');
const caseFile = path.join(rootDir, 'tests', 'midscene', 'gift', 'cases', 'mobile-ai-smoke.json');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadCases() {
	return JSON.parse(fs.readFileSync(caseFile, 'utf-8'));
}

async function isServerReady(url) {
	try {
		const res = await fetch(url, { method: 'HEAD' });
		return res.ok || res.status < 500;
	} catch {
		return false;
	}
}

async function startViteServerIfNeed(port = 2000) {
	const url = `http://localhost:${port}/`;
	if (await isServerReady(url)) {
		console.log(`Using existing dev server at ${url}`);
		return { url, process: null };
	}

	console.log(`Starting Mobile Vite dev server on port ${port}...`);
	const proc = spawn('npx', ['vite', '--port', String(port), '--host'], {
		cwd: rootDir,
		shell: true,
		stdio: 'ignore',
	});

	for (let i = 0; i < 30; i++) {
		await new Promise((r) => setTimeout(r, 500));
		if (await isServerReady(url)) {
			console.log(`Mobile Vite dev server ready at ${url}`);
			return { url, process: proc };
		}
	}
	throw new Error(`Failed to start mobile dev server at ${url} within timeout`);
}

function encryptPayload(data) {
	const key = Buffer.from('20230610HelloDog', 'utf-8');
	const iv = Buffer.from('1234567890123456', 'utf-8');
	const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
	encrypted += cipher.final('base64');
	return encrypted;
}

const mockMenus = [
	{
		id: '500',
		name: 'financeGift',
		title: '人情礼单',
		path: '/finance/gift',
		component: 'Layout',
		children: [
			{
				id: '501',
				name: 'financeGiftRecord',
				title: '礼金记录',
				path: '/finance/gift/record',
				component: '/src/views/finance/gift/record/index.vue',
				permissionCode: 'finance:gift:record',
			},
			{
				id: '502',
				name: 'financeGiftPerson',
				title: '亲友管理',
				path: '/finance/gift/person',
				component: '/src/views/finance/gift/person/index.vue',
				permissionCode: 'finance:gift:person',
			},
			{
				id: '503',
				name: 'financeGiftEvent',
				title: '事由管理',
				path: '/finance/gift/event',
				component: '/src/views/finance/gift/event/index.vue',
				permissionCode: 'finance:gift:event',
			},
			{
				id: '504',
				name: 'financeGiftPersonDetail',
				title: '亲友详情',
				path: '/finance/gift/person/giftPersonDetail',
				component: '/src/views/finance/gift/person/giftPersonDetail/index.vue',
				permissionCode: 'finance:gift:person',
			},
		],
	},
	{
		id: '600',
		name: 'finance',
		title: '财务中心',
		path: '/finance',
		component: 'Layout',
		children: [
			{
				id: '601',
				name: 'financeManager',
				title: '收支记账',
				path: '/finance/financeManager',
				component: '/src/views/finance/financeManager/index.vue',
				permissionCode: 'finance:financeManager:query',
			},
			{
				id: '602',
				name: 'financeBudgetManage',
				title: '预算管理',
				path: '/finance/financeManager/budgetManage',
				component: '/src/views/finance/financeManager/budgetManage/index.vue',
				permissionCode: 'finance:financeManager:budget:view',
			},
			{
				id: '603',
				name: 'financeManagerDetail',
				title: '记账明细',
				path: '/finance/financeManager/financeManagerDetail',
				component: '/src/views/finance/financeManager/financeManagerDetail/index.vue',
				permissionCode: 'finance:financeManager:add',
			},
		],
	},
];

const MOBILE_PERSONA_CONFIGS = {
	super_super: {
		user: { id: '1', username: 'superman', realName: '超级管理员' },
		roleInfo: { roleCode: 'super_super', roleName: '超级管理员' },
		superAdmin: true,
		permissionCodes: ['*'],
	},
	gift_admin: {
		user: { id: '1', username: 'superman', realName: '超级管理员' },
		roleInfo: { roleCode: 'super_super', roleName: '超级管理员' },
		superAdmin: true,
		permissionCodes: ['*'],
	},
	family_admin: {
		user: { id: '1', username: 'admin_dad', realName: '家庭管理员爸爸' },
		roleInfo: { roleCode: 'family_admin', roleName: '家庭管理员' },
		superAdmin: false,
		permissionCodes: [
			'finance:gift:record',
			'finance:gift:person',
			'finance:gift:event',
			'finance:financeManager:query',
			'finance:financeManager:add',
			'finance:financeManager:edit',
			'finance:financeManager:delete',
			'finance:financeManager:budget:view',
			'finance:financeManager:budget:edit',
		],
	},
	family_member: {
		user: { id: '2', username: 'member_kid', realName: '普通成员小袋子' },
		roleInfo: { roleCode: 'family_member', roleName: '家庭成员' },
		superAdmin: false,
		permissionCodes: [
			'finance:gift:record',
			'finance:gift:person',
			'finance:gift:event',
			'finance:financeManager:query',
			'finance:financeManager:add',
			'finance:financeManager:edit',
			'finance:financeManager:delete',
			'finance:financeManager:budget:view',
		],
	},
};

let currentMobilePersonaKey = 'gift_admin';

async function switchMobilePersona(
	page,
	personaKey = 'gift_admin',
	baseUrl = 'http://localhost:2000/',
) {
	if (currentMobilePersonaKey === personaKey && page.url() && page.url() !== 'about:blank') {
		return;
	}
	currentMobilePersonaKey = personaKey;
	const p = MOBILE_PERSONA_CONFIGS[personaKey] || MOBILE_PERSONA_CONFIGS.gift_admin;
	if (!page.url() || page.url() === 'about:blank') {
		await page.goto(baseUrl);
	}
	await page.evaluate(
		({ user, roleInfo, superAdmin, permissionCodes, menus }) => {
			window.localStorage.setItem('token', 'mock-mobile-e2e-token');
			window.localStorage.setItem('userInfo', JSON.stringify(user));
			window.localStorage.setItem('menuInfo', JSON.stringify(menus));
			window.localStorage.setItem(
				'app-user',
				JSON.stringify({
					token: 'mock-mobile-e2e-token',
					userInfo: user,
					menuInfo: menus,
					hasMenu: true,
					superAdmin,
					roleInfo,
					roleList: [roleInfo],
					permissionCodes,
				}),
			);
		},
		{
			user: p.user,
			roleInfo: p.roleInfo,
			superAdmin: p.superAdmin,
			permissionCodes: p.permissionCodes,
			menus: mockMenus,
		},
	);
	await page.reload();
}

let isBudgetOverStatus = false;

async function setupRouteMocks(page) {
	function fulfillEncrypted(route, data) {
		return route.fulfill({
			status: 200,
			contentType: 'text/plain; charset=utf-8',
			body: encryptPayload(data),
		});
	}

	await page.route(
		(url) => url.pathname.startsWith('/api/am-'),
		async (route) => {
			const url = new URL(route.request().url());
			const pathname = url.pathname;

			if (pathname.includes('/dict-info/')) {
				return fulfillEncrypted(route, { code: '200', data: [] });
			}

			if (pathname.includes('/login/')) {
				const p = MOBILE_PERSONA_CONFIGS[currentMobilePersonaKey] || MOBILE_PERSONA_CONFIGS.gift_admin;
				return fulfillEncrypted(route, {
					code: '200',
					message: '登录成功',
					data: {
						token: 'mock-mobile-e2e-token',
						admin: {
							id: p.user.id,
							username: p.user.username,
							realName: p.user.realName,
							roleInfoVoList: [p.roleInfo],
							permissionContext: {
								superAdmin: p.superAdmin,
								roleList: [p.roleInfo],
								permissionCodes: p.permissionCodes,
								buttonPermissionCodes: p.permissionCodes,
								currentOrgId: '20',
							},
						},
						userInfo: p.user,
						menuInfo: mockMenus,
					},
				});
			}

			if (pathname.includes('/user/menus')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: mockMenus,
				});
			}

			if (pathname.includes('/gift-record-info-t/ai-parse')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						direction: 'RECEIVE',
						amount: 800,
						eventTypeName: '百日宴',
						personName: '李四',
						personId: '101',
						eventId: '201',
						remark: '收到李四百日宴红包800元',
					},
				});
			}

			if (pathname.includes('/gift-event-type-option-t/recommend-amount')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						amount: 800,
						aiReasoning: '根据亲友历史礼尚往来与事件规格，智能推荐人情礼金 800 元。',
						aiGreetingTip: '祝宝宝健康成长，平安顺遂，长命百岁！',
					},
				});
			}

			if (pathname.includes('/gift-record-info-t/page')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						records: [
							{
								id: '6601',
								direction: 'GIVE',
								amount: 500,
								personName: '张三',
								eventTypeName: '结婚大喜',
								payTime: '2026-09-28',
							},
						],
						total: 1,
						current: 1,
						size: 10,
					},
				});
			}

			if (pathname.includes('/gift-person-info-t/list')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: [
						{ id: '101', personName: '李四', relationTypeName: '朋友' },
						{ id: '102', personName: '张三', relationTypeName: '同学' },
					],
				});
			}

			if (pathname.includes('/gift-event-info-t/list')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: [{ id: '201', eventName: '百日宴', eventTypeName: '百日宴' }],
				});
			}

			if (
				pathname.includes('/gift-person-info-t/business-page') ||
				pathname.includes('/gift-person-info-t/page')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						records: [
							{ id: '101', name: '李四', personName: '李四', relationTypeName: '朋友' },
							{ id: '102', name: '张三', personName: '张三', relationTypeName: '同学' },
						],
						total: 2,
					},
				});
			}

			if (
				pathname.includes('/gift-event-info-t/business-page') ||
				pathname.includes('/gift-event-info-t/page')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						records: [{ id: '201', eventName: '百日宴', eventTypeName: '百日宴' }],
						total: 1,
					},
				});
			}

			if (pathname.includes('/gift-person-info-t/profile')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						person: {
							id: '101',
							personName: '李四',
							relationType: 'friend',
							phone: '13800138000',
							remark: '大学室友兼死党',
							totalGiveAmount: 1600,
							totalReceiveAmount: 2200,
							netAmount: 600,
						},
						records: [
							{
								id: '9001',
								direction: 'RECEIVE',
								amount: 1200,
								payTime: '2026-05-20 12:00:00',
								remark: '婚礼贺礼',
							},
						],
					},
				});
			}

			if (
				pathname.includes('/gift-record-info-t') &&
				(route.request().method() === 'POST' || route.request().method() === 'PUT')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					message: '保存成功',
					data: true,
				});
			}

			if (pathname.includes('/finance-budget/status')) {
				if (isBudgetOverStatus) {
					return fulfillEncrypted(route, {
						code: '200',
						data: {
							id: '7002',
							budgetMonth: '2026-10',
							budgetAmount: 2000,
							actualExpense: 2850,
							remainingAmount: -850,
							usagePercent: 142.5,
							isOverBudget: true,
							isInherited: false,
							categoryCodes: [],
						},
					});
				}
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						id: '7001',
						budgetMonth: '2026-10',
						budgetAmount: 3000,
						actualExpense: 1200,
						remainingAmount: 1800,
						usagePercent: 40,
						isOverBudget: false,
						isInherited: false,
						categoryCodes: [],
					},
				});
			}

			if (
				pathname.includes('/finance-budget/ai/recommend') ||
				pathname.includes('/finance-budget/ai-recommend')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						avgMonthlyExpense: 2600,
						recommendAmount: 2600,
						savingAmount: 2210,
						moderateAmount: 2600,
						relaxedAmount: 2990,
						recommendedCategories: ['餐饮美食', '交通出行'],
						healthAdvice:
							'近3月平均支出约 2,600 元，建议本月适度控制在 2,600 元以内，重点关注餐饮与交通。',
						dailyLimitSuggest: 86.67,
						isFallback: false,
					},
				});
			}

			if (
				pathname.includes('/finance-budget/ai/parse') ||
				pathname.includes('/finance-budget/ai-parse')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						hasBudget: true,
						amount: 2500,
						hasCategories: true,
						categories: ['餐饮美食', '交通出行'],
						reasoning: '根据指令，设定月度预算为 2500 元，重点管控餐饮美食、交通出行分类。',
					},
				});
			}

			if (pathname.includes('/finance-budget/categories')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: ['餐饮美食', '交通出行', '数码电器', '服饰鞋包', '日用百货'],
				});
			}

			if (pathname.includes('/finance-budget/save')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: true,
				});
			}

			if (pathname.includes('/finance-info/summary')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						totalExpense: isBudgetOverStatus ? 2850 : 1200,
						totalIncome: 5000,
						totalBalance: isBudgetOverStatus ? 2150 : 3800,
						totalCount: 10,
					},
				});
			}

			if (pathname.includes('/finance-info/page')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						records: [],
						total: 0,
						current: 1,
						size: 10,
					},
				});
			}

			if (
				(pathname === '/finance-info' || pathname.endsWith('/finance-info')) &&
				(route.request().method() === 'POST' || route.request().method() === 'PUT')
			) {
				return fulfillEncrypted(route, {
					code: '200',
					message: '保存成功',
					data: true,
				});
			}

			if (
				(pathname === '/finance-info' || pathname.endsWith('/finance-info')) &&
				route.request().method() === 'GET'
			) {
				return fulfillEncrypted(route, {
					code: '200',
					data: {
						id: '1',
						typeCode: '餐饮',
						amount: 88.5,
						incomeAndExpenses: 'expense',
					},
				});
			}

			if (pathname.includes('/user/list')) {
				return fulfillEncrypted(route, {
					code: '200',
					data: [
						{
							id: '1',
							nickName: '超级管理员',
							username: 'superman',
						},
					],
				});
			}

			return fulfillEncrypted(route, { code: '200', data: {} });
		},
	);
}

async function installHapticProbe(page) {
	await page.addInitScript(() => {
		window.__giftVibrateCount = 0;
		const orig = navigator.vibrate?.bind(navigator);
		Object.defineProperty(navigator, 'vibrate', {
			configurable: true,
			value: (...args) => {
				window.__giftVibrateCount = (window.__giftVibrateCount || 0) + 1;
				return orig ? orig(...args) : true;
			},
		});
	});
}

async function executeCase(page, c, runtime) {
	console.log(`Running case ${c.caseId}: ${c.title}...`);
	if (c.persona) {
		await switchMobilePersona(page, c.persona, runtime.baseUrl);
	}

	switch (c.caseId) {
		case 'GIFT-AI-MOBILE-001': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/record`);
			const fab = page.locator('[data-testid="gift-record-fab"]').first();
			await fab.waitFor({ state: 'visible', timeout: 10000 });
			await fab.click();

			// 等待快速记礼面板与 AI 输入区
			const quickPanel = page.locator('[data-testid="gift-record-quick-panel"]').first();
			await quickPanel.waitFor({ state: 'visible', timeout: 5000 });

			const aiInput = page
				.locator(
					'[data-testid="gift-record-ai-input"] textarea, [data-testid="gift-record-ai-input"] input',
				)
				.first();
			await aiInput.waitFor({ state: 'visible', timeout: 5000 });
			await aiInput.click();
			await aiInput.pressSequentially('收到李四百日宴红包800元', { delay: 20 });
			await aiInput.dispatchEvent('input');

			// 点击智能解析按钮
			const parseBtn = page.locator('[data-testid="gift-record-ai-parse-btn"]').first();
			await parseBtn.click();

			// 等待推荐卡片展示或表单回填完成
			const recommendCard = page.locator('[data-testid="gift-record-ai-recommend-card"]').first();
			await recommendCard.waitFor({ state: 'visible', timeout: 8000 });

			// 断言金额已正确回填为 800
			const amountInput = page.locator('input[name="amount"]').first();
			const val = await amountInput.inputValue();
			if (val !== '800') {
				throw new Error(`AI 解析回填金额断言失败: 期望 800, 实际为 ${val}`);
			}
			break;
		}

		case 'GIFT-AI-MOBILE-002': {
			// 确保位于快速记礼面板并呈现了场景贺词
			const copyGreetingBtn = page.locator('[data-testid="gift-record-copy-greeting"]').first();
			await copyGreetingBtn.waitFor({ state: 'visible', timeout: 8000 });

			// 记录点击前的触觉振动次数
			const prevVibrates = await page.evaluate(() => window.__giftVibrateCount || 0);

			// 点击复制贺词
			await copyGreetingBtn.click();

			// 等待振动探针触发断言
			await page.waitForFunction((prev) => (window.__giftVibrateCount || 0) > prev, prevVibrates, {
				timeout: 3000,
			});
			const newVibrates = await page.evaluate(() => window.__giftVibrateCount || 0);
			if (newVibrates <= prevVibrates) {
				throw new Error(
					`触觉振动探针断言失败: 点击复制贺词前后振动次数未递增 (前=${prevVibrates}, 后=${newVibrates})`,
				);
			}
			// 关闭面板保持状态纯净
			const overlay = page.locator('.van-overlay').first();
			if ((await overlay.count()) && (await overlay.isVisible())) {
				await overlay.click({ force: true });
			}
			break;
		}

		case 'GIFT-E2E-MOBILE-QUICK-RECORD': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/record`);

			// 1. 如果快速记礼面板未打开，则点击浮动添加按钮打开
			const quickPanel = page.locator('[data-testid="gift-record-quick-panel"]').first();
			if (!(await quickPanel.count()) || !(await quickPanel.isVisible())) {
				const fab = page.locator('[data-testid="gift-record-fab"]').first();
				await fab.waitFor({ state: 'visible', timeout: 10000 });
				await fab.click();
				await quickPanel.waitFor({ state: 'visible', timeout: 5000 });
			}

			// 2. 点击快捷金额 Chip
			const quickAmountBtn = page.locator('[data-testid="gift-record-quick-amount"]').first();
			if (await quickAmountBtn.count()) {
				await quickAmountBtn.click();
			}

			// 3. 输入金额
			const amountInput = page.locator('input[name="amount"]').first();
			await amountInput.waitFor({ state: 'visible', timeout: 5000 });
			await amountInput.fill('666');

			// 4. 点击提交保存按钮
			const submitBtn = page.locator('[data-testid="gift-record-quick-submit"]').first();
			await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

			// 5. 侦听保存请求
			const [saveReq] = await Promise.all([
				page.waitForRequest(
					(req) =>
						req.url().includes('/gift-record-info-t') &&
						(req.method() === 'POST' || req.method() === 'PUT'),
				),
				submitBtn.click(),
			]);
			if (!saveReq) {
				throw new Error('移动端快速记礼提交保存请求未正常触发');
			}
			break;
		}

		case 'GIFT-E2E-MOBILE-PERSON-PROFILE': {
			await page.goto(`${runtime.baseUrl}#/finance/gift/person/giftPersonDetail?id=101`);

			// 1. 等待亲友名字渲染
			const heroName = page.locator('.profile-hero__name').first();
			await heroName.waitFor({ state: 'visible', timeout: 10000 });

			const nameText = await heroName.innerText();
			if (!nameText.includes('李四')) {
				throw new Error(`移动端亲友姓名断言失败: 期望包含 李四, 实际为 ${nameText}`);
			}

			// 2. 验证累计送礼/收礼指标卡渲染
			const metricCard = page.locator('.metric-card--recv strong').first();
			await metricCard.waitFor({ state: 'visible', timeout: 5000 });

			// 3. 验证编辑与删除按钮契约
			const editBtn = page.locator('[data-testid="gift-person-edit"]').first();
			await editBtn.waitFor({ state: 'visible', timeout: 5000 });

			const deleteBtn = page.locator('[data-testid="gift-person-delete"]').first();
			await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
			break;
		}

		case 'GIFT-AI-MOBILE-BUDGET-001': {
			isBudgetOverStatus = false;
			await page.goto(`${runtime.baseUrl}#/finance/financeManager/budgetManage`);

			// 1. 等待适度推荐胶囊就绪（组件挂载时自闭环测算）
			const moderateCell = page.locator('[data-testid="btn-mobile-apply-moderate"]').first();
			try {
				await moderateCell.waitFor({ state: 'visible', timeout: 6000 });
			} catch {
				const recommendBtn = page.locator('[data-testid="btn-mobile-ai-recommend"]').first();
				await recommendBtn.click();
				await moderateCell.waitFor({ state: 'visible', timeout: 8000 });
			}

			// 2. 点击适度档推荐 (2600)
			await moderateCell.click();

			// 3. 断言预算金额输入框已填入 2600
			await page.waitForFunction(
				() => {
					const el = document.querySelector('[data-testid="input-budget-amount"] input');
					return el && el.value && el.value.includes('2600');
				},
				null,
				{ timeout: 5000 },
			);
			break;
		}

		case 'GIFT-AI-MOBILE-BUDGET-002': {
			isBudgetOverStatus = false;
			await page.goto(`${runtime.baseUrl}#/finance/financeManager/budgetManage`);

			// 1. 展开口语指令区
			const cmdInput = page.locator('[data-testid="mobile-ai-command-input"]').first();
			const toggleBtn = page.locator('[data-testid="btn-mobile-toggle-ai"]').first();
			await toggleBtn.waitFor({ state: 'visible', timeout: 5000 });

			if (!(await cmdInput.isVisible())) {
				await toggleBtn.click();
				await cmdInput.waitFor({ state: 'visible', timeout: 5000 });
			}

			// 2. 记录触觉振动次数
			const prevVibrates = await page.evaluate(() => window.__giftVibrateCount || 0);

			// 3. 输入口语指令
			await cmdInput.fill('帮我设2500预算，重点管餐饮');

			// 4. 点击回填解析按钮（会触发 navigator.vibrate(10)）
			const parseBtn = page.locator('[data-testid="btn-mobile-ai-parse"]').first();
			await parseBtn.click();

			// 5. 断言触觉振动探针捕获到了振动
			await page.waitForFunction((prev) => (window.__giftVibrateCount || 0) > prev, prevVibrates, {
				timeout: 5000,
			});

			// 6. 断言输入框金额已更新为 2500
			await page.waitForFunction(
				() => {
					const el = document.querySelector('[data-testid="input-budget-amount"] input');
					return el && el.value && el.value.includes('2500');
				},
				null,
				{ timeout: 8000 },
			);
			break;
		}

		case 'BUDGET-MOBILE-STATUS-OVER': {
			isBudgetOverStatus = true;
			await page.goto(`${runtime.baseUrl}#/dashboard`);
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 1. 等待零花钱大盘卡片渲染
			const card = page.locator('[data-testid="pocket-money-card"]').first();
			await card.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 断言健康度徽标展示“超支透支”
			const healthBadge = page.locator('[data-testid="budget-health-badge"]').first();
			await healthBadge.waitFor({ state: 'visible', timeout: 5000 });
			const healthText = await healthBadge.innerText();
			if (!healthText.includes('超支') && !healthText.includes('透支')) {
				throw new Error(`移动端健康徽标断言失败: 预期包含 超支/透支, 实际为 ${healthText}`);
			}

			// 3. 断言剩余金额展示负数超支
			const remainingVal = page.locator('[data-testid="metric-remaining-amount"]').first();
			await remainingVal.waitFor({ state: 'visible', timeout: 5000 });
			const valText = await remainingVal.innerText();
			if (!valText.includes('850')) {
				throw new Error(`移动端超支金额未正确展示: 预期包含 850, 实际为 ${valText}`);
			}

			isBudgetOverStatus = false;
			break;
		}

		case 'FINANCE-E2E-MOBILE-POCKET-BUDGET': {
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 1. 等待零花钱卡片出现
			const pocketCard = page.locator('[data-testid="pocket-money-card"]').first();
			await pocketCard.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 点击展开常驻条
			const header = page.locator('[data-testid="pocket-money-header"]').first();
			await header.click();

			// 3. 点击预算设置按钮
			const editBtn = page.locator('[data-testid="btn-edit-budget"]').first();
			await editBtn.waitFor({ state: 'visible', timeout: 5000 });
			await editBtn.click();

			// 4. 等待进入预算管理页面，校验预算输入框
			const budgetInput = page.locator('[data-testid="input-budget-amount"] input').first();
			await budgetInput.waitFor({ state: 'visible', timeout: 8000 });
			await budgetInput.fill('2500');

			// 5. 点击支出方向 Chip
			const expenseChip = page.locator('[data-testid="chip-direction-expense"]').first();
			await expenseChip.waitFor({ state: 'visible', timeout: 5000 });
			await expenseChip.click();

			// 6. 点击分类 Chip (例如餐饮美食)
			const catChip = page.locator('[data-testid="chip-category-餐饮美食"]').first();
			if (await catChip.count()) {
				await catChip.click();
			}

			// 7. 保存预算设定并断言网络请求与路由回退
			const saveBudgetBtn = page.locator('[data-testid="btn-save-budget"]').first();
			await saveBudgetBtn.waitFor({ state: 'visible', timeout: 5000 });

			const [saveReq] = await Promise.all([
				page.waitForRequest(
					(req) => req.url().includes('/finance-budget/save') && req.method() === 'POST',
				),
				saveBudgetBtn.click(),
			]);
			if (!saveReq) {
				throw new Error('移动端预算保存请求 POST /finance-budget/save 未正常触发');
			}

			// 8. 断言路由自动回退到财务主页
			await pocketCard.waitFor({ state: 'visible', timeout: 8000 });
			break;
		}

		case 'FINANCE-E2E-MOBILE-KEYPAD-RECORD': {
			await page.goto(`${runtime.baseUrl}#/finance/financeManager/financeManagerDetail`);

			// 1. 等待分类九宫格渲染
			const foodCategory = page.locator('[data-testid="category-cell-餐饮"]').first();
			await foodCategory.waitFor({ state: 'visible', timeout: 10000 });

			// 2. 记录触觉振动次数，点击餐饮分类
			const prevVibrates = await page.evaluate(() => window.__giftVibrateCount || 0);
			await foodCategory.click();

			// 3. 断言触觉探针捕获到了振动
			await page.waitForFunction((prev) => (window.__giftVibrateCount || 0) > prev, prevVibrates, {
				timeout: 5000,
			});

			// 4. 使用数字键盘输入 88.5
			const btn8 = page.locator('[data-testid="keypad-btn-8"]').first();
			const btnDot = page.locator('[data-testid="keypad-btn-dot"]').first();
			const btn5 = page.locator('[data-testid="keypad-btn-5"]').first();

			await btn8.waitFor({ state: 'visible', timeout: 5000 });
			await btn8.click();
			await btn8.click();
			await btnDot.click();
			await btn5.click();

			// 5. 断言金额区域显示 88.5
			await page.waitForFunction(
				() => {
					const el = document.querySelector('[data-testid="hero-amount-val"]');
					return el && el.innerText.trim().includes('88.5');
				},
				null,
				{ timeout: 5000 },
			);

			// 6. 点击完成提交保存
			const submitBtn = page.locator('[data-testid="keypad-btn-submit"]').first();
			await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

			const [saveReq] = await Promise.all([
				page.waitForRequest((req) => req.url().includes('/finance-info') && req.method() === 'POST'),
				submitBtn.click(),
			]);
			if (!saveReq) {
				throw new Error('移动端极速记账提交请求 POST /finance-info 未正常触发');
			}

			// 7. 等待自动返回列表页或根路径
			await page.waitForURL((url) => !url.hash.includes('financeManagerDetail'), { timeout: 8000 });
			break;
		}

		case 'RBAC-MOBILE-MEMBER-READONLY-NOTICE': {
			// 1. 访问收支记账主页
			await page.goto(`${runtime.baseUrl}#/finance/financeManager`);

			// 2. 展开零花钱卡片，断言按钮文案为“预算详情”（非管理员不可编辑）
			const pocketCard = page.locator('[data-testid="pocket-money-card"]').first();
			await pocketCard.waitFor({ state: 'visible', timeout: 10000 });

			const header = page.locator('[data-testid="pocket-money-header"]').first();
			await header.click();

			const editBtn = page.locator('[data-testid="btn-edit-budget"]').first();
			await editBtn.waitFor({ state: 'visible', timeout: 5000 });
			const btnText = await editBtn.innerText();
			if (!btnText.includes('预算详情')) {
				throw new Error(`移动端普通成员视角下，零花钱卡片按钮文案预期为“预算详情”，实际为: ${btnText}`);
			}

			// 3. 点击“预算详情”跳转至预算管理详情页
			await editBtn.click();

			// 4. 断言只读提示横幅存在且渲染正确文案
			const banner = page.locator('.readonly-notice-banner').first();
			await banner.waitFor({ state: 'visible', timeout: 8000 });
			const bannerText = await banner.innerText();
			if (
				!bannerText.includes('家庭成员浏览模式') ||
				!bannerText.includes('仅家庭管理员可调整月度预算设定')
			) {
				throw new Error(`移动端只读提示横幅文本未符合预期: ${bannerText}`);
			}

			// 5. 断言预算金额输入框处于 readonly 状态
			const inputLocator = page.locator('[data-testid="input-budget-amount"] input').first();
			await inputLocator.waitFor({ state: 'visible', timeout: 5000 });
			const isReadonly = await inputLocator.getAttribute('readonly');
			if (isReadonly === null) {
				throw new Error('移动端普通成员视角下，预算输入框未处于 readonly 状态');
			}

			// 6. 断言底部保存按钮不存在（隐藏），仅存在返回列表按钮
			const saveBtn = page.locator('[data-testid="btn-save-budget"]');
			if ((await saveBtn.count()) > 0 && (await saveBtn.first().isVisible())) {
				throw new Error('移动端普通成员视角下，不应展示保存预算设定按钮');
			}

			const backBtn = page.locator('.btn-back').first();
			await backBtn.waitFor({ state: 'visible', timeout: 5000 });
			const backText = await backBtn.innerText();
			if (!backText.includes('返回列表')) {
				throw new Error(`移动端普通成员视角下，返回按钮文案预期为“返回列表”，实际为: ${backText}`);
			}

			// 7. 点击返回列表回到财务主页并确认零花钱卡片可见
			await backBtn.click();
			await pocketCard.waitFor({ state: 'visible', timeout: 8000 });
			break;
		}

		default:
			throw new Error(`Unsupported case ID: ${c.caseId}`);
	}
}

async function main() {
	ensureDir(reportDir);
	ensureDir(screenshotDir);
	ensureDir(logDir);

	const cases = loadCases();
	const server = await startViteServerIfNeed(2000);

	let browser;
	const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
	try {
		browser = await chromium.launch({
			headless: true,
			args: launchArgs,
		});
	} catch (err) {
		console.warn(`Default chromium failed (${err.message}), trying msedge channel...`);
		try {
			browser = await chromium.launch({
				headless: true,
				channel: 'msedge',
				args: launchArgs,
			});
		} catch (err2) {
			console.warn(`msedge failed (${err2.message}), trying chrome channel...`);
			browser = await chromium.launch({
				headless: true,
				channel: 'chrome',
				args: launchArgs,
			});
		}
	}

	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
		hasTouch: true,
		isMobile: true,
	});

	await installHapticProbe(context);

	// 注入 localStorage mock 状态以维持移动端登录态（若已有则不覆盖）
	await context.addInitScript((menus) => {
		if (window.localStorage.getItem('token')) {
			return;
		}
		const user = { id: '1', username: 'superman', realName: '超级管理员' };
		const roleInfo = { roleCode: 'super_super', roleName: '超级管理员' };
		window.localStorage.setItem('token', 'mock-mobile-e2e-token');
		window.localStorage.setItem('userInfo', JSON.stringify(user));
		window.localStorage.setItem('menuInfo', JSON.stringify(menus));
		window.localStorage.setItem(
			'app-user',
			JSON.stringify({
				token: 'mock-mobile-e2e-token',
				userInfo: user,
				menuInfo: menus,
				hasMenu: true,
				superAdmin: true,
				roleInfo: roleInfo,
				roleList: [roleInfo],
				permissionCodes: ['*'],
			}),
		);
	}, mockMenus);

	const page = await context.newPage();
	page.on('console', (msg) => console.log('[MOBILE LOG]', msg.text()));
	await setupRouteMocks(page);

	// 预热 Mobile Vite Dev Server
	await page.goto(`${server.url}#/finance/gift/record`);
	await page.waitForLoadState('networkidle').catch(() => {});

	const results = [];

	for (const c of cases) {
		try {
			await executeCase(page, c, { baseUrl: server.url });
			const shotPath = path.join(screenshotDir, `${c.caseId}_pass.png`);
			await page.screenshot({ path: shotPath, fullPage: true });
			results.push({ caseId: c.caseId, title: c.title, status: 'pass' });
			console.log(`✅ PASS: ${c.caseId}`);
		} catch (err) {
			const failShotPath = path.join(screenshotDir, `${c.caseId}_fail.png`);
			await page.screenshot({ path: failShotPath, fullPage: true }).catch(() => undefined);
			results.push({ caseId: c.caseId, title: c.title, status: 'fail', error: err.message });
			console.error(`❌ FAIL: ${c.caseId} - ${err.message}`);
		}
	}

	await browser.close();
	if (server.process) {
		server.process.kill();
	}

	const passed = results.filter((r) => r.status === 'pass').length;
	const failed = results.filter((r) => r.status === 'fail').length;

	const report = {
		total: results.length,
		passed,
		failed,
		generatedAt: new Date().toISOString(),
		cases: results,
	};

	fs.writeFileSync(path.join(reportDir, 'mobile-ai-report.json'), JSON.stringify(report, null, 2));

	console.log(`\n======================================================`);
	console.log(
		`Mobile AI Smoke Finished: Total=${results.length}, Passed=${passed}, Failed=${failed}`,
	);
	console.log(`======================================================\n`);

	if (failed > 0) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Fatal execution error:', err);
	process.exit(1);
});
