export type TaskStatus = 'pending' | 'completed' | 'processing' | 'all';

export const normalizeTaskStatus = (value: unknown): TaskStatus | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case 'pending':
    case 'completed':
    case 'processing':
    case 'all':
      return normalized as TaskStatus;
    default:
      return undefined;
  }
};
