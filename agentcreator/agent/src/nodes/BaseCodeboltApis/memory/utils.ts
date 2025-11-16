const EVENT_INDEX = 0;
const RESPONSE_INDEX = 1;
const SUCCESS_INDEX = 2;

export function getStringInput(node: any, portIndex: number, propertyName: string, fallback = "") {
  const inputValue = node.getInputData?.(portIndex);
  if (typeof inputValue === 'string' && inputValue.trim().length) {
    return inputValue.trim();
  }

  const propertyValue = node?.properties?.[propertyName];
  if (typeof propertyValue === 'string' && propertyValue.trim().length) {
    return propertyValue.trim();
  }

  return fallback;
}

export function getJsonInput(node: any, portIndex: number, propertyName: string) {
  const inputValue = node.getInputData?.(portIndex);
  if (inputValue !== undefined) {
    return inputValue;
  }

  const propertyValue = node?.properties?.[propertyName];
  if (propertyValue !== undefined) {
    if (typeof propertyValue === 'string') {
      try {
        return JSON.parse(propertyValue);
      } catch (error) {
        console.warn('[MemoryNode] Failed to parse value JSON:', error);
      }
    }
    return propertyValue;
  }
  return undefined;
}

export function getObjectInput(node: any, portIndex: number, propertyName: string, fallback?: Record<string, unknown> | unknown) {
  const inputValue = node.getInputData?.(portIndex);
  if (inputValue && typeof inputValue === 'object') {
    return inputValue;
  }

  const propertyValue = node?.properties?.[propertyName];
  if (propertyValue && typeof propertyValue === 'object') {
    return propertyValue;
  }

  if (typeof propertyValue === 'string' && propertyValue.trim().length) {
    try {
      return JSON.parse(propertyValue);
    } catch (error) {
      console.warn('[MemoryNode] Failed to parse object property:', error);
    }
  }

  return fallback;
}

function setBaseOutputs(node: any, response: unknown, success: boolean) {
  node.setOutputData?.(RESPONSE_INDEX, response ?? null);
  node.setOutputData?.(SUCCESS_INDEX, success);
}

export function emitMemorySuccess(node: any, response: unknown) {
  setBaseOutputs(node, response, true);
  try {
    node.triggerSlot?.(EVENT_INDEX, null, null);
  } catch (error) {
    console.error('[MemoryNode] triggerSlot failed:', error);
  }
}

export function emitMemoryFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  setBaseOutputs(node, payload, false);
  console.error(`[MemoryNode] ${message}`, error);
}
