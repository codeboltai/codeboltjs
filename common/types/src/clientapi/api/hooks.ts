// Hooks API types

export interface Hook {
  id: string;
  name: string;
  description?: string;
  event: string;
  handler: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHookRequest {
  name: string;
  description?: string;
  event: string;
  handler: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface UpdateHookRequest {
  name?: string;
  description?: string;
  event?: string;
  handler?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface InitializeHooksRequest {
  reset?: boolean;
}
