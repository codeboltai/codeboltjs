# E2B Provider for CodeBolt

This provider enables remote code execution using E2B sandboxes with a modular TypeScript architecture. The provider follows proper project structure conventions with source files organized in a `src/` directory.

## Quick Start

```javascript
// Import the provider and all handlers are automatically registered
const codebolt = require('@codebolt/codeboltjs');
require('@codebolt/e2b-provider');

// Optional: Check sandbox status
const { getSandboxStatus } = require('@codebolt/e2b-provider');
console.log('Sandbox status:', getSandboxStatus());
```

## Features

- ✅ **Modular Architecture**: Clean separation of concerns with TypeScript modules
- ✅ **Sandbox Management**: Automatic creation and destruction of E2B sandboxes
- ✅ **Remote File System**: Use sandbox filesystem instead of local filesystem
- ✅ **Git Integration**: Access git operations within the sandbox
- ✅ **Terminal Access**: Execute commands in the remote sandbox environment
- ✅ **Non-blocking Agent Loop**: Uses `.then()` pattern to avoid blocking events
- ✅ **Interactive Workflow**: Always asks users what to do next
- ✅ **Error Handling**: Comprehensive error handling with notifications
- ✅ **Type Safety**: Full TypeScript support with proper type definitions

## Project Structure

```
src/
├── types/                    # Type definitions
│   ├── sandbox.ts           # Sandbox-related interfaces
│   ├── provider.ts          # Provider configuration types
│   └── index.ts             # Type exports
├── handlers/                 # Event handlers
│   ├── lifecycle.ts         # Provider lifecycle handlers
│   ├── agent.ts             # Agent processing handlers
│   └── index.ts             # Handler exports
├── utils/                    # Utilities and helpers
│   ├── sandboxManager.ts    # Sandbox management utilities
│   ├── messageHelpers.ts    # Notification system
│   └── index.ts             # Utility exports
├── index.ts                 # Main entry point
└── sandbox.ts               # Sandbox interface
docs/                        # Documentation
├── README.md               # Main documentation
└── SANDBOX.md              # Sandbox-specific docs
```

## Implementation Details

### Provider Event Handlers

The E2B provider implements all required CodeBolt provider events:

#### 1. `onProviderStart(initvars)`
```typescript
import { onProviderStart } from '@codebolt/e2b-provider';

codebolt.onProviderStart(onProviderStart);
// Creates and initializes E2B sandbox
```

#### 2. `onProviderAgentStart(userMessage)`
```typescript
import { onProviderAgentStart } from '@codebolt/e2b-provider';

codebolt.onProviderAgentStart(onProviderAgentStart);
// Start Agent Loop with UserMessage
// Uses sandbox filesystem instead of local FS
// Sends real-time notifications
// Always ends with asking user what to do next
```

#### 3. `onGetDiffFiles()`
```typescript
import { onGetDiffFiles } from '@codebolt/e2b-provider';

codebolt.onGetDiffFiles(onGetDiffFiles);
// Uses sandbox.git.getDiff() instead of local git
```

#### 4. `onCloseSignal()`
```typescript
import { onCloseSignal } from '@codebolt/e2b-provider';

codebolt.onCloseSignal(onCloseSignal);
// Cleanup and destroy sandbox
```

### Key Implementation Features

1. **Modular Design**: Handlers, types, and utilities are separated into focused modules
2. **Non-blocking Agent Loop**: Uses `.then()` instead of `await` to prevent blocking events
3. **Sandbox-first Approach**: All file operations use the remote sandbox filesystem
4. **Interactive Flow**: Always ends with asking the user what to do next
5. **Notification System**: Comprehensive notification coverage for all operation types
6. **Type Safety**: Full TypeScript support with proper interfaces and type definitions

## Usage

### Basic Setup

```typescript
import '@codebolt/e2b-provider';

// The provider automatically sets up all event handlers when imported
// No additional setup required - it integrates seamlessly with CodeBolt
```

### Using Individual Components

```typescript
import { 
  SandboxManager, 
  createE2BSandbox,
  sendNotification 
} from '@codebolt/e2b-provider';

// Create a sandbox manager
const manager = new SandboxManager();
const sandbox = await manager.createSandbox();

// Send notifications
sendNotification('info', 'Operation completed');
```

### Type Imports

```typescript
import type { 
  E2BSandbox, 
  SandboxConfig, 
  ProviderConfig,
  UserMessage 
} from '@codebolt/e2b-provider';
```

## Architecture

### Type System

The provider uses a comprehensive type system:

- **Sandbox Types**: `E2BSandbox`, `SandboxConfig`, `GitStatus`, `TerminalResult`
- **Provider Types**: `InitVars`, `ProviderConfig`, `ProviderStatus`, `UserMessage`
- **Result Types**: `DiffFilesResult`, `PatchResult`, `PullRequestResult`

### Handler Modules

#### Lifecycle Handlers (`src/handlers/lifecycle.ts`)
- Provider start/stop operations
- Sandbox creation and destruction
- State management

#### Agent Handlers (`src/handlers/agent.ts`)
- User message processing
- Agent loop implementation
- Git operations (diff, patch, pull request)

### Utility Modules

#### Sandbox Manager (`src/utils/sandboxManager.ts`)
- Multiple sandbox instance management
- Factory functions for sandbox creation
- Lifecycle management

#### Message Helpers (`src/utils/messageHelpers.ts`)
- Notification system for all event types
- Standardized message formatting
- Error handling

## Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@codebolt/codeboltjs": ["../../../packages/codeboltjs/dist"],
      "@codebolt/types/*": ["../../../common/types/dist/*"],
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Environment Variables

```bash
# E2B API key (when using real E2B SDK)
E2B_API_KEY=your_api_key_here

# Sandbox template (optional)
E2B_TEMPLATE=codebolt-sandbox
```

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Integration with Real E2B SDK

To use with the real E2B SDK, replace the `MockE2BSandbox` class in `src/utils/sandboxManager.ts`:

```typescript
import { Sandbox } from '@e2b/sdk';
import type { E2BSandbox, SandboxConfig } from '../types/sandbox';

export class RealE2BSandbox implements E2BSandbox {
  private sandbox: Sandbox;
  
  constructor(config?: SandboxConfig) {
    this.sandbox = new Sandbox({
      template: config?.template || 'codebolt-sandbox',
      apiKey: process.env.E2B_API_KEY
    });
  }
  
  async create(): Promise<void> {
    await this.sandbox.start();
  }
  
  async destroy(): Promise<void> {
    await this.sandbox.close();
  }
  
  // ... implement other methods using real E2B API
}
```

## API Reference

### Main Exports

- `getSandboxStatus()`: Returns current sandbox status
- `handleListFiles()`: Lists files in current sandbox
- All handler functions for CodeBolt integration
- All type definitions
- All utility classes and functions

### Handler Functions

- `onProviderStart(initvars)`: Creates and initializes sandbox
- `onProviderAgentStart(userMessage)`: Starts agent processing loop
- `onGetDiffFiles()`: Gets git diff from sandbox
- `onCloseSignal()`: Destroys sandbox
- `onCreatePatchRequest()`: Creates patch from current changes
- `onCreatePullRequestRequest()`: Creates pull request

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the modular structure
4. Add tests for new functionality
5. Update type definitions as needed
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [codeboltjs/issues](https://github.com/codeboltai/codeboltjs/issues)
- Documentation: [CodeBolt Docs](https://docs.codebolt.ai)