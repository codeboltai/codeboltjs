// Templates API types

export interface Template {
  id: string;
  name: string;
  description?: string;
  type?: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateListParams {
  type?: string;
  limit?: number;
  offset?: number;
}
