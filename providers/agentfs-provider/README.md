# AgentFS Provider

Filesystem-only CodeBolt environment provider backed by the Turso AgentFS TypeScript SDK.

This provider intentionally does not start a secondary agent server and does not forward user messages or raw application events. The application remains responsible for message and event handling; the provider only owns environment lifecycle metadata and filesystem operations.

For CodeBolt application compatibility, the provider reports `executionMode: local_thread_pool` and `syncMode: workspace_sync`. AgentFS-specific identity is exposed separately through `agentFSId` and `filesystemProvider: agentfs`.

## Runtime Dependency

```bash
npm install
```

The provider declares `agentfs-sdk` and opens persistent AgentFS storage with:

```ts
const agent = await AgentFS.open({ id: "codebolt-{environmentName}" });
```

## Filesystem Surface

Mapped to documented AgentFS SDK APIs:

- `onReadFile` -> `agent.fs.readFile(path, "utf-8")`
- `onWriteFile` -> `agent.fs.writeFile(path, content)`
- `onGetTreeChildren` / `onGetFullProject` -> `agent.fs.readdirPlus` when available, otherwise `agent.fs.readdir` + `agent.fs.stat`
- `onDeleteFile` -> `agent.fs.deleteFile(path)` when available, otherwise `agent.fs.unlink(path)`

CodeBolt also exposes folder create/delete and rename handlers. The Turso TypeScript SDK page documents only file deletion, but `agentfs-sdk@0.6.4` exposes Node-like `mkdir`, `rm`, and `rename`; this provider uses those methods when available and returns a clear unsupported error if an SDK build does not expose them.

## Configuration

```yaml
config:
  agentFSSdkPackage: agentfs-sdk
  agentFSIdPrefix: codebolt
  executionMode: local_thread_pool
  syncMode: workspace_sync
```

`agentFSSdkPackage` exists so local testing can point at a fork or alternate package name without changing provider code.
