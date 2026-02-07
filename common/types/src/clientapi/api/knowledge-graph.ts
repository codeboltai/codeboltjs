// Knowledge Graph API types

export interface KGInstanceTemplate {
  id: string;
  name: string;
  description?: string;
  nodeTypes: KGNodeType[];
  edgeTypes: KGEdgeType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KGNodeType {
  name: string;
  fields: KGField[];
}

export interface KGEdgeType {
  name: string;
  sourceType: string;
  targetType: string;
  fields?: KGField[];
}

export interface KGField {
  name: string;
  type: string;
  required?: boolean;
}

export interface KGInstance {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KGRecord {
  id: string;
  instanceId: string;
  nodeType: string;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface KGEdge {
  id: string;
  instanceId: string;
  edgeType: string;
  sourceId: string;
  targetId: string;
  data?: Record<string, unknown>;
  createdAt?: string;
}

export interface CreateKGInstanceTemplateRequest {
  name: string;
  description?: string;
  nodeTypes: KGNodeType[];
  edgeTypes: KGEdgeType[];
}

export interface UpdateKGInstanceTemplateRequest {
  name?: string;
  description?: string;
  nodeTypes?: KGNodeType[];
  edgeTypes?: KGEdgeType[];
}

export interface CreateKGInstanceRequest {
  templateId: string;
  name: string;
  description?: string;
}

export interface CreateKGRecordRequest {
  nodeType: string;
  data: Record<string, unknown>;
}

export interface UpdateKGRecordRequest {
  data: Record<string, unknown>;
}

export interface CreateKGEdgeRequest {
  edgeType: string;
  sourceId: string;
  targetId: string;
  data?: Record<string, unknown>;
}

export interface KGViewTemplate {
  id: string;
  name: string;
  description?: string;
  query: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKGViewTemplateRequest {
  name: string;
  description?: string;
  query: Record<string, unknown>;
}

export interface UpdateKGViewTemplateRequest {
  name?: string;
  description?: string;
  query?: Record<string, unknown>;
}

export interface KGView {
  id: string;
  templateId?: string;
  name: string;
  config: Record<string, unknown>;
}

export interface CreateKGViewRequest {
  templateId?: string;
  name: string;
  config: Record<string, unknown>;
}

export interface KGSubgraphParams {
  nodeId?: string;
  depth?: number;
  nodeTypes?: string[];
}

export interface ExpandNodeRequest {
  nodeId: string;
  depth?: number;
  edgeTypes?: string[];
}
