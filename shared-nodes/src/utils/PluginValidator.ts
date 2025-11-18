import { PluginManifest, PluginNodeMetadata } from '../types/PluginInterfaces';

export class PluginValidator {
  /**
   * Validate plugin manifest structure and content
   */
  static validateManifest(manifest: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest || typeof manifest !== 'object') {
      errors.push('Manifest must be a valid object');
      return { valid: false, errors };
    }

    // Required top-level fields
    const requiredFields = ['name', 'version', 'codebolt'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate name
    if (manifest.name && typeof manifest.name !== 'string') {
      errors.push('Plugin name must be a string');
    }

    // Validate version
    if (manifest.version && typeof manifest.version !== 'string') {
      errors.push('Plugin version must be a string');
    }

    // Validate codebolt.plugin structure
    if (!manifest.codebolt || !manifest.codebolt.plugin) {
      errors.push('Missing codebolt.plugin field');
      return { valid: false, errors };
    }

    const plugin = manifest.codebolt.plugin;
    const pluginRequiredFields = ['displayName', 'description', 'category', 'nodes'];
    for (const field of pluginRequiredFields) {
      if (!plugin[field]) {
        errors.push(`Missing required field: codebolt.plugin.${field}`);
      }
    }

    // Validate nodes array
    if (plugin.nodes && !Array.isArray(plugin.nodes)) {
      errors.push('codebolt.plugin.nodes must be an array');
    }

    // Validate each node
    if (Array.isArray(plugin.nodes)) {
      plugin.nodes.forEach((node: any, index: number) => {
        const nodeValidation = this.validateNodeMetadata(node);
        if (!nodeValidation.valid) {
          errors.push(`Node ${index}: ${nodeValidation.errors.join(', ')}`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate node metadata structure
   */
  static validateNodeMetadata(node: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!node || typeof node !== 'object') {
      errors.push('Node must be a valid object');
      return { valid: false, errors };
    }

    // Required node fields
    const requiredFields = ['name', 'type', 'description'];
    for (const field of requiredFields) {
      if (!node[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate node type format (should contain category/name)
    if (node.type && typeof node.type === 'string') {
      if (!node.type.includes('/')) {
        errors.push('Node type should be in format "category/name"');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Security validation for plugin code
   */
  static validateSecurity(pluginPath: string): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // This is a basic security check - in a real implementation,
    // you would scan the plugin code for dangerous patterns
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'require(',
      'import(',
      'process.',
      'global.',
      'fs.',
      'child_process.',
      'exec(',
      'spawn('
    ];

    // Note: In a real implementation, you would read the plugin files
    // and scan them for these patterns. For now, we'll just add a warning
    warnings.push('Security scanning not implemented - review plugin code manually');

    return { valid: warnings.length === 0, warnings };
  }

  /**
   * Check if plugin name is valid
   */
  static validatePluginName(name: string): boolean {
    // Plugin name should be a valid npm package name
    const nameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return nameRegex.test(name);
  }

  /**
   * Check if plugin version is valid semver
   */
  static validateVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?(\+[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$/;
    return semverRegex.test(version);
  }

  /**
   * Comprehensive plugin validation
   */
  static async validatePlugin(manifest: any, pluginPath: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate manifest
    const manifestValidation = this.validateManifest(manifest);
    errors.push(...manifestValidation.errors);

    // Validate plugin name
    if (manifest.name && !this.validatePluginName(manifest.name)) {
      errors.push('Invalid plugin name format');
    }

    // Validate version
    if (manifest.version && !this.validateVersion(manifest.version)) {
      warnings.push('Plugin version does not follow semver format');
    }

    // Security validation
    const securityValidation = this.validateSecurity(pluginPath);
    warnings.push(...securityValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}