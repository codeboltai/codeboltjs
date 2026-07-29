# API Docs Index Tool Tester

CodeBolt test agent for `@codebolt/api-docs-index`. It uses local `file:` dependencies back to the sibling `CodeBolt/sdks/*` packages, matching the local-development agent format used by agents such as `testingagent`, `creation-agent`, and `platformMofier`. It uses the CodeBolt agent library (`@codebolt/agent`) to expose the deterministic smoke runner as the local tool `run_api_docs_index_smoke_test`.

It validates:

- direct API helpers (`searchApiDocs`, `getApiSpec`, module/spec/dts helpers)
- every generated API id is retrievable
- canary schema/signature values come from TypeScript declarations
- reference docs are still available with an explicit docs surface filter
- local tool schemas (`toOpenAITool()`)
- safe local tool actions for search/spec/module/example/authoring/validation/log lookup
- generated agent/plugin manifests validate successfully

Run locally without the CodeBolt terminal-backed sandbox action:

```bash
npm test
```

Run the standalone test including `test_run_agent_sandbox` only in a live CodeBolt runtime:

```bash
npm run test:runtime
```

Inside CodeBolt, ask the agent to "test all API docs index tools". Include the word `sandbox` or `runtime` to also exercise `test_run_agent_sandbox`.
