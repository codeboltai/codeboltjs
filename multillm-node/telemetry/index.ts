/**
 * Telemetry Module
 *
 * OpenTelemetry-compatible telemetry for LLM operations.
 *
 * TELEMETRY IS ENABLED BY DEFAULT - no configuration needed!
 * All LLM calls are automatically logged to './llm-telemetry.ndjson'
 *
 * @example
 * ```typescript
 * import Multillm from 'multillm';
 *
 * // Just use Multillm - telemetry works automatically!
 * const llm = new Multillm('openai', 'gpt-4', null, apiKey);
 *
 * // All calls are automatically logged to ./llm-telemetry.ndjson
 * const response = await llm.createCompletion({
 *   messages: [{ role: 'user', content: 'Hello' }]
 * });
 *
 * // To disable telemetry:
 * const llm = new Multillm('openai', 'gpt-4', null, apiKey, null, {
 *   telemetry: { enabled: false }
 * });
 *
 * // To customize (optional):
 * const llm = new Multillm('openai', 'gpt-4', null, apiKey, null, {
 *   telemetry: {
 *     filePath: './custom-path.ndjson',  // custom file path
 *     consoleLog: true                    // also log to console
 *   }
 * });
 * ```
 *
 * The telemetry logs are stored in NDJSON format and follow OpenTelemetry
 * GenAI semantic conventions.
 */

// Internal exports for Multillm class (not meant for direct user usage)
export { TelemetryCollector } from './collector';
export { FileExporter, ConsoleExporter, MemoryExporter, HttpExporter, CompositeExporter } from './exporters';

// Types (for advanced users who need to extend functionality)
export type {
  GenAIOperationName,
  GenAIProviderName,
  SpanStatus,
  TelemetryConfig,
  TelemetryLogEntry,
  TelemetryExporter
} from './types';

export type { FileExporterOptions, HttpExporterOptions } from './exporters';
