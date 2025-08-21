# @agentProcessorPieces/core

A collection of reusable processor pieces for AI agents including chat compression, loop detection, session management, message modifiers, and file tools.

## Overview

This package provides ready-to-use components that extend the `@codebolt/agentprocessorframework` framework. These pieces can be used across different AI agent implementations to provide common functionality without duplication.

## Components

### Processors

#### ChatCompressionProcessor
Automatically compresses chat history when it exceeds a threshold to maintain performance.

```typescript
import { ChatCompressionProcessor } from '@agentProcessorPieces/core';

const compressor = new ChatCompressionProcessor(20); // Compress after 20 messages
```

#### LoopDetectorProcessor
Detects and prevents infinite loops in agent conversations.

```typescript
import { LoopDetectorProcessor } from '@agentProcessorPieces/core';

const loopDetector = new LoopDetectorProcessor(3); // Max 3 loops per prompt
```

#### SessionTurnProcessor
Manages session turn limits and provides session control.

```typescript
import { SessionTurnProcessor } from '@agentProcessorPieces/core';

const sessionManager = new SessionTurnProcessor(10); // Max 10 turns per session
```

### Message Modifiers

#### HandleUrlMessageModifier
Detects URLs in messages and adds context about them.

```typescript
import { HandleUrlMessageModifier } from '@agentProcessorPieces/core';

const urlModifier = new HandleUrlMessageModifier(true); // Enable Google search
```

### Tools

#### File Tools
Complete set of file manipulation tools:

- **FileReadTool**: Read file contents
- **FileWriteTool**: Write content to files
- **FileDeleteTool**: Delete files
- **FileMoveTool**: Move files between locations
- **FileCopyTool**: Copy files between locations

```typescript
import { 
    FileReadTool, 
    FileWriteTool, 
    FileDeleteTool 
} from '@agentProcessorPieces/core';

const readTool = new FileReadTool();
const writeTool = new FileWriteTool();
const deleteTool = new FileDeleteTool();
```

## Installation

```bash
npm install @agentProcessorPieces/core
# or
pnpm add @agentProcessorPieces/core
```

## Usage

### Basic Setup

```typescript
import { 
    ChatCompressionProcessor,
    LoopDetectorProcessor,
    SessionTurnProcessor,
    HandleUrlMessageModifier,
    FileReadTool
} from '@agentProcessorPieces/core';

// Create processors
const compressor = new ChatCompressionProcessor(20);
const loopDetector = new LoopDetectorProcessor(3);
const sessionManager = new SessionTurnProcessor(10);

// Create message modifier
const urlModifier = new HandleUrlMessageModifier(true);

// Create tools
const readTool = new FileReadTool();
```

### Integration with Framework

```typescript
import { BaseProcessor } from '@codebolt/agentprocessorframework';
import { ChatCompressionProcessor } from '@agentProcessorPieces/core';

// Use in your custom processor
class CustomProcessor extends BaseProcessor {
    private compressor = new ChatCompressionProcessor(15);
    
    async *processInput(input) {
        // Use the compression processor
        for await (const event of this.compressor.processInput(input)) {
            if (event.type === 'CompressedMessage') {
                // Handle compressed message
                yield* this.yieldEvent('CustomProcessed', event.value);
            }
        }
    }
}
```

## Dependencies

- `@codebolt/agentprocessorframework`: Core framework interfaces and base classes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
