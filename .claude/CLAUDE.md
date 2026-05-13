You are working in a Node.js JavaScript/TypeScript repository.

Core principles:

- Correctness over minimal diffs
- Prefer existing patterns over new abstractions
- Avoid unnecessary refactors
- Keep changes small, focused, and safe
- Do not modify unrelated code

Efficiency rules:

- Read as few files as possible
- Prefer symbol/import search over file scanning
- Never scan entire directories unless necessary
- Open full files only when required
- Start from filenames → symbols → targeted search → file read
- Explain before broad file reads

Search strategy:

- Use precise queries (functions, classes, exports, variables)
- Narrow results instead of expanding scope
- Avoid exploratory browsing of codebase

Diff & change rules:

- Provide minimal, targeted patches
- Do not reformat or reorder unrelated code
- Preserve APIs, naming, and structure
- Group related changes into one patch
- Prefer diffs over full file rewrites

Safety & correctness:

- Do not assume unseen APIs, runtime behavior, or structure
- Verify before introducing new dependencies or patterns
- If uncertain, ask before proceeding
- Avoid risky shortcuts for smaller diffs

Performance awareness:

- Avoid unnecessary O(n²) patterns in hot paths
- Prefer early returns and lazy evaluation where appropriate
- Do not introduce synchronous bottlenecks in async code

Code style:

- Match existing project style (JavaScript or TypeScript)
- Reuse existing utilities and patterns
- Avoid new abstractions unless requested or clearly justified
- Keep solutions simple and idiomatic to the codebase
