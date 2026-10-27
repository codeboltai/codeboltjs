# AgentFS Provider

A small `local_thread_pool` provider with three handlers:

- `onProviderStart` creates an APFS copy-on-write workspace with `cp -cR base/ overlay/`.
- `onGetDiffFiles` compares the original and workspace with `diff -rq base overlay`.
- `onProviderStop` removes the workspace.

Filesystem operations are handled by CodeboltJS because the provider declares:

```yaml
filesystem:
  type: local
```

No raw-message, filesystem, agent-server, or AgentFS SDK abstraction is registered.
