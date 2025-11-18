/**
 * Plugin interface definitions for CodeBolt plugin system
 */

export interface PluginNodeMetadata {
  name: string;
  type: string;
  description: string;
  icon?: string;
  category?: string;
}

export interface PluginMetadata {
  displayName: string;
  description: string;
  category: string;
  version: string;
  author: string;
  nodes: PluginNodeMetadata[];
}

export interface PluginManifest {
  name: string;
  version: string;
  main: string;
  browser: string;
  codebolt: {
    plugin: PluginMetadata;
  };
  dependencies?: Record<string, string>;
}

export interface Plugin {
  manifest: PluginManifest;
  registerNodes: (LiteGraph: any) => void;
  registerHandlers?: (agentManager: any) => void;
}

export interface PluginHandler {
  execute(nodeData: any, inputData: any[]): any;
}

export interface PluginRegistry {
  [pluginName: string]: Plugin;
}

export interface PluginHandlerRegistry {
  [nodeType: string]: PluginHandler;
}