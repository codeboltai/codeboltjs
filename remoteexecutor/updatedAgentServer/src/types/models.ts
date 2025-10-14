export interface ModelOption {
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  context?: string;
}

export interface ModelListResponse {
  models: ModelOption[];
}
