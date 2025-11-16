const EVENT_SLOT_INDEX = 0;
const RESPONSE_SLOT_INDEX = 1;
const SUCCESS_SLOT_INDEX = 2;

export function getInputOrProperty(node: any, portIndex: number, propertyName: string): string {
  if (typeof node.getInputData === 'function') {
    const inputValue = node.getInputData(portIndex);
    if (inputValue !== undefined && inputValue !== null) {
      const trimmed = String(inputValue).trim();
      if (trimmed.length) {
        return trimmed;
      }
    }
  }

  const propertyValue = node?.properties?.[propertyName];
  if (typeof propertyValue === 'string') {
    const trimmed = propertyValue.trim();
    if (trimmed.length) {
      return trimmed;
    }
  }

  return '';
}

export function emitGitSuccess(node: any, response: unknown) {
  if (typeof node.setOutputData === 'function') {
    node.setOutputData(RESPONSE_SLOT_INDEX, response ?? null);
    node.setOutputData(SUCCESS_SLOT_INDEX, true);
  }

  if (typeof node.triggerSlot === 'function') {
    try {
      node.triggerSlot(EVENT_SLOT_INDEX, null, null);
    } catch (error) {
      console.error('[GitNode] triggerSlot failed:', error);
    }
  }
}

export function emitGitFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };

  if (typeof node.setOutputData === 'function') {
    node.setOutputData(RESPONSE_SLOT_INDEX, payload);
    node.setOutputData(SUCCESS_SLOT_INDEX, false);
  }

  console.error(`[GitNode] ${message}`, error);
}
