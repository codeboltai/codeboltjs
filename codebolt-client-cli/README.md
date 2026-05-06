# @codebolt/client-cli

Command-line client for interacting with a running CodeBolt server from scripts, terminals, CI jobs, and local development workflows.

The CLI wraps the CodeBolt client SDK and exposes high-level commands for chat, agents, projects, tasks, memory, knowledge, browser automation, MCP servers, and other CodeBolt server resources.

## Installation

Install globally:

```sh
npm install -g @codebolt/client-cli
```

Run without a global install:

```sh
npx @codebolt/client-cli --help
```

After installation, the executable is:

```sh
codebolt-client --help
```

## Requirements

- Node.js 20 or newer is recommended.
- A running CodeBolt server that exposes the client HTTP and WebSocket APIs.
- Network access from your terminal to the server host and port.

By default, the CLI connects to:

```text
localhost:12345
```

You can override this with `--host`, `--port`, or the `SOCKET_PORT` environment variable.

## Global Options

These options are available on the root command and apply to subcommands:

```text
-p, --port <number>   Server port. Defaults to SOCKET_PORT or 12345.
-H, --host <string>   Server hostname. Defaults to localhost.
--json                Emit machine-readable JSON where supported.
--debug               Enable debug logging.
--timeout <ms>        HTTP timeout in milliseconds. Defaults to 30000.
```

Example:

```sh
codebolt-client --host 127.0.0.1 --port 12345 --json project info
```

## Quick Start

Check the CLI:

```sh
codebolt-client system check-cli
```

Send a chat message and wait for completion:

```sh
codebolt-client chat send --message "Summarize the current project"
```

Send a chat message with streamed output:

```sh
codebolt-client chat send-streaming --message "Create a task plan for this bug"
```

List installed agents:

```sh
codebolt-client agent list
```

Get current project information:

```sh
codebolt-client project info
```

## Command Groups

Use `codebolt-client help <command>` for command-specific options.

| Command | Purpose |
| --- | --- |
| `chat` | Send messages, stream responses, manage threads, and store chat messages. |
| `agent` | List, install, start, stop, update, and inspect agents. |
| `execution` | Inspect agent executions and execution trees. |
| `git` | Run CodeBolt-backed git operations such as status, diff, commit, branch, push, pull, and clone. |
| `task` | Create, update, list, delete, and inspect tasks. |
| `project` | Read and update project context, active project, threads, and chat history. |
| `workspace` | List, inspect, and select workspaces. |
| `llm` | List providers and models, update keys, set defaults, and inspect local model state. |
| `memory` | Manage generic, markdown, JSON, context, and episodic memory. |
| `knowledge` | Manage knowledge collections, documents, URLs, and strategies. |
| `swarm` | Create, start, stop, inspect, and manage swarms, teams, roles, and swarm agents. |
| `env` | Manage environments and environment providers. |
| `job` | Create, update, list, delete, and inspect jobs. |
| `actionblock` | List action blocks, inspect details, stop executions, and view stats. |
| `browser` | Navigate, click, fill, screenshot, and send browser automation actions. |
| `mcp` | List, inspect, configure, toggle, and install MCP servers. |
| `file` | Check for files and add file content through the CodeBolt server. |
| `system` | Check or install CLI-related system state. |

## Common Examples

List chat threads:

```sh
codebolt-client chat threads list
```

Create a task:

```sh
codebolt-client task create --title "Investigate failing build" --priority high
```

Update a task:

```sh
codebolt-client task update task_123 --status in-progress
```

Show git status:

```sh
codebolt-client git status
```

Create a git commit:

```sh
codebolt-client git commit --message "Fix client CLI package metadata"
```

Navigate the browser:

```sh
codebolt-client browser navigate --url "http://localhost:3000"
```

Configure an MCP server from JSON:

```sh
codebolt-client mcp configure --data "{\"name\":\"local-server\",\"enabled\":true}"
```

## JSON Output

Use `--json` for automation and scripts:

```sh
codebolt-client --json task list --status open
```

For commands that return structured data, the CLI writes JSON to stdout. Errors are written in a consistent error format where supported.

## Chat Completion Output

`chat send` and `chat send-streaming` connect to the CodeBolt chat WebSocket endpoint and wait for the agent process to finish.

When the server provides debug information, completion output can include:

- Thread ID
- Project path
- Thread chat path
- Debug log paths
- Child agent execution details

Use `--timeout` on chat commands for long-running agent work:

```sh
codebolt-client chat send --message "Run the full review" --timeout 900000
```

## Local Development

This package is built from the `codeboltjs` checkout and uses local sibling packages from the main `CodeBolt` checkout:

- `../../CodeBolt/packages/types`
- `../../CodeBolt/sdks/clientsdk`

Install dependencies:

```sh
npm install
```

Build the CLI and its local SDK/type dependencies:

```sh
npm run build
```

Build only the CLI bundle:

```sh
npm run build:local
```

Type-check without emitting files:

```sh
npm run typecheck
```

Create a local npm tarball preview:

```sh
npm pack --json --ignore-scripts
```

## Publishing

The package publishes the bundled `dist` output and the executable in `bin`.

Before publishing:

```sh
npm install
npm run build
npm pack --json --ignore-scripts
```

Publish publicly:

```sh
npm publish --access public
```

## Troubleshooting

### npm install returns 404

If the npm website shows the package but `npm install` returns 404, check that npm is using the public registry:

```sh
npm config get registry
npm config get @codebolt:registry
```

Force the public registry for one install:

```sh
npm install -g @codebolt/client-cli --registry=https://registry.npmjs.org/
```

If the package was just published, npm registry propagation can briefly lag behind the website. Retry after a few minutes.

### Cannot connect to the server

Verify the CodeBolt server is running and that the CLI is using the correct host and port:

```sh
codebolt-client --host localhost --port 12345 system check-cli
```

### Commands need JSON payloads

Many commands accept JSON through `--data`. Quote JSON according to your shell. In PowerShell:

```powershell
codebolt-client job create --data '{\"title\":\"Build package\",\"status\":\"open\"}'
```

## License

MIT
