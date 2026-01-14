/**
 * PermissionManager - Centralized permission management system
 * 
 * Based on gemini-cli's permission handling patterns:
 * - Persistent storage of granted permissions
 * - Hierarchical permission scopes (agent, tool, resource)
 * - Policy-based permission rules
 * - Trust-based folder permissions
 * - Session-level and persistent permissions
 */

import { promises as fs } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { logger } from '../main/utils/logger';

export interface PermissionScope {
  /** Tool name or '*' for all tools */
  toolName: string;
  /** Resource path or pattern */
  resourcePath: string;
  /** Permission type */
  permissionType: 'read' | 'write' | 'execute' | 'all';
}

export interface PermissionRule {
  /** Unique rule ID */
  id: string;
  /** Rule priority (higher = more important) */
  priority: number;
  /** Rule decision */
  decision: 'allow' | 'deny' | 'ask';
  /** Scope pattern */
  scope: Partial<PermissionScope>;
  /** Expiration timestamp (optional) */
  expiresAt?: number;
  /** Created timestamp */
  createdAt: number;
  /** Last used timestamp */
  lastUsedAt?: number;
}

export interface PermissionPolicy {
  /** Policy name */
  name: string;
  /** Policy rules */
  rules: PermissionRule[];
  /** Default decision for unmatched requests */
  defaultDecision: 'allow' | 'deny' | 'ask';
  /** Policy enabled flag */
  enabled: boolean;
}

export interface TrustedFolder {
  /** Folder path */
  path: string;
  /** Trust level */
  trustLevel: 'full' | 'limited' | 'none';
  /** Trusted timestamp */
  trustedAt: number;
  /** Trusted by user */
  trustedBy: string;
}

export interface PermissionStorage {
  /** Granted permissions */
  grantedPermissions: Map<string, PermissionRule>;
  /** Trusted folders */
  trustedFolders: Map<string, TrustedFolder>;
  /** Session permissions (temporary) */
  sessionPermissions: Map<string, PermissionRule>;
  /** Policies */
  policies: Map<string, PermissionPolicy>;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private storage: PermissionStorage;
  private storagePath: string;
  private isInitialized = false;

