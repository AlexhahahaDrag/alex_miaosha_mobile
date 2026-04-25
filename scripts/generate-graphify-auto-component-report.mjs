import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const componentsDir = path.join(srcDir, 'views', 'components');
const outputDir = path.join(srcDir, 'graphify-notes');
const outputFile = path.join(outputDir, 'auto-component-usage.md');

const toPosix = (filePath) => path.relative(rootDir, filePath).split(path.sep).join('/');

const pascalToKebab = (value) =>
	value
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();

const readDirRecursive = async (dir, predicate) => {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return readDirRecursive(fullPath, predicate);
			}
			return predicate(fullPath) ? [fullPath] : [];
		}),
	);
	return files.flat();
};

const extractTemplate = (content) => {
	const match = content.match(/<template>([\s\S]*?)<\/template>/i);
	return match?.[1] ?? '';
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildReport = async () => {
	const componentFiles = await readDirRecursive(componentsDir, (file) => file.endsWith('.vue'));
	const vueFiles = await readDirRecursive(srcDir, (file) => file.endsWith('.vue'));

	const componentMap = componentFiles.map((file) => {
		const baseName = path.basename(file, '.vue');
		return {
			file,
			name: baseName,
			tag: pascalToKebab(baseName),
		};
	});

	const usageMap = new Map(componentMap.map((component) => [component.name, []]));

	for (const vueFile of vueFiles) {
		const content = await fs.readFile(vueFile, 'utf8');
		const template = extractTemplate(content);
		if (!template) {
			continue;
		}

		for (const component of componentMap) {
			if (component.file === vueFile) {
				continue;
			}

			const tagPattern = new RegExp(`<${escapeRegex(component.tag)}(?:\\s|>|/)`, 'i');
			if (tagPattern.test(template)) {
				usageMap.get(component.name)?.push(toPosix(vueFile));
			}
		}
	}

	const lines = [
		'# Auto Component Usage',
		'',
		'This file is generated for graphify and human inspection.',
		'',
		'Why it exists:',
		'- This project uses `unplugin-vue-components` in `vite.config.ts`.',
		'- Many Vue SFCs use shared components via template tags without explicit `import` statements.',
		'- AST-only graph extraction can miss these view-to-component relationships.',
		'',
	];

	for (const component of componentMap.sort((a, b) => a.name.localeCompare(b.name))) {
		const consumers = usageMap.get(component.name) ?? [];
		lines.push(`## ${component.name}`);
		lines.push(`- component: \`${toPosix(component.file)}\``);
		lines.push(`- template tag: \`<${component.tag}>\``);
		lines.push(`- referenced by ${consumers.length} file(s)`);
		if (consumers.length === 0) {
			lines.push('- consumers: none detected');
		} else {
			for (const consumer of consumers.sort()) {
				lines.push(`- consumer: \`${consumer}\``);
			}
		}
		lines.push('');
	}

	await fs.mkdir(outputDir, { recursive: true });
	await fs.writeFile(outputFile, `${lines.join('\n')}\n`, 'utf8');
};

await buildReport();
