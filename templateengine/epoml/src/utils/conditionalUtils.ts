/**
 * Utility functions for handling conditional rendering and loop processing
 */

/**
 * Evaluate a conditional expression
 * @param condition The condition to evaluate (boolean, string expression, or function)
 * @param context The evaluation context with variables
 * @returns Boolean result of the condition evaluation
 */
export function evaluateCondition(condition: any, context: Record<string, any>): boolean {
  // If it's already a boolean, return it directly
  if (typeof condition === 'boolean') {
    return condition;
  }
  
  // If it's a string, evaluate it as an expression
  if (typeof condition === 'string') {
    try {
      // Create a function with the context variables in scope
      const funcBody = `return (${condition});`;
      const funcArgs = Object.keys(context);
      const funcValues = Object.values(context);
      const func = new Function(...funcArgs, funcBody);
      return Boolean(func(...funcValues));
    } catch (error) {
      console.warn('Error evaluating condition:', condition, error);
      return false;
    }
  }
  
  // If it's a function, call it with context
  if (typeof condition === 'function') {
    try {
      return Boolean(condition(context));
    } catch (error) {
      console.warn('Error evaluating condition function:', error);
      return false;
    }
  }
  
  // For any other type, convert to boolean
  return Boolean(condition);
}

/**
 * Parse a loop expression in the format "itemName in arrayExpression"
 * @param expression The loop expression to parse
 * @returns Object with itemName and arrayExpression, or null if invalid
 */
export function parseLoopExpression(expression: string): { itemName: string; arrayExpression: string } | null {
  if (!expression || typeof expression !== 'string') {
    return null;
  }
  
  // Match pattern: "itemName in arrayExpression"
  const match = expression.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s+in\s+(.+)$/);
  if (!match) {
    return null;
  }
  
  const [, itemName, arrayExpression] = match;
  return { itemName: itemName.trim(), arrayExpression: arrayExpression.trim() };
}

/**
 * Evaluate an array expression
 * @param expression The array expression to evaluate
 * @param context The evaluation context with variables
 * @returns The evaluated array or empty array if evaluation fails
 */
export function evaluateArrayExpression(expression: string, context: Record<string, any>): any[] {
  try {
    // Handle inline array expressions like ['item1', 'item2', 'item3']
    if (expression.startsWith('[') && expression.endsWith(']')) {
      // Create a function with the context variables in scope
      const funcBody = `return (${expression});`;
      const funcArgs = Object.keys(context);
      const funcValues = Object.values(context);
      const func = new Function(...funcArgs, funcBody);
      const result = func(...funcValues);
      return Array.isArray(result) ? result : [];
    }
    
    // Handle variable references like 'items' or 'user.list'
    // First, try to resolve nested object properties
    if (expression.includes('.')) {
      const parts = expression.split('.');
      let value = context[parts[0]];
      
      // Navigate through the object properties
      for (let i = 1; i < parts.length; i++) {
        if (value && typeof value === 'object' && parts[i] in value) {
          value = value[parts[i]];
        } else {
          // Property not found, fall back to function evaluation
          break;
        }
      }
      
      // If we successfully resolved the nested property and it's an array, return it
      if (Array.isArray(value)) {
        return value;
      }
    }
    
    // Handle simple variable references like 'items'
    if (context[expression] !== undefined && Array.isArray(context[expression])) {
      return context[expression];
    }
    
    // Fall back to function evaluation for complex expressions
    const funcBody = `return (${expression});`;
    // Combine context variables with global variables for evaluation
    const combinedContext = { ...context };
    // Add global variables that might be needed
    if (typeof (global as any) !== 'undefined' && (global as any) !== null) {
      Object.assign(combinedContext, global as any);
    }
    const funcArgs = Object.keys(combinedContext);
    const funcValues = Object.values(combinedContext);
    const func = new Function(...funcArgs, funcBody);
    const result = func(...funcValues);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn('Error evaluating array expression:', expression, error);
    return [];
  }
}

/**
 * Create a loop context for a specific iteration
 * @param baseContext The base evaluation context
 * @param itemName The name of the loop variable
 * @param itemValue The current item value
 * @param index The current iteration index
 * @param length The total length of the array
 * @returns New context with loop variables
 */
export function createLoopContext(
  baseContext: Record<string, any>,
  itemName: string,
  itemValue: any,
  index: number,
  length: number
): Record<string, any> {
  return {
    ...baseContext,
    [itemName]: itemValue,
    loop: {
      index,
      length,
      first: index === 0,
      last: index === length - 1
    }
  };
}