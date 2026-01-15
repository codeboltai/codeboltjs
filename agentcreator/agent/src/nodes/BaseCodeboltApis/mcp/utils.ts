const EVENT_OUTPUT = 0;
const RESULT_OUTPUT = 1;
const SUCCESS_OUTPUT = 2;

export function getStringInput(node: any, portIndex: number, propertyKey: string, fallback = "") {
  const inputValue = node.getInputData?.(portIndex);
  if (typeof inputValue === 'string' && inputValue.trim().length) {
    return inputValue.trim();
  }

  const propertyValue = node?.properties?.[propertyKey];
  if (typeof propertyValue === 'string' && propertyValue.trim().length) {
    return propertyValue.trim();
  }
  return fallback;
}

export function getArrayInput(node: any, portIndex: number, propertyKey: string) {
  const inputValue = node.getInputData?.(portIndex);
  if (Array.isArray(inputValue)) {
    return inputValue;
  }

  const propertyValue = node?.properties?.[propertyKey];
  if (Array.isArray(propertyValue)) {
    return propertyValue;
  }

  if (typeof propertyValue === 'string') {
    try {
      const parsed = JSON.parse(propertyValue);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('[MCPNode] Failed to parse array property:', error);
    }
  }
  return [];
}

export function getObjectInput(node: any, portIndex: number, propertyKey: string) {
  const inputValue = node.getInputData?.(portIndex);
  if (inputValue && typeof inputValue === 'object') {
    return inputValue;
  }

  const propertyValue = node?.properties?.[propertyKey];
  if (propertyValue && typeof propertyValue === 'object') {
    return propertyValue;
  }

  if (typeof propertyValue === 'string') {
    try {
      return JSON.parse(propertyValue);
    } catch (error) {
      console.warn('[MCPNode] Failed to parse object property:', error);
    }
  }
  return undefined;
}

function setOutputs(node: any, result: unknown, success: boolean) {
  node.setOutputData?.(RESULT_OUTPUT, result ?? null);
  node.setOutputData?.(SUCCESS_OUTPUT, success);
}

export function emitMCPSuccess(node: any, result: unknown) {
  setOutputs(node, result, true);
  try {
    node.triggerSlot?.(EVENT_OUTPUT, null, null);
  } catch (error) {
    console.error('[MCPNode] triggerSlot failed:', error);
  }
}

export function emitMCPFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  setOutputs(node, payload, false);
  console.error(`[MCPNode] ${message}`, error);
}
