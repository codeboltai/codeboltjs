const EVENT_INDEX = 0;
const SUMMARY_INDEX = 1;
const SUCCESS_INDEX = 2;

export function getArrayInput(node: any, portIndex: number, propertyName: string) {
  const inputValue = node.getInputData?.(portIndex);
  if (Array.isArray(inputValue)) {
    return inputValue;
  }

  const propertyValue = node?.properties?.[propertyName];
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
      console.warn('[HistoryNode] Failed to parse array property:', error);
    }
  }

  return [];
}

export function getNumberInput(node: any, portIndex: number, propertyName: string, fallback = 0) {
  const inputValue = node.getInputData?.(portIndex);
  const numeric = Number(inputValue ?? node?.properties?.[propertyName] ?? fallback);
  return Number.isNaN(numeric) ? fallback : numeric;
}

export function emitHistorySuccess(node: any, summary: unknown) {
  node.setOutputData?.(SUMMARY_INDEX, summary ?? null);
  node.setOutputData?.(SUCCESS_INDEX, true);
  try {
    node.triggerSlot?.(EVENT_INDEX, null, null);
  } catch (error) {
    console.error('[HistoryNode] triggerSlot failed:', error);
  }
}

export function emitHistoryFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  node.setOutputData?.(SUMMARY_INDEX, payload);
  node.setOutputData?.(SUCCESS_INDEX, false);
  console.error(`[HistoryNode] ${message}`, error);
}
