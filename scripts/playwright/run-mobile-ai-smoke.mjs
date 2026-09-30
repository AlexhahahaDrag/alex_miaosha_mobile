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
		],
	},
];

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
				return fulfillEncrypted(route, {
					code: '200',
					message: '登录成功',
					data: {
						token: 'mock-mobile-e2e-token',
						admin: {
							id: '1',
							username: 'superman',
							realName: '超级管理员',
							roleInfoVoList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
							permissionContext: {
								superAdmin: true,
								roleList: [{ roleCode: 'super_super', roleName: '超级管理员' }],
								permissionCodes: ['*'],
								buttonPermissionCodes: ['*'],
								currentOrgId: '1',
							},
						},
						userInfo: { id: '1', username: 'superman', realName: '超级管理员' },
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
			await page.waitForTimeout(300);
			const newVibrates = await page.evaluate(() => window.__giftVibrateCount || 0);
			if (newVibrates <= prevVibrates) {
				throw new Error(
					`触觉振动探针断言失败: 点击复制贺词前后振动次数未递增 (前=${prevVibrates}, 后=${newVibrates})`,
				);
			}
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

	// 注入 localStorage mock 状态以维持移动端登录态
	await context.addInitScript((menus) => {
		const user = { id: '1', username: 'superman', realName: '超级管理员' };
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
				permissionCodes: ['*'],
			}),
		);
	}, mockMenus);

	const page = await context.newPage();
	page.on('console', (msg) => console.log('[MOBILE LOG]', msg.text()));
	await setupRouteMocks(page);

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
