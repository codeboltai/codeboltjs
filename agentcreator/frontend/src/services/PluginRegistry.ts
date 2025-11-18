import { Plugin, PluginNodeMetadata, PluginHandlerRegistry } from '../../../shared-nodes/src/types';
import PluginLoader from './PluginLoader';

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, Plugin> = new Map();
  private nodeMetadata: Map<string, PluginNodeMetadata> = new Map();
  private pluginLoader: PluginLoader;

  private constructor() {
    this.pluginLoader = PluginLoader.getInstance();
  }

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Initialize the registry and load all plugins
   */
  async initialize(): Promise<void> {
    const plugins = await this.pluginLoader.loadPlugins();

    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }

    console.log(`PluginRegistry initialized with ${this.plugins.size} plugins`);
  }

  /**
   * Register a plugin in the registry
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.manifest.name, plugin);

    // Register node metadata
    for (const nodeMetadata of plugin.manifest.codebolt.plugin.nodes) {
      this.nodeMetadata.set(nodeMetadata.type, nodeMetadata);
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all node metadata from all plugins
   */
  getAllNodeMetadata(): PluginNodeMetadata[] {
    return Array.from(this.nodeMetadata.values());
  }

  /**
   * Get node metadata by node type
   */
  getNodeMetadata(nodeType: string): PluginNodeMetadata | undefined {
    return this.nodeMetadata.get(nodeType);
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: string): PluginNodeMetadata[] {
    return Array.from(this.nodeMetadata.values()).filter(
      node => node.category === category
    );
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const plugin of this.plugins.values()) {
      categories.add(plugin.manifest.codebolt.plugin.category);
    }
    return Array.from(categories);
  }

  /**
   * Check if a node type is from a plugin
   */
  isPluginNode(nodeType: string): boolean {
    return this.nodeMetadata.has(nodeType);
  }

  /**
   * Get plugin name by node type
   */
  getPluginNameByNodeType(nodeType: string): string | undefined {
    const nodeMetadata = this.nodeMetadata.get(nodeType);
    if (!nodeMetadata) return undefined;

    for (const [pluginName, plugin] of this.plugins) {
      if (plugin.manifest.codebolt.plugin.nodes.some(node => node.type === nodeType)) {
        return pluginName;
      }
    }
    return undefined;
  }

  /**
   * Register plugin nodes with LiteGraph
   */
  async registerNodesWithLiteGraph(LiteGraph: any): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.registerNodes(LiteGraph);
        console.log(`Registered nodes for plugin: ${plugin.manifest.codebolt.plugin.displayName}`);
      } catch (error) {
        console.error(`Failed to register nodes for plugin ${plugin.manifest.name}:`, error);
      }
    }
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    totalPlugins: number;
    totalNodes: number;
    categories: string[];
  } {
    const categories = this.getCategories();
    return {
      totalPlugins: this.plugins.size,
      totalNodes: this.nodeMetadata.size,
      categories
    };
  }
}

export default PluginRegistry;