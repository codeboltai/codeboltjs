# Base Processor Classes

This directory contains all the base processor classes that provide common functionality for different types of processors.

## Base Classes

### `BaseMessageModifier`
Abstract base class for message modifiers that convert user messages to prompts for the LLM.
- **Used by**: InitialPromptGenerator
- **Purpose**: Transform user input into structured prompts

### `BasePreInferenceProcessor`
Abstract base class for processors called before the Agent calls the LLM.
- **Used by**: AgentStep
- **Purpose**: Pre-process messages before LLM inference

### `BasePostInferenceProcessor`
Abstract base class for processors called after the LLM responds but before tool calls.
- **Used by**: AgentStep
- **Purpose**: Validate and process LLM responses, handle retry logic

### `BasePreToolCallProcessor`
Abstract base class for processors called before tool execution.
- **Used by**: ResponseExecutor
- **Purpose**: Validate tool calls, handle local tool interception

### `BasePostToolCallProcessor`
Abstract base class for processors called after tool execution.
- **Used by**: ResponseExecutor
- **Purpose**: Process tool results and update prompts for next iteration

## Usage

Import the base class you need:

```typescript
import { BaseMessageModifier } from './base/baseMessageModifier';
import { BasePreInferenceProcessor } from './base/basePreInferenceProcessor';
// etc.
```

Or import all at once:

```typescript
import { 
    BaseMessageModifier,
    BasePreInferenceProcessor,
    BasePostInferenceProcessor,
    BasePreToolCallProcessor,
    BasePostToolCallProcessor
} from './base';
```

## Creating Custom Processors

Extend the appropriate base class:

```typescript
import { BaseMessageModifier, MessageModifierInput } from './base/baseMessageModifier';

export class MyCustomModifier extends BaseMessageModifier {
    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        // Your implementation
        return this.addSystemMessage(input.createdMessage, "Custom system message");
    }
}
```

Each base class provides helpful methods for common operations like validation, context management, and message manipulation.
