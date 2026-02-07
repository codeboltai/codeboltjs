// Local Models API types

export interface LocalModel {
  id: string;
  name: string;
  size?: number;
  format?: string;
  quantization?: string;
  downloaded?: boolean;
  loaded?: boolean;
}

export interface DownloadLocalModelRequest {
  modelId: string;
  source?: string;
}

export interface LoadLocalModelRequest {
  modelId: string;
  config?: Record<string, unknown>;
}

export interface UnloadLocalModelRequest {
  modelId: string;
}
