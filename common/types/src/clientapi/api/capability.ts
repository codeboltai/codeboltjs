// Capability API types

export type CapabilityStatus = 'active' | 'inactive' | 'error' | 'loading';

export interface Capability {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  status: CapabilityStatus;
  type?: string;
  version?: string;
  config?: Record<string, unknown>;
  permissions?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateCapabilityRequest {
  name: string;
  displayName?: string;
  description?: string;
  type?: string;
  version?: string;
  config?: Record<string, unknown>;
  permissions?: string[];
}

export interface CapabilityExecutor {
  id: string;
  name: string;
  capabilityName: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface CreateCapabilityExecutorRequest {
  name: string;
  capabilityName: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface CapabilityStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
}
