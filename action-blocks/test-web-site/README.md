# Test Web Site

`test-web-site` is a CodeBolt ActionBlock for the current website project.

It installs dependencies, builds the static website, starts the website with the project `npm run dev` script on an allocated local port, then runs a mini-agent loop. The mini-agent must start and control `agent-browser` through terminal commands, record the browser test, test the visible website UI as a black-box user, and publish the recording with the CodeBolt artifact tool.

## Invocation

By registered ActionBlock name:

```ts
const result = await codebolt.actionBlock.start('test-web-site', {
  cwd: '/Users/ravirawat/Documents/codeboltai/AiEditor/website',
  spec: {
    title: 'Verify website change'
  }
});
```

By filesystem path:

```ts
const result = await codebolt.sideExecution.startWithActionBlock(
  '.codebolt/actionblocks/test-web-site',
  {
    cwd: '/Users/ravirawat/Documents/codeboltai/AiEditor/website'
  },
  300000
);
```

## Workflow

- Required project files are checked before launch: `package.json`, `content/site.yaml`, and `template/package.json`.
- The ActionBlock checks required project files: `package.json`, `content/site.yaml`, and `template/package.json`.
- The ActionBlock runs `npm install --loglevel error` from the repository root.
- The ActionBlock runs `npm run build` from the repository root to generate the production static site.
- The ActionBlock confirms `site/dist/index.html` exists after the static build.
- The ActionBlock starts the website with `npm run dev -- --port <port>` from the repository root.
- The mini-agent receives the local app URL.
- The mini-agent uses `terminal_execute_command` or `execute_command` to run `agent-browser`.
- The mini-agent starts recording before any website interaction.
- The mini-agent verifies only the main-agent-provided task through visible UI interactions.
- If no concrete test task is supplied, the mini-agent reports the run as inconclusive.
- The mini-agent stops/exports the recording after testing, saving it inside the current project whenever `agent-browser` supports choosing an output path.
- The mini-agent creates a `static_site` artifact for the recording from an in-project folder using `artifact_create`.
- The final result is parsed from the mini-agent's JSON report.

## Build

From this ActionBlock directory:

```bash
npm run build
node -c dist/index.js
```
