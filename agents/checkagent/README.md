# Check Agent

CodeBolt-native testing plan runner agent.

Start this agent from another agent with a message that mentions an AutoTesting
case/run/suite id. For compatibility, it can also accept a testing plan file
path, for example:

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

- `codebolt.autoTesting` to load cases and runs, create runs, and update status.
- `codebolt.llm.inference` to extract the fallback plan path from the message.
- `codebolt.fs` only to read fallback plan files when no AutoTesting id is provided.
- `codebolt.artifact` to publish browser evidence as a CodeBolt artifact.
- `codebolt.browser.*` to run web plan steps.
- `codebolt.llm.inference` to resolve semantic candidates, judge semantic
  assertions, classify failures, and suggest provider-neutral refinements.

Code layout:

- `index.js` starts the agent.
- `lib/app.js` handles incoming messages and suite orchestration.
- `lib/runner.js` executes testing plans and reports AutoTesting status.
- `lib/autotesting.js` contains AutoTesting suite, case, run, and status helpers.
- `lib/web-provider.js` contains the CodeBolt browser provider.
- `lib/artifacts.js` keeps transient run evidence in memory and publishes
  CodeBolt artifacts.
- `lib/plan-loader.js`, `lib/candidates.js`, `lib/verifier.js`, and
  `lib/browser-targets.js` keep parsing, resolution, assertion, and browser
  targeting logic separate.

Run state and step evidence are recorded through AutoTesting run, case, and step
status updates. The agent no longer writes trace/result files with
`codebolt.fs.createFile`; transient observations stay in memory for the current
run and compact evidence is attached to AutoTesting step notes.

During browser runs, Check Agent starts browser recording when the runtime
supports it. Each executed test plan/case publishes its own browser evidence
artifact as soon as that test finishes, including tests inside suite runs. It
publishes a video artifact from the recording when the stop response includes a
usable URL, path, or base64 payload. If no video payload is available, it
publishes the latest browser screenshot as an image snapshot artifact, falling
back to an in-memory browser snapshot artifact only when no screenshot is available. The
returned test JSON includes `publishedArtifact`; suite summaries also collect
those per-test results in `publishedArtifacts`. Artifact publishing errors are
reported there but do not change the test verdict.

The plan file remains provider-neutral. Browser engines, Playwright, Stagehand,
Appium, OpenAI, or terminal-specific implementation names should not appear in
the plan.
