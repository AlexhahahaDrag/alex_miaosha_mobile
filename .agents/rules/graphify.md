## graphify

This project has a graphify knowledge graph at src/graphify-out/.

Rules:
- Before answering architecture or codebase questions, read src/graphify-out/GRAPH_REPORT.md for god nodes and community structure
- Read `GRAPHIFY_PROJECT_NOTES.md` before inferring dependencies from missing import statements in Vue files
- If src/graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- If the graphify MCP server is active, utilize tools like `query_graph`, `get_node`, and `shortest_path` for precise architecture navigation instead of falling back to `grep`
- If the MCP server is not active, the CLI equivalents are `graphify query "<question>"`, `graphify path "<A>" "<B>"`, and `graphify explain "<concept>"` because they are better than grep for cross-module questions
- After modifying code files in this session, run `graphify update src` to keep the graph current (AST-only, no API cost)
