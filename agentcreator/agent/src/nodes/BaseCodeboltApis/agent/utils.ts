const EVENT_SLOT_INDEX = 0;
const RESPONSE_SLOT_INDEX = 1;
const SUCCESS_SLOT_INDEX = 2;

export function getStringInput(node: any, portIndex: number, propertyKey: string, fallback = ""): string {
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

export function getNumberInput(node: any, portIndex: number, propertyKey: string, fallback = 0): number {
  const inputValue = node.getInputData?.(portIndex);
  const numeric = Number(inputValue ?? node?.properties?.[propertyKey] ?? fallback);
  return Number.isNaN(numeric) ? fallback : numeric;
}

export function getArrayInput(node: any, portIndex: number, propertyKey: string, fallback: any[] = []): any[] {
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
      console.warn('[AgentNode] Failed to parse property array:', propertyValue);
    }
  }

  return fallback;
}

export function emitAgentSuccess(node: any, response: unknown) {
  node.setOutputData?.(RESPONSE_SLOT_INDEX, response ?? null);
  node.setOutputData?.(SUCCESS_SLOT_INDEX, true);
  try {
    node.triggerSlot?.(EVENT_SLOT_INDEX, null, null);
  } catch (error) {
    console.error('[AgentNode] triggerSlot failed:', error);
  }
}

export function emitAgentFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  node.setOutputData?.(RESPONSE_SLOT_INDEX, payload);
  node.setOutputData?.(SUCCESS_SLOT_INDEX, false);
  console.error(`[AgentNode] ${message}`, error);
}
