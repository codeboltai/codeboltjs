/**
 * Telemetry Exporters
 *
 * Different exporters for storing/sending telemetry data.
 */

import type {
  TelemetryExporter,
  TelemetrySpan,
  TelemetryLogEntry,
  TelemetryExportData,
  GenAIOperationName,
  GenAIProviderName
} from './types';

/**
 * Convert span to simple log entry format
 */
function spanToLogEntry(span: TelemetrySpan): TelemetryLogEntry {
  return {
    timestamp: new Date(span.startTime).toISOString(),
    traceId: span.traceId,
    spanId: span.spanId,
    parentSpanId: span.parentSpanId,
    operation: span.attributes['gen_ai.operation.name'],
    provider: span.attributes['gen_ai.provider.name'],
    model: span.attributes['gen_ai.request.model'] as string | undefined,
    durationMs: span.duration,
    status: span.status,
    usage: {
      inputTokens: span.attributes['gen_ai.usage.input_tokens'] as number | undefined,
      outputTokens: span.attributes['gen_ai.usage.output_tokens'] as number | undefined,
      totalTokens: span.attributes['gen_ai.usage.total_tokens'] as number | undefined,
      cachedTokens: span.attributes['gen_ai.usage.cached_tokens'] as number | undefined
    },
    finishReason: (span.attributes['gen_ai.response.finish_reasons'] as string[] | undefined)?.[0],
    error: span.status === 'ERROR' ? {
      type: span.attributes['error.type'] as string || 'Error',
      message: span.statusMessage || 'Unknown error'
    } : undefined,
    metadata: Object.fromEntries(
      Object.entries(span.attributes).filter(([key]) =>
        !key.startsWith('gen_ai.') && !key.startsWith('error.')
      )
    ),
    input: span.attributes['gen_ai.prompt'] as string | undefined,
    output: span.attributes['gen_ai.completion'] as string | undefined
  };
}

/**
 * Convert attribute value to OTLP format
 */
function toOtlpValue(value: unknown): { stringValue?: string; intValue?: number; boolValue?: boolean; doubleValue?: number } {
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { intValue: value } : { doubleValue: value };
  }
  if (typeof value === 'boolean') {
    return { boolValue: value };
  }
  return { stringValue: JSON.stringify(value) };
}

/**
 * Convert span kind to OTLP number
 */
function spanKindToNumber(kind: string): number {
  const kinds: Record<string, number> = {
    INTERNAL: 1,
    SERVER: 2,
    CLIENT: 3,
    PRODUCER: 4,
    CONSUMER: 5
  };
  return kinds[kind] || 0;
}

/**
 * Convert status to OTLP code
 */
function statusToCode(status: string): number {
  const codes: Record<string, number> = {
    UNSET: 0,
    OK: 1,
    ERROR: 2
  };
  return codes[status] || 0;
}

/**
 * Convert spans to OTLP export format
 */
function spansToOtlpFormat(spans: TelemetrySpan[]): TelemetryExportData {
  const resourceAttributes = spans[0]?.resource || {};

  return {
    resourceSpans: [{
      resource: {
        attributes: Object.entries(resourceAttributes).map(([key, value]) => ({
          key,
          value: toOtlpValue(value)
        }))
      },
      scopeSpans: [{
        scope: {
          name: 'multillm-telemetry',
          version: '1.0.0'
        },
        spans: spans.map(span => ({
          traceId: span.traceId,
          spanId: span.spanId,
          parentSpanId: span.parentSpanId,
          name: span.name,
          kind: spanKindToNumber(span.kind),
          startTimeUnixNano: (span.startTime * 1000000).toString(),
          endTimeUnixNano: ((span.endTime || span.startTime) * 1000000).toString(),
          attributes: Object.entries(span.attributes)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => ({
              key,
              value: toOtlpValue(value)
            })),
          status: {
            code: statusToCode(span.status),
            message: span.statusMessage
          },
          events: span.events.map(event => ({
            timeUnixNano: (event.timestamp * 1000000).toString(),
            name: event.name,
            attributes: event.attributes
              ? Object.entries(event.attributes).map(([key, value]) => ({
                  key,
                  value: toOtlpValue(value)
                }))
              : undefined
          }))
        }))
      }]
    }]
  };
}

/**
 * Console Exporter
 * Logs telemetry to console (useful for development)
 */
export class ConsoleExporter implements TelemetryExporter {
  private verbose: boolean;

  constructor(options: { verbose?: boolean } = {}) {
    this.verbose = options.verbose ?? false;
  }

