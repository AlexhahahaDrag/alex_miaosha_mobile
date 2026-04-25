import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const graphJsonPath = path.join(srcDir, 'graphify-out', 'graph.json');
const graphHtmlPath = path.join(srcDir, 'graphify-out', 'graph.html');
const toWindowsPath = (filePath) => filePath.split('/').join('\\');

const toPosixPath = (filePath) => filePath.split(path.sep).join('/');

const pascalToKebab = (value) =>
	value
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readDirRecursive = async (dir, predicate) => {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return readDirRecursive(fullPath, predicate);
			}
			return predicate(fullPath) ? [fullPath] : [];
		}),
	);
	return nested.flat();
};

const extractTemplate = (content) => {
	const match = content.match(/<template>([\s\S]*?)<\/template>/i);
	return match?.[1] ?? '';
};

const degreeToSize = (degree) => {
	if (degree <= 0) {
		return 10.0;
	}
	return Number((10 + Math.log2(degree + 1) * 0.6).toFixed(1));
};

const AUTO_IMPORT_APIS = {
	vue: ['ref', 'computed', 'watch', 'reactive', 'onMounted', 'onUnmounted'],
	'vue-router': ['useRouter', 'useRoute'],
	pinia: ['defineStore'],
};

const buildAutoComponentEdges = async () => {
	const componentsDir = path.join(srcDir, 'views', 'components');
	const componentFiles = await readDirRecursive(componentsDir, (file) => file.endsWith('.vue'));
	const vueFiles = await readDirRecursive(srcDir, (file) => file.endsWith('.vue'));

	const components = componentFiles.map((file) => ({
		file,
		tag: pascalToKebab(path.basename(file, '.vue')),
	}));

	const edges = [];

	for (const vueFile of vueFiles) {
		const content = await fs.readFile(vueFile, 'utf8');
		const template = extractTemplate(content);
		if (!template) {
			continue;
		}

		for (const component of components) {
			if (component.file === vueFile) {
				continue;
			}

			const tagPattern = new RegExp(`<${escapeRegex(component.tag)}(?:\\s|>|/)`, 'i');
			if (!tagPattern.test(template)) {
				continue;
			}

			edges.push({
				sourceFile: toWindowsPath(toPosixPath(path.relative(rootDir, vueFile))),
				targetFile: toWindowsPath(toPosixPath(path.relative(rootDir, component.file))),
				tag: component.tag,
			});
		}
	}

	return edges;
};

