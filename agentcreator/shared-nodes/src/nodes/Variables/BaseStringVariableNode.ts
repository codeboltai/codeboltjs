import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

type VariableStore = Record<string, string>;

export abstract class BaseStringVariableNode extends LGraphNode {
  protected constructor(metadata: NodeMetadata) {
    super(metadata.title, metadata.type);
    this.title = metadata.title;
    this.addProperty("variable_name", "stringVar");
  }

  protected coerceToString(value: any): string {
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  }

  protected getVariableName(): string {
    const name = this.properties?.variable_name ?? "";
    return this.coerceToString(name).trim();
  }

  protected ensureVariableStore(): VariableStore | null {
    const graph: any = this.graph;
    if (!graph) {
      return null;
    }

    if (!graph.vars) {
      graph.vars = {};
    }

    return graph.vars as VariableStore;
  }

  protected readVariableValue(variableName?: string): string | undefined {
    const store = this.ensureVariableStore();
    const key = (variableName ?? this.getVariableName());
    if (!store || !key) {
      return undefined;
    }

    const value = store[key];
    if (value === undefined || value === null) {
      return undefined;
    }

    return this.coerceToString(value);
  }

  protected writeVariableValue(value: any, variableName?: string): string | undefined {
    const store = this.ensureVariableStore();
    const key = (variableName ?? this.getVariableName());
    if (!store || !key) {
      return undefined;
    }

    const normalized = this.coerceToString(value);
    store[key] = normalized;
    return normalized;
  }
}
