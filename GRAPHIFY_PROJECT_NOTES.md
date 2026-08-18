# Graphify Project Notes

This Vite + uni-app mobile project uses auto-import and auto-component resolution.

Implications for code navigation and architecture analysis:

- Vue APIs such as `ref`, `computed`, `watch`, `onMounted`, `useRouter`, `useRoute`, and Pinia helpers may appear without explicit imports.
- Vant components and project common components can be resolved from the Vite plugin layer.
- Template dependencies such as `<CommonPullRefresh>`, `<CommonList>`, and `<van-field>` are real dependencies even when graphify cannot infer an AST import edge.
- Generated declaration files such as `components.d.ts` and `src/auto-imports.d.ts` should stay out of graphify indexing.

Gift management module notes:

- Mobile gift pages live under `src/views/finance/gift`.
- Page order is significant and should match route/menu order: `dashboard`, `person`, `event`, `record`, `analysis`.
- `src/views/finance/gift/api` contains API wrappers for person, relation, event, record, statistics, and mark-returned flows.
- `src/views/finance/gift/config` contains shared enums, filters, amount shortcuts, and route/page metadata.
- `src/views/finance/gift/components/GiftRecordCard.vue` owns the card view for gift and return records.
- `src/views/finance/gift/shared.less` owns shared light mobile styling for the module.
- Return management is represented inside the record page instead of a standalone `return` page.
- Midscene mobile smoke coverage is declared in `tests/midscene/gift/cases/mobile-smoke.json`.