const syncGraphJson = async (autoComponentEdges) => {
	const raw = await fs.readFile(graphJsonPath, 'utf8');
	const graph = JSON.parse(raw);

	const basenameMatchesLabel = (node) => {
		if (typeof node.source_file !== 'string' || typeof node.label !== 'string') {
			return false;
		}
		const sourceName = node.source_file.split('\\').pop();
		return node.label === sourceName;
	};

	const fileNodes = new Map();
	for (const node of graph.nodes) {
		if (!basenameMatchesLabel(node)) {
			continue;
		}
		fileNodes.set(node.source_file, node);
	}

	graph.nodes = graph.nodes.filter((node) => !node.synthetic_auto_import);
	graph.links = graph.links.filter(
		(link) =>
			!['uses_component_auto', 'uses_auto_import_api', 'auto_imported_from'].includes(link.relation),
	);

	const existingKeys = new Set(
		graph.links.map(
			(link) => `${link._src ?? link.target}->${link._tgt ?? link.source}:${link.relation}`,
		),
	);

	let added = 0;

	for (const edge of autoComponentEdges) {
		const sourceNode = fileNodes.get(edge.sourceFile);
		const targetNode = fileNodes.get(edge.targetFile);
		if (!sourceNode || !targetNode) {
			continue;
		}

		const key = `${sourceNode.id}->${targetNode.id}:uses_component_auto`;
		if (existingKeys.has(key)) {
			continue;
		}

		graph.links.push({
			relation: 'uses_component_auto',
			confidence: 'EXTRACTED',
			source_file: edge.sourceFile,
			source_location: 'template',
			weight: 1.0,
			_src: sourceNode.id,
			_tgt: targetNode.id,
			source: targetNode.id,
			target: sourceNode.id,
			confidence_score: 1.0,
			component_tag: edge.tag,
		});

		existingKeys.add(key);
		added += 1;
	}

	const maxCommunity = Math.max(...graph.nodes.map((node) => node.community ?? -1), -1);
	const packageCommunities = new Map(
		Object.keys(AUTO_IMPORT_APIS).map((pkg, index) => [pkg, maxCommunity + 1 + index]),
	);

	const syntheticNodes = [];
	const apiNodesByName = new Map();

	for (const [pkg, apiNames] of Object.entries(AUTO_IMPORT_APIS)) {
		const packageId = `autoimport_pkg_${pkg.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`;
		const packageNode = {
			id: packageId,
			label: `${pkg} (AutoImport)`,
			file_type: 'synthetic',
			source_file: 'vite.config.ts',
			source_location: 'AutoImport',
			community: packageCommunities.get(pkg),
			norm_label: `${pkg} autoimport`,
			degree: 0,
			synthetic_auto_import: true,
		};
		syntheticNodes.push(packageNode);

		for (const apiName of apiNames) {
			const apiId = `autoimport_api_${apiName.toLowerCase()}`;
			const apiNode = {
				id: apiId,
				label: `${apiName}()`,
				file_type: 'synthetic',
				source_file: 'vite.config.ts',
				source_location: 'AutoImport',
				community: packageCommunities.get(pkg),
				norm_label: apiName.toLowerCase(),
				degree: 0,
				synthetic_auto_import: true,
			};
			syntheticNodes.push(apiNode);
			apiNodesByName.set(apiName, apiNode);
			graph.links.push({
				relation: 'auto_imported_from',
				confidence: 'EXTRACTED',
				source_file: 'vite.config.ts',
				source_location: 'AutoImport',
				weight: 1.0,
				_src: apiId,
				_tgt: packageId,
				source: packageId,
				target: apiId,
				confidence_score: 1.0,
			});
		}
	}

	graph.nodes.push(...syntheticNodes);

	const allFiles = await readDirRecursive(
		srcDir,
		(file) => file.endsWith('.vue') || file.endsWith('.ts'),
	);
	const fileNodeBySource = new Map();
	for (const node of graph.nodes) {
		if (basenameMatchesLabel(node)) {
			fileNodeBySource.set(node.source_file, node);
		}
	}

	for (const file of allFiles) {
		const relativeFile = toWindowsPath(toPosixPath(path.relative(rootDir, file)));
		const fileNode = fileNodeBySource.get(relativeFile);
		if (!fileNode) {
			continue;
		}

		const content = await fs.readFile(file, 'utf8');

		for (const apiNames of Object.values(AUTO_IMPORT_APIS)) {
			for (const apiName of apiNames) {
				const pattern = new RegExp(`\\b${escapeRegex(apiName)}\\s*\\(`, 'm');
				if (!pattern.test(content)) {
					continue;
				}

				const apiNode = apiNodesByName.get(apiName);
				if (!apiNode) {
					continue;
				}

				const usageKey = `${fileNode.id}->${apiNode.id}:uses_auto_import_api`;
				if (existingKeys.has(usageKey)) {
					continue;
				}

				graph.links.push({
					relation: 'uses_auto_import_api',
					confidence: 'EXTRACTED',
					source_file: relativeFile,
					source_location: 'script',
					weight: 1.0,
					_src: fileNode.id,
					_tgt: apiNode.id,
					source: apiNode.id,
					target: fileNode.id,
					confidence_score: 1.0,
				});
				existingKeys.add(usageKey);
				added += 1;
			}
		}
	}

	const degreeMap = new Map(graph.nodes.map((node) => [node.id, 0]));
	for (const link of graph.links) {
		const fromId = link._src ?? link.target;
		const toId = link._tgt ?? link.source;
		if (degreeMap.has(fromId)) {
			degreeMap.set(fromId, degreeMap.get(fromId) + 1);
		}
		if (degreeMap.has(toId)) {
			degreeMap.set(toId, degreeMap.get(toId) + 1);
		}
	}

	for (const node of graph.nodes) {
		node.degree = degreeMap.get(node.id) ?? 0;
	}

	await fs.writeFile(graphJsonPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
	return { graph, added };
};

const buildHtmlNodes = (nodes, communityColors) =>
	nodes.map((node) => {
		const community = node.community ?? -1;
		const color = communityColors.get(community) ?? '#888888';
		return {
			id: node.id,
			label: node.label,
			color: {
				background: color,
				border: color,
				highlight: { background: '#ffffff', border: color },
			},
			size: degreeToSize(node.degree ?? 0),
			font: { size: 0, color: '#ffffff' },
			title: node.label,
			community,
			community_name: `Community ${community}`,
			source_file: node.source_file,
			file_type: node.file_type,
			degree: node.degree ?? 0,
		};
	});

const buildHtmlEdges = (links) =>
	links.map((link) => {
		const relation = link.relation ?? '';
		const confidence = link.confidence ?? 'EXTRACTED';
		const isInferred = confidence !== 'EXTRACTED';
		const fromId = link._src ?? link.target;
		const toId = link._tgt ?? link.source;
		return {
			from: fromId,
			to: toId,
			label: relation,
			title: `${relation} [${confidence}]`,
			dashes: isInferred,
			width: isInferred ? 1 : 2,
			color: { opacity: isInferred ? 0.35 : 0.7 },
			confidence,
		};
	});

const syncGraphHtml = async (graph) => {
	const html = await fs.readFile(graphHtmlPath, 'utf8');
	const communities = [...new Set(graph.nodes.map((node) => node.community ?? -1))].sort(
		(a, b) => a - b,
	);
	const palette = [
		'#4E79A7',
		'#F28E2B',
		'#E15759',
		'#76B7B2',
		'#59A14F',
		'#EDC948',
		'#B07AA1',
		'#FF9DA7',
		'#9C755F',
		'#BAB0AC',
	];
	const communityColors = new Map(
		communities.map((community, index) => [community, palette[index % palette.length]]),
	);

	const rawNodes = buildHtmlNodes(graph.nodes, communityColors);
	const rawEdges = buildHtmlEdges(graph.links);
	const legend = communities.map((community, index) => ({
		cid: community,
		color: palette[index % palette.length],
		label: `Community ${community}`,
		count: graph.nodes.filter((node) => (node.community ?? -1) === community).length,
	}));
	const statsLine = `${graph.nodes.length} nodes &middot; ${graph.links.length} edges &middot; ${communities.length} communities`;

	let nextHtml = html.replace(
		/const RAW_NODES = .*?;\r?\n/s,
		`const RAW_NODES = ${JSON.stringify(rawNodes)};\n`,
	);
	nextHtml = nextHtml.replace(
		/const RAW_EDGES = .*?;\r?\nconst LEGEND = /s,
		`const RAW_EDGES = ${JSON.stringify(rawEdges)};\nconst LEGEND = `,
	);
	nextHtml = nextHtml.replace(
		/const LEGEND = .*?;\r?\n\r?\n\/\/ HTML-escape helper/s,
		`const LEGEND = ${JSON.stringify(legend)};\n\n// HTML-escape helper`,
	);
	nextHtml = nextHtml.replace(/<div id="stats">.*?<\/div>/, `<div id="stats">${statsLine}</div>`);

	await fs.writeFile(graphHtmlPath, nextHtml, 'utf8');
};

const main = async () => {
	const autoComponentEdges = await buildAutoComponentEdges();
	const { graph, added } = await syncGraphJson(autoComponentEdges);
	await syncGraphHtml(graph);
	process.stdout.write(`Added ${added} augmented graph link(s).\n`);
};

await main();
