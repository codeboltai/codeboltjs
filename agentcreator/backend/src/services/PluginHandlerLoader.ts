import { Plugin, PluginManifest, PluginHandlerRegistry } from '@codebolt/agent-shared-nodes';
import * as fs from 'fs';
import * as path from 'path';

export class PluginHandlerLoader {
  private static instance: PluginHandlerLoader;
  private plugins: Map<string, Plugin> = new Map();
  private handlers: PluginHandlerRegistry = {};
  private readonly CUSTOM_NODES_PATH = path.join(process.cwd(), 'agentcreator', 'customnodes');

  private constructor() { }

  static getInstance(): PluginHandlerLoader {
    if (!PluginHandlerLoader.instance) {
      PluginHandlerLoader.instance = new PluginHandlerLoader();
    }
    return PluginHandlerLoader.instance;
  }

  /**
   * Scan customnodes directory and load all plugin handlers
   */
  async loadPlugins(): Promise<Plugin[]> {
    try {
      const pluginDirs = await this.scanCustomNodesDirectory();
      const loadedPlugins: Plugin[] = [];

      for (const pluginDir of pluginDirs) {
        try {
          const plugin = await this.loadPlugin(pluginDir);
          if (plugin) {
            this.plugins.set(plugin.manifest.name, plugin);
            loadedPlugins.push(plugin);
            console.log(`Loaded plugin handlers: ${plugin.manifest.codebolt.plugin.displayName}`);
          }
        } catch (error) {
          console.error(`Failed to load plugin handlers from ${pluginDir}:`, error);
        }
      }

      return loadedPlugins;
    } catch (error) {
      console.error('Failed to load plugin handlers:', error);
      return [];
    }
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): Map<string, Plugin> {
    return new Map(this.plugins);
  }

  /**
   * Get handler for a specific node type
   */
  getHandler(nodeType: string): any {
    return this.handlers[nodeType];
  }

  /**
   * Register handlers for a plugin
   */
  async registerPluginHandlers(plugin: Plugin): Promise<void> {
    if (!plugin.registerHandlers) {
      console.warn(`Plugin ${plugin.manifest.name} does not have registerHandlers function`);
      return;
    }

    try {
      // Create a mock agentManager for registration
      const mockAgentManager = {
        registerHandler: (nodeType: string, handler: any) => {
          this.handlers[nodeType] = handler;
          console.log(`Registered handler for node type: ${nodeType}`);
        }
      };

      await plugin.registerHandlers(mockAgentManager);
    } catch (error) {
      console.error(`Failed to register handlers for plugin ${plugin.manifest.name}:`, error);
    }
  }

  /**
   * Scan customnodes directory for plugin directories
   */
  private async scanCustomNodesDirectory(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.CUSTOM_NODES_PATH)) {
        console.warn(`Custom nodes directory not found: ${this.CUSTOM_NODES_PATH}`);
        return [];
      }

      const entries = fs.readdirSync(this.CUSTOM_NODES_PATH, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(dir => {
          const packageJsonPath = path.join(this.CUSTOM_NODES_PATH, dir, 'package.json');
          return fs.existsSync(packageJsonPath);
        });
    } catch (error) {
      console.error('Failed to scan custom nodes directory:', error);
      return [];
    }
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

      // Load backend module
      const backendModule = await this.loadBackendModule(pluginDir, manifest);
      if (!backendModule) {
        console.warn(`Plugin ${pluginDir} missing backend module`);
        return null;
      }

      return {
        manifest,
        registerNodes: backendModule.registerNodes || (() => { }),
        registerHandlers: backendModule.registerHandlers
      };
    } catch (error) {
      console.error(`Error loading plugin handlers ${pluginDir}:`, error);
      return null;
    }
  }

  /**
   * Load plugin manifest (package.json)
   */
  private async loadPluginManifest(pluginDir: string): Promise<PluginManifest | null> {
    try {
      const packageJsonPath = path.join(this.CUSTOM_NODES_PATH, pluginDir, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        console.error(`Package.json not found for plugin: ${pluginDir}`);
        return null;
      }

      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const manifest = JSON.parse(packageJsonContent);

      return manifest;
    } catch (error) {
      console.error(`Failed to load manifest for ${pluginDir}:`, error);
      return null;
    }
  }

  /**
   * Load backend module for plugin
   */
  private async loadBackendModule(pluginDir: string, manifest: PluginManifest): Promise<any> {
    try {
      // Try to load from dist directory first, then fallback to source
      const distPath = path.join(this.CUSTOM_NODES_PATH, pluginDir, 'dist', 'backend.js');
      const srcPath = path.join(this.CUSTOM_NODES_PATH, pluginDir, 'src', 'backend', 'index.ts');

      let modulePath: string;
      if (fs.existsSync(distPath)) {
        modulePath = distPath;
      } else if (fs.existsSync(srcPath)) {
        modulePath = srcPath;
      } else {
        throw new Error(`Neither dist/backend.js nor src/backend/index.ts found for plugin ${pluginDir}`);
      }

      // Dynamic import of the backend module
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load backend module for ${pluginDir}:`, error);
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

  /**
   * Get all registered handlers
   */
  getAllHandlers(): PluginHandlerRegistry {
    return { ...this.handlers };
  }

  /**
   * Check if a handler exists for a node type
   */
  hasHandler(nodeType: string): boolean {
    return nodeType in this.handlers;
  }

  /**
   * Execute a node using its handler
   */
  async executeNode(nodeType: string, nodeData: any, inputData: any[]): Promise<any> {
    const handler = this.handlers[nodeType];
    if (!handler) {
      throw new Error(`No handler found for node type: ${nodeType}`);
    }

    try {
      if (typeof handler === 'function') {
        return await handler(nodeData, inputData);
      } else if (typeof handler === 'object' && handler !== null && 'execute' in handler) {
        return await handler.execute(nodeData, inputData);
      } else {
        throw new Error(`Invalid handler for node type: ${nodeType}`);
      }
    } catch (error) {
      console.error(`Error executing node ${nodeType}:`, error);
      throw error;
    }
  }
}

export default PluginHandlerLoader;