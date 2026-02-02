/**
 * UI Message Stream Module
 *
 * Provides functionality for streaming AI responses to user interfaces in real-time.
 * Compatible with Server-Sent Events (SSE), WebSocket, and other streaming protocols.
 *
 * @example
 * ```typescript
 * import {
 *   createUIMessageStream,
 *   createUIMessageStreamResponse,
 *   createUIMessageStreamResponseFromProvider,
 *   parseSSEStream
 * } from 'multillm/ui-stream';
 *
 * // Create a stream response for a Next.js API route
 * export async function POST(req: Request) {
 *   const llm = new Multillm('openai', 'gpt-4', null, apiKey);
 *
 *   return createUIMessageStreamResponse(async ({ writer, messageId }) => {
 *     writer.write({ type: 'message-start', messageId, model: 'gpt-4' });
 *     writer.write({ type: 'text-start', messageId });
 *
 *     for await (const chunk of llm.streamCompletion({ messages })) {
 *       if (chunk.choices[0]?.delta?.content) {
 *         writer.write({
 *           type: 'text-delta',
 *           content: chunk.choices[0].delta.content,
 *           messageId
 *         });
 *       }
 *     }
 *
 *     writer.write({ type: 'text-end', messageId });
 *     writer.write({ type: 'message-end', messageId, finishReason: 'stop' });
 *   });
 * }
 * ```
 */

// Types
export type {
  UIMessageChunk,
  TextStartChunk,
  TextDeltaChunk,
  TextEndChunk,
  ReasoningStartChunk,
  ReasoningDeltaChunk,
  ReasoningEndChunk,
  ToolCallStartChunk,
  ToolCallDeltaChunk,
  ToolCallEndChunk,
  ToolResultChunk,
  MessageStartChunk,
  MessageEndChunk,
  StepStartChunk,
  StepEndChunk,
  ErrorChunk,
  DataChunk,
  SourceChunk,
  FileChunk,
  AbortChunk,
  UIMessageStreamOptions,
  UIStreamResult
} from './types';

export {
  isTextChunk,
  isToolCallChunk,
  isReasoningChunk,
  UI_STREAM_HEADERS
} from './types';

// Writer
export type { UIMessageStreamWriter, ErrorHandler } from './writer';
export { UIMessageStreamWriterImpl, streamHelpers } from './writer';

// Stream creation
export type { UIStreamExecutor } from './create-stream';
export {
  createUIMessageStream,
  createUIMessageStreamFromProvider
} from './create-stream';

// SSE Transform
export {
  JsonToSseTransformStream,
  JsonToNdjsonTransformStream,
  StringToUint8ArrayTransformStream,
  parseSSEChunk,
  parseSSEStream,
  createSSEPipeline,
  createNdjsonPipeline
} from './sse-transform';

// Response helpers
export type { UIStreamResponseOptions } from './response';
export {
  createUIMessageStreamResponse,
  createUIMessageStreamResponseFromProvider,
  pipeUIMessageStreamToResponse,
  getUIStreamHeaders
} from './response';
