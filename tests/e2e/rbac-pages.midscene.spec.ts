import { chromium } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';

const targetUrl = process.env.MIDSCENE_TARGET_URL;
const hasModelConfig =
	!!process.env.MIDSCENE_MODEL_API_KEY &&
	!!process.env.MIDSCENE_MODEL_NAME &&
	!!process.env.MIDSCENE_MODEL_BASE_URL;

async function assertRbacPages() {
	if (!targetUrl || !hasModelConfig) {
		// eslint-disable-next-line no-console
		console.log(
			'[midscene] skipped: set MIDSCENE_TARGET_URL, MIDSCENE_MODEL_BASE_URL, MIDSCENE_MODEL_API_KEY, and MIDSCENE_MODEL_NAME to run UI automation.',
		);
		return;
	}

	const browser = await chromium.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	try {
		const page = await browser.newPage();
		const agent = new PlaywrightAgent(page);

		await page.goto(targetUrl);
		await page.waitForLoadState('networkidle');

		await agent.aiAssert('the RBAC management shell is visible with navigation');

		await agent.aiAct('open the organization management page');
		await agent.aiAssert('organization tree or tree table is visible');
		await agent.aiAssert('there are buttons for search, reset, expand all, collapse all, sync cache, and add organization');

		await agent.aiAct('open the role permission assignment page');
		await agent.aiAssert('role list, permission tree, permission preview, and submit buttons are visible');
		await agent.aiAssert('there are buttons for save draft, submit changes, and reset');

		await agent.aiAct('open the mobile organization directory or responsive preview');
		await agent.aiAssert('person search, pull refresh list, skeleton or empty state, and person action buttons are represented');
	} finally {
		await browser.close();
	}
}

await assertRbacPages();
