import { Plugin, PluginManifest, PluginRegistry } from '../../../shared-nodes/src/types';

export class PluginLoader {
  private static instance: PluginLoader;
  private plugins: PluginRegistry = {};
  private readonly CUSTOM_NODES_PATH = 'http://localhost:3002/customnodes/';

  private constructor() { }

  static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  /**
   * Scan customnodes directory and load all plugins
   */
  async loadPlugins(): Promise<Plugin[]> {
    try {
      const pluginDirs = await this.scanCustomNodesDirectory();
      const loadedPlugins: Plugin[] = [];

      for (const pluginDir of pluginDirs) {
        try {
          const plugin = await this.loadPlugin(pluginDir);
          if (plugin) {
            this.plugins[plugin.manifest.name] = plugin;
            loadedPlugins.push(plugin);
            console.log(`Loaded plugin: ${plugin.manifest.codebolt.plugin.displayName}`);
          }
        } catch (error) {
          console.error(`Failed to load plugin from ${pluginDir}:`, error);
        }
      }

      return loadedPlugins;
    } catch (error) {
      console.error('Failed to load plugins:', error);
      return [];
    }
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): PluginRegistry {
    return { ...this.plugins };
  }

  /**
   * Get a specific plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins[name];
  }

  /**
   * Scan customnodes directory for plugin directories
   */
  private async scanCustomNodesDirectory(): Promise<string[]> {
    // For now, we'll simulate scanning by using a hardcoded list
    // In a real implementation, this would scan the filesystem
    const pluginDirs = [
      'enhanced-math',
      'text-processor',
      'and-logic'
    ];

    return pluginDirs;
  }

  /**
   * Load a single plugin from directory
   */
  private async loadPlugin(pluginDir: string): Promise<Plugin | null> {
    try {
      // Load manifest
      const manifest = await this.loadPluginManifest(pluginDir);
      if (!manifest) {
        return null;
      }

      // Validate manifest
      if (!this.validateManifest(manifest)) {
        return null;
      }

      // Load UI module
      const uiModule = await this.loadUIModule(pluginDir, manifest);
      if (!uiModule || !uiModule.registerNodes) {
        console.warn(`Plugin ${pluginDir} missing registerNodes function`);
        return null;
      }

      return {
        manifest,
        registerNodes: uiModule.registerNodes,
        registerHandlers: uiModule.registerHandlers
      };
    } catch (error) {
      console.error(`Error loading plugin ${pluginDir}:`, error);
      return null;
    }
  }

  /**
   * Load plugin manifest (package.json)
   */
  private async loadPluginManifest(pluginDir: string): Promise<PluginManifest | null> {
    try {
      // In development, we'll fetch the manifest via HTTP
      const response = await fetch(`${this.CUSTOM_NODES_PATH}${pluginDir}/package.json`);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load manifest for ${pluginDir}:`, error);
      return null;
    }
  }

  /**
   * Load UI module for plugin
   */
  private async loadUIModule(pluginDir: string, _manifest: PluginManifest): Promise<any> {
    try {
      const modulePath = `${this.CUSTOM_NODES_PATH}${pluginDir}/dist/ui.js`;

      // Dynamic import of the UI module
      const module = await import(/* @vite-ignore */ modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load UI module for ${pluginDir}:`, error);
      throw error;
    }
  }

  /**
   * Validate plugin manifest structure
   */
  private validateManifest(manifest: any): boolean {
    if (!manifest || typeof manifest !== 'object') {
      return false;
    }

    // Check required fields
    const requiredFields = ['name', 'version', 'codebolt'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        console.error(`Plugin manifest missing required field: ${field}`);
        return false;
      }
    }

    // Check codebolt.plugin structure
    if (!manifest.codebolt.plugin) {
      console.error('Plugin manifest missing codebolt.plugin field');
      return false;
    }

    const plugin = manifest.codebolt.plugin;
    const pluginRequiredFields = ['displayName', 'description', 'category', 'nodes'];
    for (const field of pluginRequiredFields) {
      if (!plugin[field]) {
        console.error(`Plugin manifest missing required field: codebolt.plugin.${field}`);
        return false;
      }
    }

    return true;
  }
}

export default PluginLoader;