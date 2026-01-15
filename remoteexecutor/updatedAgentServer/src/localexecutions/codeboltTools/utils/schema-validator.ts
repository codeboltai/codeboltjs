/**
 * JSON Schema validation utilities
 */

/**
 * Simple JSON Schema validator
 */
export class SchemaValidator {
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
          const propError = this.validate(propSchema, dataObj[key]);
          if (propError) {
            return `Property '${key}': ${propError}`;
          }
        }
      }
    }

    return null; // Valid
  }
}