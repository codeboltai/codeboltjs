const EVENT_OUTPUT = 0;
const RESPONSE_OUTPUT = 1;
const SUCCESS_OUTPUT = 2;

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

function setOutputs(node: any, response: unknown, success: boolean) {
  node.setOutputData?.(RESPONSE_OUTPUT, response ?? null);
  node.setOutputData?.(SUCCESS_OUTPUT, success);
}

export function emitCrawlerSuccess(node: any, response?: unknown) {
  setOutputs(node, response ?? null, true);
  try {
    node.triggerSlot?.(EVENT_OUTPUT, null, null);
  } catch (error) {
    console.error('[CrawlerNode] triggerSlot failed:', error);
  }
}

export function emitCrawlerFailure(node: any, message: string, error?: unknown) {
  const payload = {
    error: message,
    details: error instanceof Error ? error.message : error ?? null
  };
  setOutputs(node, payload, false);
  console.error(`[CrawlerNode] ${message}`, error);
}
