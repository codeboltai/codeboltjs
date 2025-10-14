# Git Worktree Production Provider

A production-ready implementation of the Git Worktree Provider for CodeBolt.

## Overview

This provider enables CodeBolt to work with Git worktrees, creating isolated environments for development tasks while maintaining synchronization with the main repository.

## Features

- Creates isolated Git worktrees for each environment
- Manages agent server lifecycle for each worktree
- Provides diff functionality to track changes
- Handles cleanup of worktrees and branches when done
- WebSocket-based communication with the agent server

## Installation

```bash
pnpm install
```

## Building

```bash
pnpm build
```

## Usage

The provider can be started with:

```bash
pnpm start
```

Or directly with:

```bash
node dist/index.js
```

## Configuration

The provider accepts the following configuration options:

- `agentServerPort`: Port for the agent server (default: 3001)
- `agentServerHost`: Host for the agent server (default: 'localhost')
- `worktreeBaseDir`: Base directory for worktrees (default: '.worktree')
- `timeouts`: Timeout configuration for various operations

## API

The provider implements the following methods:

- `onProviderStart`: Initialize the provider and create worktree
- `onProviderAgentStart`: Start the agent server for the worktree
- `onGetDiffFiles`: Get diff information for changed files
- `onCloseSignal`: Clean up resources when provider is closed
- `onUserMessage`: Handle messages from the user
- `createWorktree`: Create a new Git worktree
- `removeWorktree`: Remove a Git worktree and its branch

## Development

To run tests:

```bash
pnpm test
```

To run in development mode with hot reloading:

```bash
pnpm dev
```

## License

MIT