  async export(spans: TelemetrySpan[]): Promise<void> {
    for (const span of spans) {
      const entry = spanToLogEntry(span);

      if (this.verbose) {
        console.log('[Telemetry]', JSON.stringify(entry, null, 2));
      } else {
        const statusIcon = entry.status === 'OK' ? '✓' : '✗';
        const duration = entry.durationMs ? `${entry.durationMs}ms` : 'N/A';
        const tokens = entry.usage?.totalTokens ? `${entry.usage.totalTokens} tokens` : '';
        console.log(
          `[Telemetry] ${statusIcon} ${entry.operation} ${entry.model || ''} - ${duration} ${tokens}`.trim()
        );
      }
    }
  }

  async flush(): Promise<void> {
    // No-op for console
  }

  async shutdown(): Promise<void> {
    // No-op for console
  }
}

/**
 * File Exporter Options
 */
export interface FileExporterOptions {
  /** File path for logs (NDJSON format) */
  filePath: string;
  /** Also export OTLP format */
  exportOtlp?: boolean;
  /** OTLP file path (if exportOtlp is true) */
  otlpFilePath?: string;
  /** Maximum file size in bytes before rotation */
  maxFileSize?: number;
  /** Maximum number of rotated files to keep */
  maxFiles?: number;
}

/**
 * File Exporter
 * Stores telemetry data in local files (NDJSON and/or OTLP format)
 */
export class FileExporter implements TelemetryExporter {
  private filePath: string;
  private exportOtlp: boolean;
  private otlpFilePath: string;
  private maxFileSize: number;
  private maxFiles: number;
  private buffer: string[] = [];
  private otlpBuffer: TelemetrySpan[] = [];

  constructor(options: FileExporterOptions) {
    this.filePath = options.filePath;
    this.exportOtlp = options.exportOtlp ?? false;
    this.otlpFilePath = options.otlpFilePath || options.filePath.replace('.ndjson', '.otlp.json');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.maxFiles = options.maxFiles || 5;
  }

  async export(spans: TelemetrySpan[]): Promise<void> {
    // Convert to log entries and buffer
    for (const span of spans) {
      const entry = spanToLogEntry(span);
      this.buffer.push(JSON.stringify(entry));
    }

    if (this.exportOtlp) {
      this.otlpBuffer.push(...spans);
    }

    // Write to file
    await this.writeToFile();
  }

  private async writeToFile(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    try {
      // Dynamic import for Node.js fs
      const fs = await this.getFs();
      if (!fs) {
        console.warn('FileExporter: fs module not available, skipping file write');
        return;
      }

      // Check if rotation needed
      await this.rotateIfNeeded(fs, this.filePath);

      // Append NDJSON entries
      const content = this.buffer.join('\n') + '\n';
      await fs.promises.appendFile(this.filePath, content, 'utf-8');
      this.buffer = [];

      // Write OTLP format if enabled
      if (this.exportOtlp && this.otlpBuffer.length > 0) {
        await this.rotateIfNeeded(fs, this.otlpFilePath);
        const otlpData = spansToOtlpFormat(this.otlpBuffer);
        await fs.promises.appendFile(
          this.otlpFilePath,
          JSON.stringify(otlpData) + '\n',
          'utf-8'
        );
        this.otlpBuffer = [];
      }
    } catch (error) {
      console.error('FileExporter write error:', error);
    }
  }

  private async getFs(): Promise<typeof import('fs') | null> {
    try {
      // Dynamic import for Node.js
      return await import('fs');
    } catch {
      return null;
    }
  }

  private async rotateIfNeeded(fs: typeof import('fs'), filePath: string): Promise<void> {
    try {
      const stats = await fs.promises.stat(filePath);
      if (stats.size >= this.maxFileSize) {
        await this.rotateFile(fs, filePath);
      }
    } catch {
      // File doesn't exist yet, no rotation needed
    }
  }

  private async rotateFile(fs: typeof import('fs'), filePath: string): Promise<void> {
    // Rotate existing files
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldPath = `${filePath}.${i}`;
      const newPath = `${filePath}.${i + 1}`;
      try {
        await fs.promises.rename(oldPath, newPath);
      } catch {
        // File doesn't exist, skip
      }
    }

    // Rename current file to .1
    try {
      await fs.promises.rename(filePath, `${filePath}.1`);
    } catch {
      // File doesn't exist, skip
    }

    // Delete oldest if exceeds maxFiles
    try {
      await fs.promises.unlink(`${filePath}.${this.maxFiles + 1}`);
    } catch {
      // File doesn't exist, skip
    }
  }

  async flush(): Promise<void> {
    await this.writeToFile();
  }

  async shutdown(): Promise<void> {
    await this.flush();
  }

  /**
   * Read all log entries from the file
   */
  async readLogs(): Promise<TelemetryLogEntry[]> {
    try {
      const fs = await this.getFs();
      if (!fs) {
        return [];
      }

      const content = await fs.promises.readFile(this.filePath, 'utf-8');
      return content
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => JSON.parse(line) as TelemetryLogEntry);
    } catch {
      return [];
    }
  }
}