  private constructor() {
    this.storage = {
      grantedPermissions: new Map(),
      trustedFolders: new Map(),
      sessionPermissions: new Map(),
      policies: new Map(),
    };
    
    // Use ~/.codebolt/permissions.json for persistent storage
    const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
    this.storagePath = join(homeDir, '.codebolt', 'permissions.json');
  }

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Initialize the permission manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.loadPermissions();
      await this.setupDefaultPolicies();
      this.isInitialized = true;
      logger.info('PermissionManager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize PermissionManager: ${error}`);
      // Continue with empty permissions
      this.isInitialized = true;
    }
  }

  /**
   * Check if a permission is granted
   */
  public hasPermission(scope: PermissionScope): boolean {
    const key = this.createPermissionKey(scope);
    
    // Check session permissions first (highest priority)
    if (this.storage.sessionPermissions.has(key)) {
      const rule = this.storage.sessionPermissions.get(key)!;
      if (this.isRuleValid(rule)) {
        this.updateLastUsed(rule);
        return rule.decision === 'allow';
      }
    }

    // Check granted permissions
    if (this.storage.grantedPermissions.has(key)) {
      const rule = this.storage.grantedPermissions.get(key)!;
      if (this.isRuleValid(rule)) {
        this.updateLastUsed(rule);
        return rule.decision === 'allow';
      }
    }

    // Check policy rules
    return this.evaluatePolicies(scope);
  }

  /**
   * Grant a permission
   */
  public grantPermission(scope: PermissionScope, persistent = true): void {
    const rule: PermissionRule = {
      id: this.generateRuleId(),
      priority: 100,
      decision: 'allow',
      scope,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    const key = this.createPermissionKey(scope);
    
    if (persistent) {
      this.storage.grantedPermissions.set(key, rule);
      this.savePermissions();
    } else {
      this.storage.sessionPermissions.set(key, rule);
    }

    logger.info(`Permission granted: ${key}`);
  }

  /**
   * Revoke a permission
   */
  public revokePermission(scope: PermissionScope): void {
    const key = this.createPermissionKey(scope);
    
    this.storage.grantedPermissions.delete(key);
    this.storage.sessionPermissions.delete(key);
    this.savePermissions();

    logger.info(`Permission revoked: ${key}`);
  }

  /**
   * Grant permission for a folder (trust-based)
   */
  public grantFolderTrust(folderPath: string, trustLevel: TrustedFolder['trustLevel'], trustedBy: string): void {
    const trustedFolder: TrustedFolder = {
      path: resolve(folderPath),
      trustLevel,
      trustedAt: Date.now(),
      trustedBy,
    };

    this.storage.trustedFolders.set(folderPath, trustedFolder);
    this.savePermissions();

    logger.info(`Folder trust granted: ${folderPath} (${trustLevel})`);
  }

  /**
   * Check if a folder is trusted
   */
  public isFolderTrusted(folderPath: string): boolean {
    const resolvedPath = resolve(folderPath);
    
    // Check exact match
    if (this.storage.trustedFolders.has(resolvedPath)) {
      return this.storage.trustedFolders.get(resolvedPath)!.trustLevel !== 'none';
    }

    // Check parent folder trust
    let currentPath = dirname(resolvedPath);
    while (currentPath !== dirname(currentPath)) {
      if (this.storage.trustedFolders.has(currentPath)) {
        const trust = this.storage.trustedFolders.get(currentPath)!;
        return trust.trustLevel === 'full';
      }
      currentPath = dirname(currentPath);
    }

    return false;
  }

  /**
   * Add a permission policy
   */
  public addPolicy(policy: PermissionPolicy): void {
    this.storage.policies.set(policy.name, policy);
    this.savePermissions();
    logger.info(`Policy added: ${policy.name}`);
  }

  /**
   * Remove a permission policy
   */
  public removePolicy(policyName: string): void {
    this.storage.policies.delete(policyName);
    this.savePermissions();
    logger.info(`Policy removed: ${policyName}`);
  }

  /**
   * Get all granted permissions
   */
  public getAllPermissions(): PermissionRule[] {
    return Array.from(this.storage.grantedPermissions.values());
  }

  /**
   * Get all trusted folders
   */
  public getAllTrustedFolders(): TrustedFolder[] {
    return Array.from(this.storage.trustedFolders.values());
  }

  /**
   * Clear all permissions (use with caution)
   */
  public clearAllPermissions(): void {
    this.storage.grantedPermissions.clear();
    this.storage.sessionPermissions.clear();
    this.savePermissions();
    logger.warn('All permissions cleared');
  }

  /**
   * Clear session permissions
   */
  public clearSessionPermissions(): void {
    this.storage.sessionPermissions.clear();
    logger.info('Session permissions cleared');
  }

  /**
   * Create permission key from scope
   */
  private createPermissionKey(scope: PermissionScope): string {
    return `${scope.toolName}:${scope.resourcePath}:${scope.permissionType}`;
  }

  /**
   * Generate unique rule ID
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if a rule is still valid
   */
  private isRuleValid(rule: PermissionRule): boolean {
    if (rule.expiresAt && Date.now() > rule.expiresAt) {
      return false;
    }
    return true;
  }

  /**
   * Update last used timestamp
   */
  private updateLastUsed(rule: PermissionRule): void {
    rule.lastUsedAt = Date.now();
  }

  /**
   * Evaluate policies for a scope
   */
  private evaluatePolicies(scope: PermissionScope): boolean {
    const applicableRules: PermissionRule[] = [];

    // Collect all applicable rules from policies
    for (const policy of this.storage.policies.values()) {
      if (!policy.enabled) continue;

      for (const rule of policy.rules) {
        if (this.scopeMatches(scope, rule.scope)) {
          applicableRules.push(rule);
        }
      }
    }

    // Sort by priority (highest first)
    applicableRules.sort((a, b) => b.priority - a.priority);

    // Apply first matching rule
    if (applicableRules.length > 0) {
      const rule = applicableRules[0];
      this.updateLastUsed(rule);
      return rule.decision === 'allow';
    }

    // Return default decision
    return true; // Default to allow for now
  }

  /**
   * Check if scope matches rule scope pattern
   */
  private scopeMatches(scope: PermissionScope, ruleScope: Partial<PermissionScope>): boolean {
    if (ruleScope.toolName && ruleScope.toolName !== '*' && ruleScope.toolName !== scope.toolName) {
      return false;
    }
    if (ruleScope.resourcePath && ruleScope.resourcePath !== '*' && !scope.resourcePath.includes(ruleScope.resourcePath)) {
      return false;
    }
    if (ruleScope.permissionType && ruleScope.permissionType !== 'all' && ruleScope.permissionType !== scope.permissionType) {
      return false;
    }
    return true;
  }

  /**
   * Load permissions from storage
   */
  private async loadPermissions(): Promise<void> {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      const parsed = JSON.parse(data);

      // Restore granted permissions
      if (parsed.grantedPermissions) {
        for (const [key, rule] of Object.entries(parsed.grantedPermissions)) {
          this.storage.grantedPermissions.set(key, rule as PermissionRule);
        }
      }

      // Restore trusted folders
      if (parsed.trustedFolders) {
        for (const [path, folder] of Object.entries(parsed.trustedFolders)) {
          this.storage.trustedFolders.set(path, folder as TrustedFolder);
        }
      }

      // Restore policies
      if (parsed.policies) {
        for (const [name, policy] of Object.entries(parsed.policies)) {
          this.storage.policies.set(name, policy as PermissionPolicy);
        }
      }

      logger.info(`Loaded ${this.storage.grantedPermissions.size} permissions, ${this.storage.trustedFolders.size} trusted folders, ${this.storage.policies.size} policies`);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty permissions
      logger.info('No existing permissions file found, starting fresh');
    }
  }

  /**
   * Save permissions to storage
   */
  private async savePermissions(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });

      const data = {
        grantedPermissions: Object.fromEntries(this.storage.grantedPermissions),
        trustedFolders: Object.fromEntries(this.storage.trustedFolders),
        policies: Object.fromEntries(this.storage.policies),
        lastSaved: Date.now(),
      };

      await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error(`Failed to save permissions: ${error}`);
    }
  }

  /**
   * Setup default policies
   */
  private async setupDefaultPolicies(): Promise<void> {
    // Read-only tools policy
    const readOnlyPolicy: PermissionPolicy = {
      name: 'read-only-tools',
      enabled: true,
      defaultDecision: 'allow',
      rules: [
        {
          id: 'read-file-allow',
          priority: 50,
          decision: 'allow',
          scope: { toolName: 'read_file', permissionType: 'read' },
          createdAt: Date.now(),
        },
        {
          id: 'list-directory-allow',
          priority: 50,
          decision: 'allow',
          scope: { toolName: 'list_directory', permissionType: 'read' },
          createdAt: Date.now(),
        },
        {
          id: 'search-content-allow',
          priority: 50,
          decision: 'allow',
          scope: { toolName: 'search_file_content', permissionType: 'read' },
          createdAt: Date.now(),
        },
        {
          id: 'glob-search-allow',
          priority: 50,
          decision: 'allow',
          scope: { toolName: 'glob', permissionType: 'read' },
          createdAt: Date.now(),
        },
      ],
    };

    // Write tools policy
    const writeToolsPolicy: PermissionPolicy = {
      name: 'write-tools',
      enabled: true,
      defaultDecision: 'ask',
      rules: [
        {
          id: 'write-file-ask',
          priority: 10,
          decision: 'ask',
          scope: { toolName: 'write_file', permissionType: 'write' },
          createdAt: Date.now(),
        },
        {
          id: 'replace-content-ask',
          priority: 10,
          decision: 'ask',
          scope: { toolName: 'replace', permissionType: 'write' },
          createdAt: Date.now(),
        },
      ],
    };

    // Execute tools policy
    const executeToolsPolicy: PermissionPolicy = {
      name: 'execute-tools',
      enabled: true,
      defaultDecision: 'ask',
      rules: [
        {
          id: 'execute-command-ask',
          priority: 10,
          decision: 'ask',
          scope: { toolName: 'execute_command', permissionType: 'execute' },
          createdAt: Date.now(),
        },
      ],
    };

    this.storage.policies.set('read-only-tools', readOnlyPolicy);
    this.storage.policies.set('write-tools', writeToolsPolicy);
    this.storage.policies.set('execute-tools', executeToolsPolicy);
  }
}

