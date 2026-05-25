# Check Agent

CodeBolt-native testing plan runner agent.

Start this agent from another agent with a message that mentions a testing plan
file path, for example:

```text
Run the testing plan at D:\agentictest\examples\web-headed-semantic-llm.plan.yaml
```

Parent-agent handoff:

```js
await codebolt.agent.startAgent(
  "checkagent",
  "Run the testing plan at D:\\agentictest\\examples\\web-headed-semantic-llm.plan.yaml"
);
```

The agent uses:

- `codebolt.llm.inference` to extract the plan path from the message.
- `codebolt.fs` to read the plan file and write run artifacts.
- `codebolt.browser.*` to run web plan steps.
- `codebolt.llm.inference` to resolve semantic candidates, judge semantic
  assertions, classify failures, and suggest provider-neutral refinements.

Artifacts are written beside the active project under:

```text
.agent-check\runs\<runId>\
```

The plan file remains provider-neutral. Browser engines, Playwright, Stagehand,
Appium, OpenAI, or terminal-specific implementation names should not appear in
the plan.
