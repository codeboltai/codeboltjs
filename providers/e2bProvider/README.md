# E2B Provider for CodeBolt (Simple Functional Approach)

This provider enables remote code execution using E2B sandboxes with a simple functional approach. Just require the index file and all event handlers are automatically registered - no classes or complex setup needed!

## Quick Start

```javascript
// That's it! Just require the provider and all handlers are ready
const codebolt = require('@codebolt/codeboltjs');
require('./providers/e2bProvider');

// Optional: Check sandbox status
const { getSandboxStatus } = require('./providers/e2bProvider');
console.log('Sandbox status:', getSandboxStatus());
```

## Features

- ✅ **Sandbox Management**: Automatic creation and destruction of E2B sandboxes
- ✅ **Remote File System**: Use sandbox filesystem instead of local filesystem
- ✅ **Git Integration**: Access git operations within the sandbox
- ✅ **Terminal Access**: Execute commands in the remote sandbox environment
- ✅ **Non-blocking Agent Loop**: Uses `.then()` pattern to avoid blocking events
- ✅ **Interactive Workflow**: Always asks users what to do next
- ✅ **Error Handling**: Comprehensive error handling with notifications

## Implementation Details

### Provider Event Handlers

The E2B provider implements all the required CodeBolt provider events:

#### 1. `onProviderStart(initvars)`
```typescript
codebolt.onProviderStart((initvars) => {
    // Creates and initializes E2B sandbox
    sandbox.create();
});
```

#### 2. `onProviderAgentStart(userMessage)`
```typescript
codebolt.onProviderAgentStart((userMessage) => {
    // Start Agent Loop with UserMessage
    // In Agent Loop, instead of Local FS, use Sandbox fs and send back notifications
    // Do not Return, instead always end with Ask Question on what to do next
    // and instead of await use .then to not block the events 
});
```

#### 3. `onGetDiffFiles()`
```typescript
codebolt.onGetDiffFiles(() => {
    // Uses sandbox.git.getDiff() instead of local git
    return sandbox.git.getDiff();
});
```

#### 4. `onCloseSignal()`
```typescript
codebolt.onCloseSignal(() => {
    // Cleanup and destroy sandbox
    sandbox.destroy();
});
```

### Key Implementation Features

1. **Non-blocking Agent Loop**: Uses `.then()` instead of `await` to prevent blocking events
2. **Sandbox-first Approach**: All file operations use the remote sandbox filesystem
3. **Interactive Flow**: Always ends with asking the user what to do next
4. **Notification System**: Sends real-time notifications about operations
5. **Error Recovery**: Graceful error handling with user feedback

## Usage

### Basic Setup

```typescript
import { e2bProvider } from '@codebolt/e2b-provider';

// The provider automatically sets up all event handlers when imported
// No additional setup required - it integrates seamlessly with CodeBolt
```

### Manual Operations (for testing)

```typescript
import { e2bProvider } from '@codebolt/e2b-provider';

// Check sandbox status
const status = e2bProvider.getSandboxStatus();
console.log('Sandbox status:', status);
```

### Real-world Integration

```typescript
import codebolt from '@codebolt/codeboltjs';
import '@codebolt/e2b-provider'; // Auto-registers handlers

// Set up message handler that works with E2B
codebolt.onMessage(async (userMessage) => {
    if (userMessage.userMessage.includes('sandbox') || 
        userMessage.userMessage.includes('e2b')) {
        
        // E2B provider will automatically handle the request
        // through its onProviderAgentStart handler
        console.log('Processing with E2B sandbox...');
    }
});
```

## Architecture

### Sandbox Operations

The provider creates a mock E2B sandbox that simulates real E2B operations:

- **Filesystem**: `sandbox.filesystem.{read,write,exists,list,mkdir,rm}`
- **Git**: `sandbox.git.{getDiff,status,add,commit,push,pull}`
- **Terminal**: `sandbox.terminal.run(command)`

### Agent Loop Flow

1. **Agent Start**: Receives user message and starts non-blocking processing
2. **File Processing**: Processes mentioned files using sandbox filesystem
3. **Action Execution**: Performs requested actions in the sandbox
4. **User Interaction**: Always asks user what to do next
5. **Choice Processing**: Handles user choices and continues the loop

### Notification System

All operations send notifications to keep users informed:

- `info`: General operation updates
- `success`: Successful operations
- `warning`: Non-critical issues
- `error`: Error conditions

## Configuration

### Environment Variables

The provider can be configured through environment variables:

```bash
# E2B API key (when using real E2B SDK)
E2B_API_KEY=your_api_key_here

# Sandbox template (optional)
E2B_TEMPLATE=codebolt-sandbox
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "paths": {
      "@codebolt/codeboltjs": ["../../packages/codeboltjs/src"],
      "@codebolt/types/*": ["../../common/types/src/*"]
    }
  }
}
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

## Integration with Real E2B SDK

To use with the real E2B SDK, replace the `MockE2BSandbox` class with actual E2B imports:

```typescript
// Replace mock implementation with real E2B SDK
import { Sandbox } from '@e2b/sdk';

class RealE2BSandbox implements E2BSandbox {
  private sandbox: Sandbox;
  
  constructor() {
    this.sandbox = new Sandbox({
      template: 'codebolt-sandbox',
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

### E2BProvider Class

#### Methods

- `getSandboxStatus()`: Returns current sandbox status
- `handleProviderStart(initvars)`: Creates and initializes sandbox
- `handleProviderAgentStart(userMessage)`: Starts agent processing loop
- `handleGetDiffFiles()`: Gets git diff from sandbox
- `handleCloseSignal()`: Destroys sandbox

#### Events

The provider automatically registers handlers for:
- `onProviderStart`
- `onProviderAgentStart`
- `onGetDiffFiles`
- `onCloseSignal`
- `onCreatePatchRequest`
- `onCreatePullRequestRequest`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [codeboltjs/issues](https://github.com/codeboltai/codeboltjs/issues)
- Documentation: [CodeBolt Docs](https://docs.codebolt.ai)
