# Processor Types

This directory contains all the processor type definitions and interfaces for the Unified Agent Framework.

## Structure

### Processor Types

Each processor type has its own file with complete type definitions and base classes:

- **`messageModifierTypes.ts`** - Message modifiers that convert user messages to prompts
- **`preInferenceProcessorTypes.ts`** - Processors called before LLM inference  
- **`postInferenceTypes.ts`** - Processors called after LLM inference but before tool calls
- **`preToolCallProcessorTypes.ts`** - Processors called before tool execution
- **`postToolCallProcessorTypes.ts`** - Processors called after tool execution

### Base Classes

Each processor type includes its corresponding base class:

- `BaseMessageModifier`
- `BasePreInferenceProcessor` 
- `BasePostInferenceProcessor`
- `BasePreToolCallProcessor`
- `BasePostToolCallProcessor`

## Usage

### Import Specific Types

```typescript
// Import message modifier types
import { 
    MessageModifier, 
    MessageModifierInput, 
    BaseMessageModifier 
} from './messageModifierTypes';

// Import pre-inference processor types
import { 
    PreInferenceProcessor, 
    PreInferenceProcessorInput,
    BasePreInferenceProcessor 
} from './preInferenceProcessorTypes';
```

### Import All Types

```typescript
// Import everything from the index
import * as ProcessorTypes from './processorTypes';
```

## Processor Flow

Based on the documentation, the processor flow is:

1. **Message Modifiers** - Convert user message to initial prompt (used by InitialPromptGenerator)
2. **Pre-Inference Processors** - Process message before LLM call (used by AgentStep)
3. **Post-Inference Processors** - Process LLM response before tool calls (used by AgentStep)
4. **Pre-Tool Call Processors** - Validate/intercept tool calls (used by ResponseExecutor)
5. **Post-Tool Call Processors** - Process tool results and update prompt (used by ResponseExecutor)

## Creating Custom Processors

Extend the appropriate base class for your processor type:

```typescript
import { BaseMessageModifier, MessageModifierInput } from './messageModifierTypes';

export class CustomMessageModifier extends BaseMessageModifier {
    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        // Your implementation here
        return input.createdMessage;
    }
}
```

## Migration

The main `processorTypes.ts` file is deprecated but kept for backward compatibility. New code should import from specific processor type files.
