# Local Threadpool Environment Provider

A local execution provider for CodeBolt that operates on a pre-provisioned environment/workspace path.

## Overview

This provider is intended for `local_thread_pool` execution mode. It creates and cleans up the worktree selected by the application server. Agent execution and ordinary filesystem operations stay in the application server.

## Features

- Uses `environmentPath` from provider start as workspace root
- Creates and removes the environment Git worktree
- Supports workspace diff from git status/diff
- Cleans workspace folder after run when `cleanupEnvironmentPath` is enabled
- Does not start a secondary agent server or filesystem transport

## Usage

Install and start as a normal provider:

```bash
pnpm install
pnpm start
```

## Configuration

- `filesystem.type`: Filesystem routing owner (`local` for this provider)
- `cleanupEnvironmentPath`: Delete environment directory on stop when true (default: `true`)
- `timeouts`: Timeout configuration for Git and cleanup operations

## Notes

- The application server resolves prospective paths and handles local filesystem requests.
- Merge/Patch and PR workflows are not supported in local threadpool mode.
