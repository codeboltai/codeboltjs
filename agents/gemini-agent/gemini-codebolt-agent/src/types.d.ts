/**
 * Local type declarations for @codebolt packages that need deep path access.
 * The base classes exist at processor-pieces/base/ in the dist but are not
 * listed in the package.json "exports" map. This ambient module declaration
 * allows TypeScript to resolve them while webpack resolves the actual JS.
 */

declare module '@codebolt/agent/processor-pieces/base' {
  import type { ProcessedMessage, PostToolCallProcessorInput, PostToolCallProcessorOutput } from '@codebolt/types/agent';
  import type { FlatUserMessage } from '@codebolt/types/sdk';

  export abstract class BaseMessageModifier {
    protected context: Record<string, unknown>;
    constructor(options?: Record<string, unknown>);
    abstract modify(
      originalRequest: FlatUserMessage,
      createdMessage: ProcessedMessage
    ): Promise<ProcessedMessage>;
  }

  export abstract class BasePreInferenceProcessor {
    protected context: Record<string, unknown>;
    constructor();
    abstract modify(
      originalRequest: FlatUserMessage,
      createdMessage: ProcessedMessage
    ): Promise<ProcessedMessage>;
  }

  export abstract class BasePostToolCallProcessor {
    protected context: Record<string, unknown>;
    constructor();
    abstract modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
  }
}
