# CodeBolt Windows Sandbox Preview Plugin

Local preview provider for native Windows artifacts.

The plugin registers a `native_application` preview provider in the local CodeBolt app. When preview starts, it:

1. Resolves the artifact folder from `storagePath`.
2. Generates a temporary Windows Sandbox `.wsb` file.
3. Maps the artifact folder into the sandbox at `C:\CodeBoltArtifact`.
4. Runs a launch script inside the sandbox through `<LogonCommand>`.
5. Returns a local status page URL to CodeBolt.

Windows Sandbox must be enabled on the host machine and is available on supported Windows Pro, Enterprise, and Education SKUs.

## Artifact launch hints

The plugin looks for a command in this order:

- `artifact.metadata.windowsSandboxCommand`
- `artifact.metadata.sandboxCommand`
- `artifact.metadata.launchCommand`
- `artifact.runtime.command` plus `artifact.runtime.args`
- `artifact.entrypoint`

If no command or entrypoint is present, the sandbox opens the mapped artifact folder in Explorer.

## Security defaults

By default:

- The artifact folder is mapped read-only.
- Networking is disabled.
- Clipboard redirection is disabled.
- vGPU is enabled.

These can be changed with artifact metadata:

- `windowsSandboxReadOnly: false`
- `windowsSandboxNetworking: "Enable"`
- `windowsSandboxClipboard: "Enable"`
- `windowsSandboxVGpu: "Disable"`
- `windowsSandboxMemoryMb: 4096`

## Build

```powershell
npm install
npm run build
```
