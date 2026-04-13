import type { CodeboltMessage, IFormatter } from '../types.js';

/**
 * Abstract base class for CLI output formatters.
 *
 * Subclasses implement `parseLine()` to convert raw stdout lines
 * from a specific CLI agent into CodeboltMessage objects.
 */
export abstract class BaseFormatter implements IFormatter {
    abstract parseLine(line: string, timestamp: string): CodeboltMessage[];

    parseError(text: string): CodeboltMessage {
        return {
            type: 'error',
            timestamp: new Date().toISOString(),
            text,
        };
    }
}
