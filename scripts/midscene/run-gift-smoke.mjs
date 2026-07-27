import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';

dotenv.config({ override: true });

const rootDir = process.cwd();
const reportDir = path.join(rootDir, 'reports', 'midscene', 'gift-mobile');
const screenshotDir = path.join(rootDir, 'screenshots', 'midscene', 'gift-mobile');
const logDir = path.join(rootDir, 'logs', 'midscene', 'gift-mobile');
const caseFile = path.join(rootDir, 'tests', 'midscene', 'gift', 'cases', 'mobile-smoke.json');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function loadCases() {
	return JSON.parse(fs.readFileSync(caseFile, 'utf-8'));
}

function applyFilter(cases) {
	const filterRaw = process.env.MIDSCENE_CASE_FILTER;
	if (!filterRaw) return cases;
	const allowSet = new Set(
		filterRaw
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean),
	);
	return cases.filter((item) => allowSet.has(item.caseId));
}

function validateEnv() {
	const baseUrl = process.env.MOBILE_BASE_URL || process.env.BASE_URL;
	const modelApiKey = process.env.MIDSCENE_MODEL_API_KEY;
	const modelName = process.env.MIDSCENE_MODEL_NAME;
	const modelFamily = process.env.MIDSCENE_MODEL_FAMILY;
	if (!baseUrl) {
		throw new Error(
			'Missing MOBILE_BASE_URL or BASE_URL. Please start mobile dev server and set it before running Midscene gift smoke.',
		);
	}
	if (!modelApiKey || !modelName || !modelFamily) {
		throw new Error(
			'Missing Midscene model env. Please set MIDSCENE_MODEL_API_KEY/MIDSCENE_MODEL_NAME/MIDSCENE_MODEL_FAMILY.',
		);
	}
	return {
		baseUrl,
		mode: process.env.MIDSCENE_MODE || 'local',
	};
}

function getCredential() {
	return {
		username:
			process.env.MOBILE_TEST_USER || process.env.RBAC_SUPER_USER || process.env.RBAC_MANAGER_USER,
		password:
			process.env.MOBILE_TEST_PASS || process.env.RBAC_SUPER_PASS || process.env.RBAC_MANAGER_PASS,
	};
}

async function installHapticProbe(page) {
	await page.addInitScript(() => {
		window.__giftVibrateCount = 0;
		const originalVibrate = navigator.vibrate?.bind(navigator);
		Object.defineProperty(navigator, 'vibrate', {
			configurable: true,
			value: (...args) => {
				window.__giftVibrateCount += 1;
				return originalVibrate ? originalVibrate(...args) : true;
			},
		});
	});
}

async function ensureLoggedIn(page, runtime) {
	await page.goto(runtime.baseUrl, { waitUntil: 'domcontentloaded' });
	const usernameInput = page.locator('input[name="username"]');
	const onLoginPage = await usernameInput.isVisible().catch(() => false);
	if (!onLoginPage) {
		return;
	}

	const credential = getCredential();
	if (!credential.username || !credential.password) {
		throw new Error(
			'Missing mobile login credentials. Please set MOBILE_TEST_USER/MOBILE_TEST_PASS or RBAC_SUPER_USER/RBAC_SUPER_PASS.',
		);
	}

	await usernameInput.fill(credential.username);
	await page.locator('input[name="password"]').fill(credential.password);
	await page.locator('button[type="submit"]').click();
	await page.waitForFunction(() => !location.hash.includes('/login'), {
		timeout: 15000,
	});
	await page.waitForLoadState('domcontentloaded');
}

async function gotoRoute(page, runtime, routePath) {
	await page.goto(`${runtime.baseUrl}/#${routePath}`, {
		waitUntil: 'domcontentloaded',
	});
}

async function readAuthHeaders(page) {
	return page.evaluate(() => {
		const raw = localStorage.getItem('app-user');
		if (!raw) return {};
		try {
			const parsed = JSON.parse(raw);
			const token = parsed?.token ?? parsed?.state?.token;
			return token ? { Authorization: String(token) } : {};
		} catch {
			return {};
		}
	});
}

