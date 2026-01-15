const EVENT_INDEX = 0;
const RESPONSE_INDEX = 1;
const SUCCESS_INDEX = 2;

export function getStringInput(node: any, portIndex: number, propertyKey: string, fallback = "") {
  const inputValue = node.getInputData?.(portIndex);
  if (typeof inputValue === 'string' && inputValue.trim().length) {
    return inputValue.trim();
  }

  const propValue = node?.properties?.[propertyKey];
  if (typeof propValue === 'string' && propValue.trim().length) {
    return propValue.trim();
  }

  return fallback;
}

export function getBooleanInput(node: any, portIndex: number, propertyKey: string, fallback = false) {
  const inputValue = node.getInputData?.(portIndex);
  if (typeof inputValue === 'boolean') {
    return inputValue;
  }

  const propValue = node?.properties?.[propertyKey];
  if (typeof propValue === 'boolean') {
    return propValue;
  }

  return fallback;
}

export function getArrayInput(node: any, portIndex: number, propertyKey: string, fallback: any[] = []) {
  const inputValue = node.getInputData?.(portIndex);
  if (Array.isArray(inputValue)) {
    return inputValue;
  }

  const propValue = node?.properties?.[propertyKey];
  if (Array.isArray(propValue)) {
    return propValue;
  }

  if (typeof propValue === 'string') {
    try {
      const parsed = JSON.parse(propValue);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('[ChatNode] Failed to parse buttons JSON:', error);
    }
  }

  return fallback;
}

function setBaseOutputs(node: any, response: unknown, success: boolean) {
  node.setOutputData?.(RESPONSE_INDEX, response ?? null);
  node.setOutputData?.(SUCCESS_INDEX, success);
}

export function emitChatSuccess(node: any, response: unknown) {
  setBaseOutputs(node, response, true);
  try {
    node.triggerSlot?.(EVENT_INDEX, null, null);
  } catch (error) {
    console.error('[ChatNode] triggerSlot failed:', error);
  }
}

export function emitChatFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  setBaseOutputs(node, payload, false);
  console.error(`[ChatNode] ${message}`, error);
}

export function setNamedOutput(node: any, name: string, value: unknown) {
  const index = node.outputs?.findIndex((output: any) => output.name === name);
  if (index !== undefined && index >= 0) {
    node.setOutputData?.(index, value);
  }
}
