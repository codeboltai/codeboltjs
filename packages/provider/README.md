# @codebolt/provider

Base provider utilities for building Codebolt environment providers. It exposes an abstract `BaseProvider` class that consolidates communication with the Agent Server (process management, WebSocket registration, message forwarding) and lifecycle hooks that concrete providers can override.

## Features

- Shared lifecycle for provider initialization, agent start, message routing, and cleanup
- WebSocket transport with automatic registration, metadata tracking, and forwarding to the Codebolt runtime
- Agent server process management hooks with overridable setup/teardown logic
- Type-safe configuration and transport contracts for provider implementations

## Usage

1. Install via workspace dependency: `"@codebolt/provider": "workspace:*"`
2. Extend `BaseProvider` and override the abstract hooks (`resolveProjectContext`, `setupEnvironment`, etc.)
3. In your provider entrypoint, instantiate the service and register event handlers exported by the provider package

## Development

- `pnpm build` – compile TypeScript to `dist`
- `pnpm test` – placeholder tests (no-op)
- `pnpm lint:test` – run ESLint and type checks