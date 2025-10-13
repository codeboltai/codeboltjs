export type FallbackArgs = Record<string, string | boolean>;

export function parseFallbackArgs(args: string[]): FallbackArgs {
  const result: FallbackArgs = {};

  for (let index = 0; index < args.length; index++) {
    const token = args[index];

    if (typeof token !== 'string' || !token.startsWith('--')) {
      continue;
    }

    const trimmed = token.slice(2);

    if (!trimmed) {
      continue;
    }

    if (trimmed.includes('=')) {
      const [rawKey, ...rawValue] = trimmed.split('=');
      const key = rawKey.trim();
      const value = rawValue.join('=');

      if (!key) {
        continue;
      }

      result[key] = value === '' ? true : value;
      continue;
    }

    const nextToken = args[index + 1];

    if (typeof nextToken === 'string' && !nextToken.startsWith('--')) {
      result[trimmed] = nextToken;
      index += 1;
      continue;
    }

    result[trimmed] = true;
  }

  return result;
}

export interface OptionResolvers {
  resolveStringOption: (primary?: string, fallbackKey?: string) => string | undefined;
  resolveBooleanOption: (primary?: boolean, fallbackKey?: string) => boolean;
  resolveNumberOption: (primary?: number, fallbackKey?: string) => number | undefined;
}

export function createOptionResolvers(fallbackArgs: FallbackArgs): OptionResolvers {
  const resolveStringOption = (primary?: string, fallbackKey?: string): string | undefined => {
    if (primary) {
      return primary;
    }

    if (!fallbackKey) {
      return undefined;
    }

    const fallbackValue = fallbackArgs[fallbackKey];

    return typeof fallbackValue === 'string' ? fallbackValue : undefined;
  };

  const resolveBooleanOption = (primary?: boolean, fallbackKey?: string): boolean => {
    if (typeof primary === 'boolean') {
      return primary;
    }

    if (!fallbackKey) {
      return false;
    }

    const fallbackValue = fallbackArgs[fallbackKey];

    if (typeof fallbackValue === 'boolean') {
      return fallbackValue;
    }

    if (typeof fallbackValue === 'string') {
      if (fallbackValue === 'false') {
        return false;
      }

      if (fallbackValue === 'true') {
        return true;
      }

      return true;
    }

    return false;
  };

  const resolveNumberOption = (primary?: number, fallbackKey?: string): number | undefined => {
    if (typeof primary === 'number' && !Number.isNaN(primary)) {
      return primary;
    }

    if (!fallbackKey) {
      return undefined;
    }

    const fallbackValue = fallbackArgs[fallbackKey];

    if (typeof fallbackValue === 'string') {
      const parsed = Number(fallbackValue);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
  };

  return {
    resolveStringOption,
    resolveBooleanOption,
    resolveNumberOption
  };
}
