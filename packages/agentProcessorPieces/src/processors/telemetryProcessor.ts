import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agentprocessorframework';

export interface TelemetryProcessorOptions {
    enablePerformanceTracking?: boolean;
    enableErrorTracking?: boolean;
    enableUsageTracking?: boolean;
    enableTokenTracking?: boolean;
    sampleRate?: number; // 0.0 to 1.0
    batchSize?: number;
    flushInterval?: number; // in milliseconds
    enableLocalStorage?: boolean;
    exportPath?: string;
}

export interface PerformanceMetric {
    operation: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    metadata?: Record<string, any>;
}

export interface ErrorMetric {
    type: string;
    message: string;
    stack?: string;
    timestamp: number;
    context?: Record<string, any>;
}

export interface UsageMetric {
    feature: string;
    count: number;
    timestamp: number;
    userId?: string;
    sessionId?: string;
}

export interface TokenMetric {
    model: string;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    totalTokens: number;
    timestamp: number;
    cost?: number;
}

export interface TelemetryData {
    sessionId: string;
    timestamp: number;
    performance: PerformanceMetric[];
    errors: ErrorMetric[];
    usage: UsageMetric[];
    tokens: TokenMetric[];
    metadata: Record<string, any>;
}

export class TelemetryProcessor extends BaseProcessor {
    private readonly enablePerformanceTracking: boolean;
    private readonly enableErrorTracking: boolean;
    private readonly enableUsageTracking: boolean;
    private readonly enableTokenTracking: boolean;
    private readonly sampleRate: number;
    private readonly batchSize: number;
    private readonly flushInterval: number;
    private readonly enableLocalStorage: boolean;
    private readonly exportPath: string;

    // Metrics storage
    private performanceMetrics: PerformanceMetric[] = [];
    private errorMetrics: ErrorMetric[] = [];
    private usageMetrics: UsageMetric[] = [];
    private tokenMetrics: TokenMetric[] = [];
    
    // Session tracking
    private sessionId: string;
    private startTime: number;
    private operationTimers = new Map<string, number>();
    
    // Flush timer
    private flushTimer?: NodeJS.Timeout;

