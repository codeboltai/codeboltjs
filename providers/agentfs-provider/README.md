# AgentFS Provider

This provider mounts AgentFS as a copy-on-write filesystem over the original project. It does not
copy the project tree.

At startup it:

1. Uses `projectPath` as the read-only base layer.
2. Creates or reuses an AgentFS SQLite delta database beside the environment path.
3. Mounts the merged filesystem at `environmentPath` using NFS on macOS or FUSE on Linux.
4. Routes CodeBolt reads and writes through the same mounted path.

Agent file searches, shell commands, Git, language servers, Explorer, and CodeBolt file operations
all see the same merged project. Writes and deletes go to AgentFS, so the original remains unchanged.

## Review merge requests

The provider uses local Git review requests. `Send PR` stages the mounted changes, creates an
isolated commit in the AgentFS delta, and returns its immutable commit SHA to CodeBolt. CodeBolt
fetches that commit into the parent repository under `refs/codebolt/rmr/<request-id>` before it
closes and unmounts the environment. The provider also supports binary patch generation and
`git_revision` bootstrap when a review request is opened as another environment.

## Requirement

Install AgentFS CLI 0.6 or newer, then install dependencies and build:

```bash
npm install
npm run build
```

On macOS, AgentFS uses a localhost NFS mount. On Linux it uses FUSE. The TypeScript SDK alone cannot
provide an OS-visible environment path, so the provider uses the AgentFS CLI for mounting.

For an environment at `/path/project-agent`, its persistent delta is stored at:

```text
/path/project-agent.agentfs/.agentfs/overlay.db
```

The manifest allows 180 seconds for `providerStart` because CodeBolt creates its project snapshot
and narrative bundle before delivering the startup event. This is important for large projects; the
AgentFS overlay itself opens without copying the project.

## Verification

The smoke test creates a real mount and verifies SDK-style provider callbacks and native filesystem
operations, rename/copy/delete behavior, path isolation, and that the base remains untouched:

```bash
npm run test:overlay
```
