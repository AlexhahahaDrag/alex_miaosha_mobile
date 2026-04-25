# Graphify Project Notes

This Vite project uses `unplugin-auto-import` and `unplugin-vue-components`.

Implications for code navigation and architecture analysis:

- Many Vue APIs such as `ref`, `computed`, `watch`, `onMounted`, `useRouter`, `useRoute`, and Pinia helpers may be used without explicit `import` statements in source files.
- Many Vant components and some project components may be available without explicit local imports because they are resolved by the Vite plugin layer.
- Do not assume "no import statement" means "no dependency". Check [vite.config.ts](D:/project/alex_miaosha_mobile/vite.config.ts) when reasoning about component usage or Vue API availability.
- Template tags such as `<common-pull-refresh>` can represent real component dependencies even when `graphify` cannot derive an AST-level import edge.
- Generated declaration files such as `components.d.ts` and `src/auto-imports.d.ts` are implementation artifacts and are excluded from graphify indexing to reduce noise.
- A generated helper file at `src/graphify-notes/auto-component-usage.md` records detected view-to-auto-component usage for graphify and manual inspection.

Current relevant Vite plugin setup:

- `AutoImport` imports from `vue`, `vue-router`, and `pinia`
- `AutoImport` uses `VantResolver()`
- `Components` uses `VantResolver()`
- `Components` scans `src/views`
