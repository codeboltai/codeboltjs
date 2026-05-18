# Test Feature Bug Implemented Main Agent

`test-feature-bug-implemented-main-agent` is a CodeBolt ActionBlock that verifies a feature or bug fix implemented by the main agent through a black-box Agentic TUI tester loop.

On every invocation it immediately sends this chat message so the main thread can confirm the ActionBlock started:

```text
CLI testing ActionBlock started
```

## What it does

- Runs as a side-execution mini-agent through `codebolt.onActionBlockInvocation`.
- Uses the ActionBlock `threadContext` already sent by CodeBolt; it does not use the context message modifiers from the full `act-updated` agent.
- Removes caller-supplied `command` and `commands` params before prompting the verifier.
- Resolves the active CodeBolt project path with `codebolt.project.getProjectPath()` and runs fixed setup/build scripts there before the mini-agent runs.
- Creates a disposable temp project folder and starts Agentic TUI against that folder through a visible `codebolt.terminal.tui.run` session.
- Lets the mini-agent test only by interacting with the running Agentic TUI screen.
- Exposes only the `terminal_tui` tool to the mini-agent.
- Does not expose file, search, codebase, shell command, install, build, or start work to the mini-agent.
- Returns structured `success`, `result`, `verification`, `filesCreated`, and optional `error` fields.

## Invocation params

`spec` is optional verifier guidance. Do not pass shell commands as the source of truth; command fields are removed before the mini-agent runs.

```json
{
  "spec": {
    "title": "Verify chat scroll overwrite bug fix",
    "bugSummary": "New chat rows should not merge with stale rendered rows.",
    "expectedBehavior": "A new message pushes previous rows upward cleanly.",
    "acceptanceCriteria": [
      "Agentic TUI starts successfully.",
      "The tester can reproduce the relevant user workflow in the TUI.",
      "The visible TUI behavior matches the expected behavior."
    ]
  }
}
```

## Output shape

```json
{
  "success": true,
  "result": {
    "title": "Verify chat scroll overwrite bug fix",
    "startupMessage": "CLI testing ActionBlock started",
    "startupMessageSent": true,
    "lifecycleSteps": [
      {
        "name": "Agentic TUI dependency setup",
        "phase": "setup",
        "scriptName": "prepare:agentic-tui:setup",
        "success": true,
        "outputPreview": "..."
      }
    ],
    "agenticTuiSession": {
      "sessionId": "actionblock-agentic-tui-...",
      "started": true,
      "projectPath": "/tmp/codebolt-agentic-tui-test-...",
      "sourceProjectPath": "/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt",
      "screenPreview": "...",
      "cleanup": {
        "attempted": true,
        "success": true
      },
      "tempProjectCleanup": {
        "attempted": true,
        "success": true
      }
    },
    "sanitizedSpec": {},
    "sanitizedParams": {},
    "miniAgentReport": {
      "verdict": "passed",
      "summary": "Visible Agentic TUI behavior matched the expected fix.",
      "scope": ["packages/gotui", "packages/cli"],
      "commandsRun": [],
      "checks": [],
      "issues": [],
      "recommendations": []
    },
    "recommendations": []
  },
  "verification": {
    "passed": true,
    "checks": [
      {
        "name": "startup-message-attempted",
        "success": true,
        "details": "CLI testing ActionBlock started was sent."
      }
    ]
  },
  "filesCreated": []
}
```

If verification fails or is inconclusive, `success` is `false`, `error` is populated, and `result.miniAgentReport.issues` explains what the main agent must address.

## Parent agent invocation

By registered ActionBlock name:

```ts
const result = await codebolt.actionBlock.start(
  'test-feature-bug-implemented-main-agent',
  {
    spec: {
      title: 'Verify implemented GotUI/CLI change',
      description: 'Verify the main agent change by testing visible Agentic TUI behavior.'
    }
  }
);
```

By filesystem path:

```ts
const result = await codebolt.sideExecution.startWithActionBlock(
  '.codebolt/actionblocks/test-feature-bug-implemented-main-agent',
  {
    spec: {
      title: 'Verify implemented GotUI/CLI change',
      description: 'Verify the main agent change by testing visible Agentic TUI behavior.'
    }
  },
  300000
);
```

## Agentic TUI Startup

The ActionBlock wrapper starts Agentic TUI itself after setup and build. It creates a temp project folder under the OS temp directory and passes that folder to the CLI as `--project`, so testing does not happen inside the CodeBolt source checkout. It uses the CodeBolt repo only as the CLI working directory so `packages/cli/dist/index.js` can be launched. The mini-agent receives only the generated TUI `sessionId`, temp project path, source project path for reporting context, and an initial screen preview.

## Build

From this ActionBlock directory:

```bash
npm install
npm run build
```

The build emits `dist/index.js` and copies `actionblock.yml` to `dist/actionblock.yml`.
These developer setup/build commands are not included in the mini-agent prompt.

## Deterministic lifecycle scripts

The ActionBlock wrapper calls `codebolt.project.getProjectPath()` when it starts, passes the returned path as `CODEBOLT_BASE_PROJECT_PATH`, and runs these package scripts before launching the Agentic TUI session:

```bash
npm run prepare:agentic-tui:setup
npm run prepare:agentic-tui:package
```

`prepare:agentic-tui:package` rebuilds GotUI native artifacts, multillm, server, client SDK, web, and then runs `tsc` in `packages/cli`.

The mini-agent does not receive the install/build/start commands. It receives lifecycle pass/fail state, the TUI session id, and visible screen content to test through `terminal_tui`.

## Testing

Local checks:

```bash
npm run build
node -c dist/index.js
node -e "const fs=require('fs'); if(!fs.existsSync('dist/actionblock.yml')) process.exit(1);"
```

Runtime checks:

1. Use `actionBlock_list` to confirm discovery.
2. Use `actionBlock_getDetail` for `test-feature-bug-implemented-main-agent`.
3. Use `actionBlock_start` with a GotUI or CLI spec.
4. Confirm the chat shows `CLI testing ActionBlock started`.
5. Confirm `result.startupMessageSent` is `true`.
6. Confirm params containing `commands` are sanitized and not automatically executed.
7. Confirm `result.agenticTuiSession.started` is `true`.
8. Confirm `result.agenticTuiSession.projectPath` points to a temp folder named `codebolt-agentic-tui-test-*`, not the CodeBolt checkout.
9. Confirm `result.agenticTuiSession.tempProjectCleanup.success` is `true`.
10. Confirm the mini-agent has only `terminal_tui` and does not inspect source files.

## Notes

- The verifier is a black-box tester; it must not repair or inspect source files.
- The mini-agent drives the TUI using `screen`, `wait`, `type`, `press`, `search`, `region`, `wheel`, `resize`, `cursor`, and `output`.
- Setup, build, launch, and cleanup are wrapper responsibilities, not LLM-selected work.
