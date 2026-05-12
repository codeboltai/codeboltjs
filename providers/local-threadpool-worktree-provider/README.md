# Local Threadpool Environment Provider

A local execution provider for CodeBolt that operates on a pre-provisioned environment/workspace path.

## Overview

This provider is intended for `local_thread_pool` execution mode. It uses an environment path supplied by the server during provider start, runs one agent server for that workspace, and performs all file operations inside that local workspace.

## Features

- Uses `environmentPath` from provider start as workspace root
- Starts/stops the local agent server for the workspace
- Supports per-environment file read/write/rename/delete operations
- Supports workspace diff from git status/diff
- Cleans workspace folder after run when `cleanupEnvironmentPath` is enabled
- WebSocket-based communication with agent server

## Usage

Install and start as a normal provider:

```bash
pnpm install
pnpm start
```

## Configuration

- `agentServerPort`: Port for the agent server (default: `3001`)
- `agentServerHost`: Host for the agent server (default: `localhost`)
- `cleanupEnvironmentPath`: Delete environment directory on stop when true (default: `true`)
- `timeouts`: Timeout configuration for startup/connection/operations

## Notes

- This provider intentionally does not run git worktree creation/deletion itself; the server/runtime creates and hands out workspace paths.
- Merge/Patch and PR workflows are not supported in local threadpool mode.
