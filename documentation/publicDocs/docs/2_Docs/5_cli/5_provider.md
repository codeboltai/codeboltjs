# Codebolt Provider

A **Codebolt Provider** is a service that acts as a bridge between the Codebolt application and external environments or services. Providers enable Codebolt to interact with remote systems, manage containers, or integrate with third-party services through a standardized WebSocket-based communication protocol.

## What is a Provider?

A Provider is essentially a middleware service that:
- Connects to the Codebolt application via WebSocket
- Manages external resources (containers, remote environments, etc.)
- Routes messages between Codebolt and the managed resources
- Handles the lifecycle of external services

## Architecture

```
Codebolt Application
        ↕ WebSocket
Codebolt Provider
  ├── CodeboltWebSocketClient    ← Connects to Codebolt app
  ├── RemoteEnvironmentManager   ← Manages external resources
  └── MessageHandler            ← Routes messages
        ↕ WebSocket/API
External Environment/Service
```

## Provider Types

### 1. Docker Provider
Manages Docker containers for running agents in isolated environments.

### 2. Remote Environment Provider
Manages remote development environments or cloud instances.

### 3. Custom Provider
Integrates with any external service or system.

## Creating a Provider

### Using the CLI

```bash
# Create a new provider
npx codebolt-cli createprovider my-provider

# Create with quick setup (uses defaults)
npx codebolt-cli createprovider my-provider --quick

# Specify name directly
npx codebolt-cli createprovider --name my-provider
```

### Provider Structure

When you create a provider, the following structure is generated:

```
my-provider/
├── codeboltprovider.yaml      # Provider configuration
├── codeboltprovider.schema.json # Schema validation
├── package.json               # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── esbuild.config.js         # Build configuration
├── vite.config.ts            # Vite build config
├── eslint.config.js          # ESLint configuration
└── src/
    ├── index.ts              # Main entry point
    ├── config/
    │   ├── index.ts          # Configuration management
    │   └── dockerConfig.ts   # Docker-specific config
    ├── core/
    │   ├── codeboltWebsocketClient.ts    # Codebolt connection
    │   ├── remoteEnvironmentManager.ts   # Resource management
    │   └── remoteEnvironmentWebSocketClient.ts # External service connection
    └── handlers/
        └── messageHandler.ts  # Message routing logic
```

## Configuration

### Provider Configuration (`codeboltprovider.yaml`)

```yaml
name: my-awesome-provider
unique_id: my-provider-123
version: 1.0.0
description: A provider that manages remote development environments
tags:
  - remote-env
  - development
  - cloud
author: your-username
```

**Required Fields:**
- `name`: Display name of the provider
- `unique_id`: Unique identifier (alphanumeric, no spaces)
- `version`: Semantic version (e.g., "1.0.0")
- `description`: Brief description of functionality
- `author`: Author/creator name


## Publishing a Provider

### Prerequisites

1. **Authentication**: You must be logged in to Codebolt
   ```bash
   npx codebolt-cli login
   ```

2. **Valid Configuration**: Ensure `codeboltprovider.yaml` is properly configured

3. **Build Success**: Provider must build without errors

### Publishing Process

```bash
# Publish from current directory
npx codebolt-cli publishprovider

# Publish from specific directory
npx codebolt-cli publishprovider /path/to/provider
```

**What happens during publishing:**

1. **Validation**: Checks provider configuration and build
2. **Build**: Compiles TypeScript to JavaScript
3. **Packaging**: Creates two zip files:
   - `build.zip`: Distribution build (from `dist/` folder)
   - `source.zip`: Source code (entire project)
4. **Upload**: Uploads both packages to Codebolt registry
5. **Registration**: Registers provider in the Codebolt marketplace

### Publishing Output

```
Processing the Provider....
Found provider configuration: my-awesome-provider
Build completed successfully.
Packaging distribution build...
Distribution build packaging done.
Packaging source code...
Source code packaging done.
Uploading distribution build...
Uploading source code...
Both packages uploaded successfully.
📦 Provider ID: my-provider-123
📝 Description: A provider that manages remote development environments
🏷️  Tags: remote-env, development, cloud
```