/**
 * Memory Exporter
 * Stores telemetry in memory (useful for testing)
 */
export class MemoryExporter implements TelemetryExporter {
  private spans: TelemetrySpan[] = [];
  private maxSpans: number;

  constructor(options: { maxSpans?: number } = {}) {
    this.maxSpans = options.maxSpans || 1000;
  }

  async export(spans: TelemetrySpan[]): Promise<void> {
    this.spans.push(...spans);

    // Trim if exceeds max
    if (this.spans.length > this.maxSpans) {
      this.spans = this.spans.slice(-this.maxSpans);
    }
  }

  async flush(): Promise<void> {
    // No-op for memory
  }

  async shutdown(): Promise<void> {
    this.clear();
  }

  /**
   * Get all stored spans
   */
  getSpans(): TelemetrySpan[] {
    return [...this.spans];
  }

  /**
   * Get spans as log entries
   */
  getLogEntries(): TelemetryLogEntry[] {
    return this.spans.map(spanToLogEntry);
  }

  /**
   * Get spans in OTLP format
   */
  getOtlpData(): TelemetryExportData {
    return spansToOtlpFormat(this.spans);
  }

  /**
   * Clear all stored spans
   */
  clear(): void {
    this.spans = [];
  }

  /**
   * Get span count
   */
  get count(): number {
    return this.spans.length;
  }
}

/**
 * HTTP Exporter Options
 */
export interface HttpExporterOptions {
  /** Endpoint URL to send telemetry */
  endpoint: string;
  /** HTTP headers to include */
  headers?: Record<string, string>;
  /** Export format: 'otlp' or 'ndjson' */
  format?: 'otlp' | 'ndjson';
  /** Batch size before sending */
  batchSize?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * HTTP Exporter
 * Sends telemetry to a remote endpoint
 */
export class HttpExporter implements TelemetryExporter {
  private endpoint: string;
  private headers: Record<string, string>;
  private format: 'otlp' | 'ndjson';
  private batchSize: number;
  private timeout: number;
  private buffer: TelemetrySpan[] = [];

  constructor(options: HttpExporterOptions) {
    this.endpoint = options.endpoint;
    this.headers = options.headers || {};
    this.format = options.format || 'otlp';
    this.batchSize = options.batchSize || 100;
    this.timeout = options.timeout || 30000;
  }

  async export(spans: TelemetrySpan[]): Promise<void> {
    this.buffer.push(...spans);

    if (this.buffer.length >= this.batchSize) {
      await this.sendBatch();
    }
  }

  private async sendBatch(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const spansToSend = [...this.buffer];
    this.buffer = [];

    try {
      let body: string;
      let contentType: string;

      if (this.format === 'otlp') {
        body = JSON.stringify(spansToOtlpFormat(spansToSend));
        contentType = 'application/json';
      } else {
        body = spansToSend.map(s => JSON.stringify(spanToLogEntry(s))).join('\n');
        contentType = 'application/x-ndjson';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
            ...this.headers
          },
          body,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('HttpExporter send error:', error);
      // Put spans back in buffer for retry
      this.buffer.unshift(...spansToSend);
    }
  }

  async flush(): Promise<void> {
    await this.sendBatch();
  }

  async shutdown(): Promise<void> {
    await this.flush();
  }
}

/**
 * Composite Exporter
 * Sends to multiple exporters
 */
export class CompositeExporter implements TelemetryExporter {
  private exporters: TelemetryExporter[];

  constructor(exporters: TelemetryExporter[]) {
    this.exporters = exporters;
  }

  async export(spans: TelemetrySpan[]): Promise<void> {
    await Promise.all(
      this.exporters.map(e => e.export(spans).catch(console.error))
    );
  }

  async flush(): Promise<void> {
    await Promise.all(
      this.exporters.map(e => e.flush().catch(console.error))
    );
  }

  async shutdown(): Promise<void> {
    await Promise.all(
      this.exporters.map(e => e.shutdown().catch(console.error))
    );
  }

  /**
   * Add an exporter
   */
  addExporter(exporter: TelemetryExporter): void {
    this.exporters.push(exporter);
  }

  /**
   * Remove an exporter
   */
  removeExporter(exporter: TelemetryExporter): void {
    const index = this.exporters.indexOf(exporter);
    if (index !== -1) {
      this.exporters.splice(index, 1);
    }
  }
}
