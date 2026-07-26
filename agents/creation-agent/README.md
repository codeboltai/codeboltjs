# Creation Agent

Creates and updates CodeBolt extensions from natural-language requests: agents, plugins, dynamic plugins, providers, and ActionBlocks.

This agent is an orchestrator over phased subagents. Each phase runs in a fresh context and returns a structured artifact, so the main agent only coordinates decisions and results.

## API Docs Usage

This agent uses `@codebolt/api-docs-index` in multiple phases:

- `plan_agent` keeps the existing deterministic agent-only flow for normal agent creation.
- `plan_creation` produces a target-aware plan for agents, plugins, dynamic plugins, providers, and ActionBlocks.
- `resolve_apis` resolves approved agent plans to concrete SDK APIs and examples.
- `resolve_creation_apis` resolves target-aware plans to SDK APIs, manifest/runtime contracts, target docs, examples, and validation requirements.
- `write_agent_code` uses the deterministic agent scaffold and scoped `.d.ts` declarations.
- `write_plugin_code`, `write_dynamic_plugin_code`, `write_provider_code`, and `write_actionblock_code` generate target-specific projects without forcing `codeboltagent.yaml` or agent templates.
- `verify_agent` still performs the final agent-specific manifest/API/build/drift verification for generated agents.

## Flow

1. Understand whether the user wants an agent, plugin, dynamic plugin, provider, or ActionBlock.
2. For agents, use the existing `plan_agent -> resolve_apis -> write_agent_code -> verify_agent` flow.
3. For non-agent targets, use `plan_creation -> resolve_creation_apis`.
4. Route to the matching writer:
   - `plugin` -> `write_plugin_code`
   - `dynamic-plugin` -> `write_dynamic_plugin_code`
   - `provider` -> `write_provider_code`
   - `actionblock` -> `write_actionblock_code`
5. Report the generated path, validation results, unresolved blockers, and any remaining manual steps.

## Verification Notes

`validate_api_usage` currently validates whether literal `codebolt.<module>.<method>` usages exist in the generated API docs index. Type and argument correctness are primarily covered by the generated project's TypeScript typecheck/build step.

Agent projects still get final `verify_agent` checks. Plugin, dynamic plugin, provider, and ActionBlock projects currently rely on their target-aware writer validation and should get dedicated verifier tools next: `verify_plugin`, `verify_dynamic_plugin`, `verify_provider`, and `verify_actionblock`.

## Development

```bash
npm install
npm run build
npm run dev
```