async function cleanupGiftEvent(page, runtime, eventId) {
	if (!eventId) return;
	const headers = await readAuthHeaders(page);
	const url = `${runtime.baseUrl}/api/am-finance/api/v1/gift-event-info-t?ids=${encodeURIComponent(eventId)}`;
	await page.request.delete(url, { headers }).catch(() => undefined);
}

async function assertVisibleTestIds(page, testIds) {
	for (const testId of testIds) {
		await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 15000 });
	}
}

async function waitForGiftApi(page, urlPart) {
	await page.waitForResponse((response) => response.url().includes(urlPart) && response.ok(), {
		timeout: 20000,
	});
}

async function assertGiftPage(agent, pageName) {
	const anchors = {
		dashboard: '页面显示数据概览、统计卡片、近期礼金记录或空状态',
		person: '页面显示亲友管理、搜索框、亲友列表或空状态',
		event: '页面显示事由管理、搜索框、事由列表或空状态',
		record: '页面显示礼金记录、方向筛选、搜索框、快速新增入口或空状态',
		analysis: '页面显示统计报表、本月收入、本月支出、待回礼数量或统计卡片',
	};
	await agent.aiWaitFor(anchors[pageName]);
}

async function runCase(testCase, runtime, page, agent) {
	const startedAt = new Date().toISOString();
	await ensureLoggedIn(page, runtime);
	switch (testCase.caseId) {
		case 'GIFT-MOBILE-001':
			await gotoRoute(page, runtime, '/finance/gift/dashboard');
			await assertGiftPage(agent, 'dashboard');
			await gotoRoute(page, runtime, '/finance/gift/person');
			await assertGiftPage(agent, 'person');
			await gotoRoute(page, runtime, '/finance/gift/event');
			await assertGiftPage(agent, 'event');
			await gotoRoute(page, runtime, '/finance/gift/record');
			await assertGiftPage(agent, 'record');
			await gotoRoute(page, runtime, '/finance/gift/analysis');
			await assertGiftPage(agent, 'analysis');
			break;
		case 'GIFT-MOBILE-002':
			await gotoRoute(page, runtime, testCase.route);
			await assertGiftPage(agent, 'record');
			await page.locator('.gift-record-fab').click();
			await agent.aiAssert('快速记礼弹窗已经打开，并且可见礼金方向、金额、事由、送礼人或收礼人字段');
			await agent.aiAssert('快速记礼弹窗中可见常用金额快捷选项');
			await page.locator('.quick-amount').first().click();
			await agent.aiAssert('金额输入框已经填入一个常用金额');
			await page
				.locator('.van-popup')
				.click({ position: { x: 12, y: 12 } })
				.catch(() => undefined);
			const vibrateCount = await page.evaluate(() => window.__giftVibrateCount || 0);
			if (vibrateCount < 1) {
				throw new Error('Expected navigator.vibrate to be triggered by quick record interaction.');
			}
			break;
		case 'GIFT-MOBILE-003':
			await gotoRoute(page, runtime, testCase.route);
			await assertGiftPage(agent, 'person');
			await agent.aiAssert('页面没有出现 Loading 文字，列表加载使用骨架屏或空状态呈现');
			await agent.aiAssert('页面可见搜索框，并可见亲友列表、最近联系人、或空状态插画区域');
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await agent.aiAssert('列表区域支持继续加载或已经显示没有更多数据');
			break;
		case 'GIFT-MOBILE-PERSON-001': {
			// Register waiter before navigation — response may finish during goto.
			const personApi = waitForGiftApi(page, testCase.waitFor || '/gift-person-info-t/business-page');
			await gotoRoute(page, runtime, testCase.route);
			await personApi;
			await assertVisibleTestIds(page, ['gift-person-summary', 'gift-person-list']);
			break;
		}
		case 'GIFT-MOBILE-EVENT-001': {
			const eventApi = waitForGiftApi(page, testCase.waitFor || '/gift-event-info-t/business-page');
			await gotoRoute(page, runtime, testCase.route);
			await eventApi;
			await assertVisibleTestIds(page, ['gift-event-summary', 'gift-event-list']);
			break;
		}
		case 'GIFT-MOBILE-EVENT-002': {
			let createdEventId = null;
			try {
				await gotoRoute(page, runtime, testCase.route);
				await page.getByTestId('gift-event-detail').waitFor({ state: 'visible', timeout: 15000 });
				const eventName = `MidsceneEvt${Date.now()}`;
				const form = page.getByTestId('gift-event-form');
				await form.locator('input').first().fill(eventName);
				await form.locator('.van-field--is-link').first().click();
				await page.locator('.van-action-sheet__item').first().click();
				const saveResponsePromise = page.waitForResponse(
					(response) =>
						response.request().method() === 'POST' &&
						response.url().includes('/gift-event-info-t') &&
						!response.url().includes('business-page') &&
						!response.url().includes('/page'),
				);
				await page.getByTestId('gift-event-save').click();
				const saveResponse = await saveResponsePromise;
				const saveBody = await saveResponse.json().catch(() => ({}));
				if (saveBody?.data?.id != null) {
					createdEventId = String(saveBody.data.id);
				}
				await page.getByTestId('gift-event-list').waitFor({ state: 'visible', timeout: 15000 });
			} finally {
				await cleanupGiftEvent(page, runtime, createdEventId);
			}
			break;
		}
		default:
			throw new Error(`Unsupported caseId=${testCase.caseId}`);
	}

	const screenshotPath = path.join(screenshotDir, `${testCase.caseId}_pass.png`);
	await page.screenshot({ path: screenshotPath, fullPage: true });
	fs.appendFileSync(
		path.join(logDir, 'gift-mobile-smoke.log'),
		[
			`[${startedAt}] START ${testCase.caseId} ${testCase.title}`,
			`mode=${runtime.mode} baseUrl=${runtime.baseUrl}`,
			`[${new Date().toISOString()}] PASS ${testCase.caseId}`,
			'',
		].join('\n'),
	);
}

