# codebolt-electron-app-tester

A CodeBolt ActionBlock that creates a temporary project folder, runs `npm i`, `npm run setup`, and `npm start` for the CodeBolt Electron desktop application against that temp project, then launches an agentic mini-agent loop to test a feature specified by the main agent.

## How It Works

1. **Install**: Runs `npm i` at the project root
2. **Setup**: Runs `npm run setup` at the project root
3. **Start**: Starts the Electron app with `npm start`, remote debugging enabled, and the generated temp folder forwarded as the startup project path
4. **Test**: An agentic mini-agent interacts with the running Electron app via the external `agent-browser` CLI to verify the feature specified by the main agent
5. **Cleanup**: Stops the app session and removes temporary test project artifacts

## Invocation

Parent agents invoke this action block through the CodeBolt ActionBlock registry:

```json
{
  "actionBlockName": "codebolt-electron-app-tester",
  "params": {
    "spec": {
      "title": "Verify file explorer panel functionality",
      "featureName": "File Explorer Panel",
      "expectedBehavior": "File explorer should display the project directory tree and allow expanding/collapsing folders",
      "userWorkflow": [
        "Open the CodeBolt Electron app",
        "Locate the file explorer panel on the left sidebar",
        "Verify the project root directory is shown",
        "Click to expand a directory and verify child items appear"
      ],
      "acceptanceCriteria": [
        "File explorer panel is visible in the Electron app",
        "Project directory tree is displayed",
        "Directories can be expanded and collapsed",
        "Clicking a file opens it in the editor"
      ]
    }
  }
}
```

## Using Dedicated ActionBlock Tools

After `npm run build`, test the action block through the CodeBolt registry:

```bash
# List action blocks
actionBlock_list({ "filterType": "filesystem" })

# Get metadata
actionBlock_getDetail({ "actionBlockName": "codebolt-electron-app-tester" })

# Start the action block
actionBlock_start({
  "actionBlockName": "codebolt-electron-app-tester",
  "params": {
    "spec": {
      "title": "Smoke test",
      "featureName": "App Startup",
      "expectedBehavior": "Electron app starts and shows the main editor window",
      "acceptanceCriteria": [
        "Electron app launches without errors",
        "Main editor window is visible",
        "No error dialogs appear"
      ]
    }
  }
})
```

Expected success response shape:
```json
{
  "success": true,
  "result": {
    "title": "Verify file explorer panel functionality",
    "startupMessage": "CodeBolt Electron App Tester ActionBlock started",
    "startupMessageSent": true,
    "lifecycleSteps": [
      { "name": "Electron app dependency install", "phase": "install", "success": true },
      { "name": "Electron app setup", "phase": "setup", "success": true },
      { "name": "Electron app start", "phase": "start", "success": true }
    ],
    "electronAppSession": {
      "sessionId": "actionblock-electron-app-...",
      "started": true,
      "remoteDebuggingUrl": "http://localhost:9222"
    },
    "miniAgentReport": {
      "verdict": "passed",
      "summary": "Feature verified successfully through Electron app interaction."
    }
  },
  "verification": { "passed": true }
}
```

Invalid-input example:
```json
actionBlock_start({
  "actionBlockName": "codebolt-electron-app-tester",
  "params": {}
})
```
Expected: The action block runs with a generic title and verifies basic app startup behavior. Missing spec fields default to safe values.

## Spec Input Fields

- **title**: Concise verification title
- **featureName**: Name of the feature being tested
- **bugSummary**: Description of the bug that was fixed (if applicable)
- **expectedBehavior**: Visible behavior that should be true after the change
- **userWorkflow**: Ordered steps the tester should try in the Electron app
- **acceptanceCriteria**: Concrete pass/fail criteria based on visible app behavior
- **notes**: Additional behavioral context for the tester

Avoid passing `changedFiles`, diffs, code snippets, `command`, `commands`, `shellCommand`, or `terminalCommand` — these are sanitized/removed. The action block is a black-box tester.

## Lifecycle Commands

The wrapper runs deterministic commands at the project root before the mini-agent starts:

| Command | Phase | Description |
|--------|-------|-------------|
| `npm i` | install | Installs dependencies at the project root |
| `npm run setup` | setup | Runs the repository setup script |
| `npm start` | start | Starts the Electron app with remote debugging enabled |

## Output Structure

The action block returns a structured result with:

- **success**: Whether verification passed
- **result.lifecycleSteps**: Status of each deterministic step
- **result.electronAppSession**: Session details and cleanup status
- **result.miniAgentReport**: Verdict, checks, issues, and recommendations
- **verification**: Aggregated pass/fail checks
- **recommendations**: Actionable next steps

## Architecture

```
codebolt-electron-app-tester/
├── actionblock.yml          # Manifest: name, entryPoint, inputs, outputs
├── package.json             # Scripts for building the action block
├── tsconfig.json            # TypeScript config (Node16, strict)
├── webpack.config.js        # CommonJS2 bundle output
├── process-polyfill.js      # Process polyfill for webpack
├── src/
│   └── index.ts             # ActionBlock entry point
└── dist/
    ├── index.js             # Webpack-bundled runtime
    └── actionblock.yml      # Copied manifest
```

## Side Execution

Parent agents can also invoke via side execution:

```
side_execution_list_action_blocks → side_execution_start_action_block({ actionBlockPath, params, timeout }) → side_execution_get_status({ sideExecutionId })
```

## Notes

- The mini-agent uses only command execution for external `agent-browser` / `npx agent-browser` commands to interact with the Electron app
- CodeBolt browser MCP tools are not exposed to the verifier agent
- Source code inspection is explicitly prevented — testing is purely behavioral
- The Electron app is started against a temporary test project folder
- The temp folder is forwarded through `MAIN_ARGS`, which Electron dev startup passes into the main process
- All sessions and temp projects are cleaned up after completion
- Command strings in params are sanitized to prevent injection of install/setup/start commands
