## graphify

This project has a graphify knowledge graph at src/graphify-out/.

Rules:
- Before answering architecture or codebase questions, read src/graphify-out/GRAPH_REPORT.md for god nodes and community structure
- Read `DEVELOPMENT.md` before inferring dependencies from missing import statements in Vue files
- If src/graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep because these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update src` to keep the graph current (AST-only, no API cost)

## Knowledge Base (my_alex_brain)
- 本项目在专属全栈知识库 `D:\project\my_alex_brain\02-Mobile` 中维护了完整的 `01-需求文档/` (PRD) 与 `02-开发文档/` (适配与交互规约)。
- 修改移动端记账业务逻辑、触觉交互、日期工具或页面流转后，**必须同步更新 `D:\project\my_alex_brain\02-Mobile` 对应文档**，确保知识库与代码逻辑保持 100% 实时同步。

