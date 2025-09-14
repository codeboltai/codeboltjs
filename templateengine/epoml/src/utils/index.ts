/**
 * Shared utility functions for EPOML components
 */

/**
 * Escapes HTML special characters to prevent XSS vulnerabilities
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes XML special characters
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes XML attribute values (includes apos entity)
 */
export function escapeXmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Processes template variables in text content
 * Replaces {variableName} and {{variableName}} patterns with actual values from context
 */
export function processTemplateVars(text: string, context: Record<string, any> = {}): string {
  // Handle double curly braces {{variableName}}
  text = text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedVarName = varName.trim();
    // Handle special loop variables like loop.index
    if (trimmedVarName.startsWith('loop.')) {
      const loopProp = trimmedVarName.substring(5); // Remove 'loop.' prefix
      return context.loop && context.loop[loopProp] !== undefined ? String(context.loop[loopProp]) : match;
    }
    
    // Handle object property access like person.name
    if (trimmedVarName.includes('.')) {
      const parts = trimmedVarName.split('.');
      let value = context[parts[0]];
      
      // Navigate through the object properties
      for (let i = 1; i < parts.length; i++) {
        if (value && typeof value === 'object' && parts[i] in value) {
          value = value[parts[i]];
        } else {
          // Property not found, return the original match
          return match;
        }
      }
      
      return value !== undefined ? String(value) : match;
    }
    
    return context[trimmedVarName] !== undefined ? String(context[trimmedVarName]) : match;
  });
  
  // Handle single curly braces {variableName}
  text = text.replace(/\{(\w+)\}/g, (match, varName) => {
    return context[varName] !== undefined ? String(context[varName]) : match;
  });
  
  return text;
}

/**
 * Validates syntax type against supported options
 */
export function validateSyntax(syntax: string): boolean {
  const supportedSyntaxes = ['markdown', 'html', 'json', 'yaml', 'xml', 'text'];
  return supportedSyntaxes.includes(syntax);
}

/**
 * Generates repetitive characters for text formatting
 */
export function repeatChar(char: string, count: number): string {
  return char.repeat(Math.max(0, count));
}

/**
 * Indents text content by the specified number of spaces
 */
export function indentText(text: string, spaces: number): string {
  const indentation = ' '.repeat(spaces);
  return text.split('\n').map(line => line.trim() ? indentation + line : line).join('\n');
}

/**
 * Formats multiline content for YAML block scalar
 */
export function formatYamlBlock(content: string, indent: number = 2): string {
  return content.split('\n').map(line => ' '.repeat(indent) + line).join('\n');
}

/**
 * Safely converts any value to string
 */
export function safeStringify(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Creates a formatted header for text output
 */
export function createTextHeader(title: string, char: string = '='): string {
  const headerLength = Math.max(title.length, 20);
  return `${title}\n${repeatChar(char, headerLength)}`;
}

/**
 * Wraps content in markdown code block
 */
export function wrapInCodeBlock(content: string, language: string = ''): string {
  return `\`\`\`${language}\n${content}\n\`\`\``;
}

/**
 * Validates required properties are present
 */
export function validateRequired<T>(obj: T, requiredProps: (keyof T)[]): void {
  for (const prop of requiredProps) {
    if (obj[prop] === undefined || obj[prop] === null) {
      throw new Error(`Required property '${String(prop)}' is missing`);
    }
  }
}

/**
 * Merges default props with provided props
 */
export function mergeProps<T>(defaults: Partial<T>, props: Partial<T>): T {
  return { ...defaults, ...props } as T;
}