    constructor(options: TelemetryProcessorOptions = {}) {
        super();
        this.enablePerformanceTracking = options.enablePerformanceTracking !== false;
        this.enableErrorTracking = options.enableErrorTracking !== false;
        this.enableUsageTracking = options.enableUsageTracking !== false;
        this.enableTokenTracking = options.enableTokenTracking !== false;
        this.sampleRate = options.sampleRate || 1.0;
        this.batchSize = options.batchSize || 100;
        this.flushInterval = options.flushInterval || 60000; // 1 minute
        this.enableLocalStorage = options.enableLocalStorage !== false;
        this.exportPath = options.exportPath || './telemetry';

        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();

        // Setup periodic flush
        if (this.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
                this.flushMetrics().catch(console.error);
            }, this.flushInterval);
        }
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        const { message, context } = input;
        
        // Sample based on rate
        if (Math.random() > this.sampleRate) {
            return [];
        }

        const results: ProcessorOutput[] = [];

        try {
            // Track processing performance
            if (this.enablePerformanceTracking) {
                this.startOperation('message_processing');
            }

            // Track usage
            if (this.enableUsageTracking) {
                this.trackUsage('message_processed', context?.userId, this.sessionId);
            }

            // Track token usage if available
            if (this.enableTokenTracking && context?.tokenUsage) {
                this.trackTokens(
                    context.llmconfig?.model || 'unknown',
                    context.tokenUsage.input || 0,
                    context.tokenUsage.output || 0,
                    context.tokenUsage.cached || 0,
                    context.tokenUsage.cost
                );
            }

            // Track tool usage
            if (this.enableUsageTracking && message.messages) {
                for (const msg of message.messages) {
                    if (msg.tool_calls && msg.tool_calls.length > 0) {
                        for (const toolCall of msg.tool_calls) {
                            this.trackUsage(`tool_${toolCall.function.name}`, context?.userId, this.sessionId);
                        }
                    }
                }
            }

            results.push(this.createEvent('TelemetryRecorded', {
                sessionId: this.sessionId,
                metricsCount: this.getTotalMetricsCount()
            }));

            // Check if we need to flush
            if (this.getTotalMetricsCount() >= this.batchSize) {
                await this.flushMetrics();
                results.push(this.createEvent('TelemetryFlushed', {
                    sessionId: this.sessionId,
                    reason: 'batch_size_reached'
                }));
            }

        } catch (error) {
            if (this.enableErrorTracking) {
                this.trackError(
                    'telemetry_processing_error',
                    error instanceof Error ? error.message : String(error),
                    error instanceof Error ? error.stack : undefined,
                    { messageType: typeof message, contextKeys: context ? Object.keys(context) : [] }
                );
            }

            results.push(this.createEvent('TelemetryError', {
                error: error instanceof Error ? error.message : String(error)
            }));
        } finally {
            if (this.enablePerformanceTracking) {
                this.endOperation('message_processing', true);
            }
        }

        return results;
    }

    // Performance tracking methods
    startOperation(operation: string): void {
        if (!this.enablePerformanceTracking) return;
        this.operationTimers.set(operation, Date.now());
    }

    endOperation(operation: string, success: boolean, metadata?: Record<string, any>): void {
        if (!this.enablePerformanceTracking) return;
        
        const startTime = this.operationTimers.get(operation);
        if (startTime === undefined) return;

        const endTime = Date.now();
        const duration = endTime - startTime;

        this.performanceMetrics.push({
            operation,
            startTime,
            endTime,
            duration,
            success,
            metadata
        });

        this.operationTimers.delete(operation);
    }

    // Error tracking methods
    trackError(type: string, message: string, stack?: string, context?: Record<string, any>): void {
        if (!this.enableErrorTracking) return;

        this.errorMetrics.push({
            type,
            message,
            stack,
            timestamp: Date.now(),
            context
        });
    }

    // Usage tracking methods
    trackUsage(feature: string, userId?: string, sessionId?: string): void {
        if (!this.enableUsageTracking) return;

        // Check if we already have a metric for this feature in the current batch
        const existingMetric = this.usageMetrics.find(
            m => m.feature === feature && 
                 m.userId === userId && 
                 m.sessionId === sessionId &&
                 Date.now() - m.timestamp < 60000 // Within last minute
        );

        if (existingMetric) {
            existingMetric.count++;
        } else {
            this.usageMetrics.push({
                feature,
                count: 1,
                timestamp: Date.now(),
                userId,
                sessionId: sessionId || this.sessionId
            });
        }
    }

    // Token tracking methods
    trackTokens(model: string, inputTokens: number, outputTokens: number, cachedTokens: number = 0, cost?: number): void {
        if (!this.enableTokenTracking) return;

        this.tokenMetrics.push({
            model,
            inputTokens,
            outputTokens,
            cachedTokens,
            totalTokens: inputTokens + outputTokens + cachedTokens,
            timestamp: Date.now(),
            cost
        });
    }

    // Flush methods
    async flushMetrics(): Promise<void> {
        if (!this.enableLocalStorage) return;

        const telemetryData: TelemetryData = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            performance: [...this.performanceMetrics],
            errors: [...this.errorMetrics],
            usage: [...this.usageMetrics],
            tokens: [...this.tokenMetrics],
            metadata: {
                sessionStartTime: this.startTime,
                flushTime: Date.now(),
                totalOperationsTracked: this.performanceMetrics.length,
                totalErrorsTracked: this.errorMetrics.length,
                totalUsageEvents: this.usageMetrics.length,
                totalTokenEvents: this.tokenMetrics.length
            }
        };

        try {
            // In a real implementation, you would send this to a telemetry service
            // For now, we'll just log it and optionally save to file
            console.log('[Telemetry] Flushing metrics:', {
                sessionId: this.sessionId,
                metricsCount: this.getTotalMetricsCount()
            });

            if (this.enableLocalStorage) {
                await this.saveToFile(telemetryData);
            }

            // Clear metrics after successful flush
            this.clearMetrics();

        } catch (error) {
            console.error('[Telemetry] Error flushing metrics:', error);
            throw error;
        }
    }

    private async saveToFile(data: TelemetryData): Promise<void> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Ensure directory exists
            try {
                await fs.access(this.exportPath);
            } catch {
                await fs.mkdir(this.exportPath, { recursive: true });
            }

            const filename = `telemetry-${this.sessionId}-${Date.now()}.json`;
            const filepath = path.join(this.exportPath, filename);
            
            await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error('[Telemetry] Error saving to file:', error);
        }
    }

    private clearMetrics(): void {
        this.performanceMetrics = [];
        this.errorMetrics = [];
        this.usageMetrics = [];
        this.tokenMetrics = [];
    }

    private getTotalMetricsCount(): number {
        return this.performanceMetrics.length + 
               this.errorMetrics.length + 
               this.usageMetrics.length + 
               this.tokenMetrics.length;
    }

    private generateSessionId(): string {
        return `telemetry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Public methods for getting metrics
    getMetricsSummary(): {
        sessionId: string;
        sessionDuration: number;
        performance: number;
        errors: number;
        usage: number;
        tokens: number;
        total: number;
    } {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            performance: this.performanceMetrics.length,
            errors: this.errorMetrics.length,
            usage: this.usageMetrics.length,
            tokens: this.tokenMetrics.length,
            total: this.getTotalMetricsCount()
        };
    }

    getPerformanceStats(): {
        averageDuration: number;
        successRate: number;
        slowestOperation: PerformanceMetric | null;
        fastestOperation: PerformanceMetric | null;
    } {
        if (this.performanceMetrics.length === 0) {
            return {
                averageDuration: 0,
                successRate: 0,
                slowestOperation: null,
                fastestOperation: null
            };
        }

        const totalDuration = this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0);
        const successCount = this.performanceMetrics.filter(m => m.success).length;
        const sortedByDuration = [...this.performanceMetrics].sort((a, b) => a.duration - b.duration);

        return {
            averageDuration: totalDuration / this.performanceMetrics.length,
            successRate: successCount / this.performanceMetrics.length,
            slowestOperation: sortedByDuration[sortedByDuration.length - 1] || null,
            fastestOperation: sortedByDuration[0] || null
        };
    }

    // Cleanup
    async destroy(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        
        // Final flush
        if (this.getTotalMetricsCount() > 0) {
            await this.flushMetrics();
        }
    }
}
