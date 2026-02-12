/**
 * JSON Schema validation utilities for tool parameters
 */

/**
 * Simple JSON Schema validator
 */
export class SchemaValidator {
    private static tryParseJson(value: unknown): unknown {
        if (typeof value !== 'string') return value;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    static validate(schema: unknown, data: unknown): string | null {
        if (!schema || typeof schema !== 'object') {
            return null; // No schema to validate against
        }

        const s = schema as Record<string, unknown>;

        // Check required fields
        if (s.required && Array.isArray(s.required)) {
            for (const field of s.required) {
                if (typeof field === 'string') {
                    if (!data || typeof data !== 'object' || !(field in (data as object))) {
                        return `Missing required field: ${field}`;
                    }
                }
            }
        }

        // Basic type checking
        if (s.type && data !== null && data !== undefined) {
            const expectedType = s.type as string;
            const actualType = typeof data;

            if (expectedType === 'object' && actualType !== 'object') {
                return `Expected object, got ${actualType}`;
            }
            if (expectedType === 'string' && actualType !== 'string') {
                return `Expected string, got ${actualType}`;
            }
            if (expectedType === 'number' && actualType !== 'number') {
                return `Expected number, got ${actualType}`;
            }
            if (expectedType === 'boolean' && actualType !== 'boolean') {
                return `Expected boolean, got ${actualType}`;
            }
            if (expectedType === 'array' && !Array.isArray(data)) {
                return `Expected array, got ${actualType}`;
            }
        }

        // Validate properties if it's an object
        if (s.properties && data && typeof data === 'object' && !Array.isArray(data)) {
            const properties = s.properties as Record<string, unknown>;
            const dataObj = data as Record<string, unknown>;

            for (const [key, propSchema] of Object.entries(properties)) {
                if (key in dataObj) {
                    // Try parsing JSON strings before validating nested properties
                    const resolvedValue = this.tryParseJson(dataObj[key]);
                    const propError = this.validate(propSchema, resolvedValue);
                    if (propError) {
                        return `Property '${key}': ${propError}`;
                    }
                }
            }
        }

        // Validate array items
        if (s.items && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const itemError = this.validate(s.items, data[i]);
                if (itemError) {
                    return `Array item [${i}]: ${itemError}`;
                }
            }
        }

        // Check enum values
        if (s.enum && Array.isArray(s.enum)) {
            if (!s.enum.includes(data)) {
                return `Value must be one of: ${s.enum.join(', ')}`;
            }
        }

        // Check minimum/maximum for numbers
        if (typeof data === 'number') {
            if (typeof s.minimum === 'number' && data < s.minimum) {
                return `Value must be >= ${s.minimum}`;
            }
            if (typeof s.maximum === 'number' && data > s.maximum) {
                return `Value must be <= ${s.maximum}`;
            }
        }

        // Check minLength/maxLength for strings
        if (typeof data === 'string') {
            if (typeof s.minLength === 'number' && data.length < s.minLength) {
                return `String length must be >= ${s.minLength}`;
            }
            if (typeof s.maxLength === 'number' && data.length > s.maxLength) {
                return `String length must be <= ${s.maxLength}`;
            }
        }

        return null; // Valid
    }
}
