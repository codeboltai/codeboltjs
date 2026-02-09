// Canvas API types

export interface Canvas {
  id: string;
  name?: string;
  content: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCanvasRequest {
  name?: string;
  content: Record<string, unknown>;
}

export interface UpdateCanvasRequest {
  id: string;
  name?: string;
  content: Record<string, unknown>;
}

export interface GetCanvasParams {
  id?: string;
  name?: string;
}