/**
 * Convenience functions for common permission operations
 */
export const PermissionUtils = {
  /**
   * Check if permission exists for a specific tool and resource
   */
  hasPermission(toolName: string, resourcePath: string, permissionType: PermissionScope['permissionType']): boolean {
    const manager = PermissionManager.getInstance();
    return manager.hasPermission({ toolName, resourcePath, permissionType });
  },

  /**
   * Grant permission for a specific tool and resource
   */
  grantPermission(toolName: string, resourcePath: string, permissionType: PermissionScope['permissionType'], persistent = true): void {
    const manager = PermissionManager.getInstance();
    manager.grantPermission({ toolName, resourcePath, permissionType }, persistent);
  },

  /**
   * Revoke permission for a specific tool and resource
   */
  revokePermission(toolName: string, resourcePath: string, permissionType: PermissionScope['permissionType']): void {
    const manager = PermissionManager.getInstance();
    manager.revokePermission({ toolName, resourcePath, permissionType });
  },

  /**
   * Check if folder is trusted
   */
  isFolderTrusted(folderPath: string): boolean {
    const manager = PermissionManager.getInstance();
    return manager.isFolderTrusted(folderPath);
  },

  /**
   * Grant trust to a folder
   */
  grantFolderTrust(folderPath: string, trustLevel: TrustedFolder['trustLevel'] = 'full', trustedBy = 'user'): void {
    const manager = PermissionManager.getInstance();
    manager.grantFolderTrust(folderPath, trustLevel, trustedBy);
  },

  /**
   * Get all permissions
   */
  getAllPermissions(): PermissionRule[] {
    const manager = PermissionManager.getInstance();
    return manager.getAllPermissions();
  },

  /**
   * Clear all permissions (use with caution)
   */
  clearAllPermissions(): void {
    const manager = PermissionManager.getInstance();
    manager.clearAllPermissions();
  },

  /**
   * Clear session permissions
   */
  clearSessionPermissions(): void {
    const manager = PermissionManager.getInstance();
    manager.clearSessionPermissions();
  },
};
