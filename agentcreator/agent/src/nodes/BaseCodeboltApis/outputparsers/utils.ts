export const coerceStringInput = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
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
};

export const coerceParsableOutput = (value: unknown): string => {
  const coerced = coerceStringInput(value);
  return coerced ?? '';
};
