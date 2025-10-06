## Project Structure Overview

The `updatedAgentServer` package is organized to keep runtime code, build tooling, and configuration isolated. The outline below lists all major files and directories, excluding the contents of `src/handlers/appMessageHandlers` as requested.

```
updatedAgentServer/
├── .codebolt/                 # Workspace metadata
├── .turbo/                    # Turborepo cache artifacts
├── dist/                      # Compiled output bundle
├── src/                       # TypeScript source
│   ├── config.ts              # Loads server configuration defaults
│   ├── constants/             # Shared constant definitions
│   │   ├── index.ts
│   │   └── websocket.ts
│   ├── core/                  # Core server orchestration
│   │   ├── agentServer.ts
│   │   ├── connectionManager.ts
│   │   └── websocketServer.ts
│   ├── handlers/              # HTTP and socket routing logic
│   │   ├── agentMessageRouter.ts
│   │   ├── appMessageRouter.ts
│   │   ├── httpHandler.ts
│   │   ├── sendMessageToAgent.ts
│   │   └── sendMessageToApp.ts
│   ├── services/              # Long-lived service singletons
│   │   └── NotificationService.ts
│   ├── types/                 # Shared type definitions and exports
│   │   ├── cli.ts
│   │   ├── config.ts
│   │   ├── connections.ts
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   ├── utils.ts
│   │   └── websocket.ts
│   └── utils/                 # Utility helpers for process control & tooling
│       ├── childAgentProcessManager.ts
│       └── detectLanguage.ts
├── eslint.config.js           # Lint configuration for the package
├── esbuild.config.js          # Build pipeline configuration
├── docker-compose.yml         # Local orchestration helpers
├── Dockerfile                 # Container build definition
├── package.json               # Package metadata and scripts
├── tsconfig.json              # TypeScript compiler options
└── server.ts                  # CLI entry point wiring configuration + server startup
```

Supporting documentation (`CHANGELOG.md`, `example-usage.md`, etc.) complements the source by detailing release history and usage scenarios.

## Key Files and Responsibilities

- `server.ts`: CLI entry point built with Commander. Parses CLI flags (`AgentCliOptions`), overrides configuration values, validates agent options, constructs `AgentExecutorServer`, and optionally launches the TUI helper process.
- `src/config.ts`: Produces a `ServerConfig` object by merging defaults with environment variables. Keeps startup logic DRY for both CLI and other consumers.
- `src/core/agentServer.ts`: Wraps Express and the underlying HTTP server, bootstraps `HttpHandler` and `WebSocketServer`, and, when supplied CLI agent options, defers to the process manager to launch an agent automatically.
- `src/core/websocketServer.ts`: Owns the `ws` server, handles connection registration (auto-detecting agent vs. app clients), routes incoming frames to the proper message routers, and publishes registration confirmations and lifecycle events.
- `src/core/connectionManager.ts`: Central registry for app and agent sockets. Tracks parent–child relationships, caches message IDs, proxies messages to specific targets, lazily starts agents through `ChildAgentProcessManager`, and exposes telemetry helpers (counts, mappings, project metadata).
- `src/handlers/httpHandler.ts`: Registers REST endpoints for health (`/health`), connection snapshots (`/connections`), and bundle downloads. Reuses `ConnectionManager` state to surface runtime metrics.
- `src/handlers/agentMessageRouter.ts`: Entry point for all agent-originated WebSocket payloads. Logs the activity, enriches metadata, and forwards requests to the correct app via `SendMessageToApp`.
- `src/handlers/appMessageRouter.ts`: Handles messages emitted by apps. Delegates to `SendMessageToAgent` so responses reach the intended agent (booting it first if necessary).
- `src/handlers/sendMessageToApp.ts`: Utility wrapper that caches agent IDs for responses, injects `agentId/agentInstanceId`, and invokes `ConnectionManager.sendToApp` with error fallback handling.
- `src/handlers/sendMessageToAgent.ts`: Locates the target agent connection (or triggers a lazy launch), forwards the payload, and falls back to any connected agent if direct delivery fails.
- `src/services/NotificationService.ts`: Singleton that dispatches workflow notifications (chat, file ops, etc.) to relevant apps, tracks pending request promises, and bridges agent/app communications outside of direct message responses.
- `src/constants/index.ts` & `src/constants/websocket.ts`: Shared constants for WebSocket event names, message types, and status values used across routers and handlers.
- `src/types/*`: Type definitions shared across the package. `cli.ts` models CLI options, `connections.ts`/`messages.ts` describe socket payloads, `utils.ts` exposes helpers like `formatLogMessage`.
- `src/utils/childAgentProcessManager.ts`: Encapsulates spawning, tracking, and stopping agent subprocesses across multiple acquisition strategies (marketplace download, local path, zip extraction, remote zip). Emits structured logs and ensures cleanup.
- `src/utils/detectLanguage.ts`: Lightweight helper for mapping file extensions—used by utilities that need language-aware behavior.
- `esbuild.config.js`: Builds the distribution bundle, bundling TypeScript sources and externalizing large dependencies.
- `eslint.config.js`: Central lint rules for the package, aligning with the repo’s TypeScript guidelines.
- `Dockerfile` & `docker-compose.yml`: Containerization scripts for packaging and running the agent server in isolated environments.

## Message Flow Overview

1. **Startup**
   - `server.ts` parses CLI flags, builds the `ServerConfig`, and instantiates `AgentExecutorServer`.
   - `AgentExecutorServer.start()` creates the HTTP server, registers `HttpHandler` and `WebSocketServer`, and, when an agent type/detail is provided, schedules `ChildAgentProcessManager.startAgent` via the CLI options.

2. **Connection Registration**
   - Clients (apps or agents) connect through `WebSocketServer`. Connection parameters (`agentId`, `parentId`, `clientType`, etc.) are parsed to determine the role.
   - `ConnectionManager.registerConnection` records the socket, maintains parent/child maps, and sends a `registered` confirmation frame.

3. **Agent → App Messages**
   - Agent payloads arrive at `WebSocketServer`, which forwards them to `AgentMessageRouter.handleAgentRequest`.
   - The router logs intent and calls `SendMessageToApp.forwardToApp`. This method caches `message.id → agentId`, augments the payload with `agentId/agentInstanceId`, and uses `ConnectionManager.sendToApp` to reach the owning app (or returns an error if none are available).
   - `NotificationService` can emit supplementary notifications to the initiating app when required.

4. **App → Agent Messages**
   - App messages enter via `AppMessageRouter.handleAppResponse`, which delegates to `SendMessageToAgent.sendResponseToAgent`.
   - `SendMessageToAgent` extracts the intended `agentId` (from payload metadata or cached mappings) and invokes `ConnectionManager.sendToSpecificAgent`.
   - If the agent process is offline, `ConnectionManager` chains into `ChildAgentProcessManager.startAgent`, waits for the agent socket to appear, and then delivers the payload through `sendMessageToReadyAgent`.
   - Should targeted delivery fail, the manager optionally falls back to broadcasting the response to the first connected agent.

5. **HTTP + Notifications**
   - `HttpHandler` exposes REST health probes, connection stats, and bundle downloads.
   - `NotificationService` supplies broadcast channels for chat, file system updates, and other asynchronous events, reusing connection metadata maintained by `ConnectionManager`.

Together, these components ensure agents can be launched on demand, stay associated with their parent apps, and exchange WebSocket messages with reliable routing and lifecycle awareness.
