export type Logger = {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export function createPrefixedLogger(prefix: string): Logger {
  const format = (messageArgs: unknown[]) => [prefix, ...messageArgs];

  return {
    log: (...args: unknown[]) => console.log(...format(args)),
    warn: (...args: unknown[]) => console.warn(...format(args)),
    error: (...args: unknown[]) => console.error(...format(args)),
  };
}

