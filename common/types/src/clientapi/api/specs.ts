// Specs API types

export interface Spec {
  id: string;
  name: string;
  content: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpecRequest {
  name: string;
  content: string;
  type?: string;
}

export interface UpdateSpecRequest {
  id: string;
  name?: string;
  content?: string;
  type?: string;
}

export interface GetSpecParams {
  id?: string;
  name?: string;
}

export interface ListSpecsParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface EnsureSpecFolderRequest {
  path?: string;
}
