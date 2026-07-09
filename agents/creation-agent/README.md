# Creation Agent

Creates custom CodeBolt agents from natural-language requests.

This agent uses `@codebolt/api-docs-index` in two ways:

- It imports `apiDocsIndexTools` as local CodeBolt agent tools, so the internal LLM can call `search_api_docs`, `get_api_spec`, and `list_api_categories` during generation.
- It performs a small initial API-doc search before the first LLM turn, so the creator starts with relevant SDK context.

## Flow

1. Understand the requested agent.
2. Search CodeBolt API docs for relevant SDK calls.
3. Produce an internal blueprint.
4. Create or update an agent folder, usually under `agents/<agent-id>`.
5. Write `package.json`, `codeboltagent.yaml`, `tsconfig.json`, `webpack.config.js`, and `src/index.ts`.
6. Run build/typecheck validation when available.
7. Report the generated path and any remaining manual steps.

## Development

```bash
npm install
npm run build
npm run dev
```