async function main() {
	ensureDir(reportDir);
	ensureDir(screenshotDir);
	ensureDir(logDir);

	const runtime = validateEnv();
	const selectedCases = applyFilter(loadCases());
	if (!selectedCases.length) {
		throw new Error('No smoke cases selected. Please check MIDSCENE_CASE_FILTER.');
	}

	const browser = await chromium.launch({
		headless: runtime.mode === 'ci',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true,
	});
	await installHapticProbe(page);
	const agent = new PlaywrightAgent(page);

	const results = [];
	for (const testCase of selectedCases) {
		try {
			await runCase(testCase, runtime, page, agent);
			results.push({
				caseId: testCase.caseId,
				title: testCase.title,
				status: 'pass',
			});
		} catch (error) {
			const failShot = path.join(screenshotDir, `${testCase.caseId}_fail.png`);
			await page.screenshot({ path: failShot, fullPage: true }).catch(() => undefined);
			const reason = String(error?.message || error);
			fs.appendFileSync(
				path.join(logDir, 'gift-mobile-smoke.log'),
				`[${new Date().toISOString()}] FAIL ${testCase.caseId} ${reason}\n`,
			);
			results.push({
				caseId: testCase.caseId,
				title: testCase.title,
				status: 'fail',
				error: reason,
			});
			if (runtime.mode === 'ci') {
				await browser.close();
				throw error;
			}
		}
	}

	await browser.close();

	const passedCount = results.filter((item) => item.status === 'pass').length;
	const failedCount = results.filter((item) => item.status === 'fail').length;
	const report = {
		mode: runtime.mode,
		baseUrl: runtime.baseUrl,
		total: selectedCases.length,
		passed: passedCount,
		failed: failedCount,
		generatedAt: new Date().toISOString(),
		cases: results,
	};
	fs.writeFileSync(
		path.join(reportDir, 'gift-mobile-smoke-report.json'),
		JSON.stringify(report, null, 2),
	);
	console.log(
		`Midscene gift mobile smoke finished. total=${selectedCases.length}, passed=${passedCount}, failed=${failedCount}`,
	);
	if (failedCount > 0) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error('Midscene gift mobile smoke failed:', error.message);
	process.exit(1);
});
