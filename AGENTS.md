## graphify

This project has a graphify knowledge graph at src/graphify-out/.

Rules:
- Before answering architecture or codebase questions, read src/graphify-out/GRAPH_REPORT.md for god nodes and community structure
- Read `GRAPHIFY_PROJECT_NOTES.md` before inferring dependencies from missing import statements in Vue files
- If src/graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep because these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update src` to keep the graph current (AST-only, no API cost)
