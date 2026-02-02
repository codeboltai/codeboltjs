import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { logger } from '../../main/utils/logger';
import { getServerConfig } from '../../main/config/config';
import {
    ActionBlock,
    ActionBlockType,
    ActionBlockConfig,
    ActionBlockMetadata,
    ActionBlockValidationResult
} from '../../types/sideExecution';

/**
 * ActionBlockRegistry - Discovers and manages ActionBlocks
 * Scans .codebolt/actionblocks directories for available ActionBlocks
 */
export class ActionBlockRegistry {
    private static instance: ActionBlockRegistry;
    private actionBlocks: Map<string, ActionBlock> = new Map();
    private initialized: boolean = false;
    private projectPath: string = '';

    private constructor() { }

    public static getInstance(): ActionBlockRegistry {
        if (!ActionBlockRegistry.instance) {
            ActionBlockRegistry.instance = new ActionBlockRegistry();
        }
        return ActionBlockRegistry.instance;
    }

    /**
     * Initialize the registry with a project path
     */
    async init(projectPath?: string): Promise<void> {
        const serverConfig = getServerConfig();
        // Prioritize server config project path -> passed projectPath -> process.cwd()
        this.projectPath = serverConfig.projectPath || projectPath || process.cwd();

        await this.discoverActionBlocks(this.projectPath);
        this.initialized = true;
        logger.info(`[ActionBlockRegistry] Initialized with project path: ${this.projectPath}`);
    }

    /**
     * Check if registry is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Discover ActionBlocks from filesystem
     * Searches in .codebolt/actionblocks directory
     */
    async discoverActionBlocks(searchPath?: string): Promise<void> {
        const serverConfig = getServerConfig();
        // Prioritize searchPath > serverConfig.projectPath > this.projectPath > process.cwd()
        const basePath = searchPath || serverConfig.projectPath || this.projectPath || process.cwd();
        const actionBlocksDir = path.join(basePath, '.codebolt', 'actionblocks');

        logger.info(`[ActionBlockRegistry] Discovering ActionBlocks in: ${actionBlocksDir}`);

        if (!fs.existsSync(actionBlocksDir)) {
            logger.info(`[ActionBlockRegistry] ActionBlocks directory not found: ${actionBlocksDir}`);
            return;
        }

        try {
            const entries = fs.readdirSync(actionBlocksDir, { withFileTypes: true });
            logger.info(`[ActionBlockRegistry] Found ${entries.length} entries in ${actionBlocksDir}`);

            for (const entry of entries) {
                logger.info(`[ActionBlockRegistry] Checking entry: ${entry.name} (isDirectory: ${entry.isDirectory()})`);
                if (entry.isDirectory()) {
                    const actionBlockPath = path.join(actionBlocksDir, entry.name);
                    await this.loadActionBlock(actionBlockPath, 'project');
                }
            }

            logger.info(`[ActionBlockRegistry] Discovered ${this.actionBlocks.size} ActionBlocks`);
            // List them for debugging
            this.actionBlocks.forEach((v, k) => logger.info(`[ActionBlockRegistry] Registered: ${k} -> ${v.path}`));

        } catch (error) {
            logger.error(`[ActionBlockRegistry] Error discovering ActionBlocks: ${error}`);
        }
    }

    /**
     * Load an ActionBlock from a directory
     */
    private async loadActionBlock(
        actionBlockPath: string,
        source: 'builtin' | 'global' | 'project'
    ): Promise<ActionBlock | null> {
        logger.info(`[ActionBlockRegistry] Attempting to load ActionBlock from: ${actionBlockPath}`);
        const configPath = path.join(actionBlockPath, 'actionblock.yml');
        let configFile = configPath;

        if (!fs.existsSync(configPath)) {
            // Try .yml extension
            const altConfigPath = path.join(actionBlockPath, 'actionblock.yml');
            if (!fs.existsSync(altConfigPath)) {
                logger.warn(`[ActionBlockRegistry] No config found for: ${actionBlockPath}`);
                return null;
            }
            configFile = altConfigPath;
        }

        try {
            const configContent = fs.readFileSync(configFile, 'utf-8');
            const config = yaml.load(configContent) as ActionBlockConfig;

            const actionBlock: ActionBlock = {
                id: `${source}_${config.name}_${Date.now()}`,
                name: config.name,
                description: config.description || '',
                version: config.version || '1.0.0',
                entryPoint: config.entryPoint || 'dist/index.js',
                path: actionBlockPath,
                type: ActionBlockType.FILESYSTEM,
                metadata: {
                    ...config.metadata,
                    source
                }
            };

            this.actionBlocks.set(config.name, actionBlock);
            logger.info(`[ActionBlockRegistry] Successfully loaded ActionBlock: ${config.name} (Source: ${source})`);

            return actionBlock;
        } catch (error) {
            logger.error(`[ActionBlockRegistry] Error loading ActionBlock from ${actionBlockPath}: ${error}`);
            return null;
        }
    }

    /**
     * Get an ActionBlock by name
     */
    getActionBlock(name: string): ActionBlock | undefined {
        const block = this.actionBlocks.get(name);
        if (block) {
            logger.debug(`[ActionBlockRegistry] getActionBlock found: ${name}`);
        } else {
            logger.warn(`[ActionBlockRegistry] getActionBlock FAILED to find: ${name}`);
            logger.debug(`[ActionBlockRegistry] Available ActionBlocks: ${Array.from(this.actionBlocks.keys()).join(', ')}`);
        }
        return block;
    }

    /**
     * Get an ActionBlock by filesystem path
     */
    getActionBlockByPath(actionBlockPath: string): ActionBlock | undefined {
        for (const actionBlock of this.actionBlocks.values()) {
            if (actionBlock.path === actionBlockPath) {
                return actionBlock;
            }
        }
        return undefined;
    }

    /**
     * List all registered ActionBlocks
     */
    listActionBlocks(): ActionBlock[] {
        return Array.from(this.actionBlocks.values());
    }

    /**
     * Validate an ActionBlock at a given path
     */
    validateActionBlock(actionBlockPath: string): ActionBlockValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check directory exists
        if (!fs.existsSync(actionBlockPath)) {
            errors.push(`ActionBlock directory not found: ${actionBlockPath}`);
            return { valid: false, errors, warnings };
        }

        // Check config file exists
        const configYaml = path.join(actionBlockPath, 'actionblock.yaml');
        const configYml = path.join(actionBlockPath, 'actionblock.yml');

        if (!fs.existsSync(configYaml) && !fs.existsSync(configYml)) {
            errors.push('No actionblock.yaml or actionblock.yml config file found');
            return { valid: false, errors, warnings };
        }

        // Parse and validate config
        try {
            const configPath = fs.existsSync(configYaml) ? configYaml : configYml;
            const configContent = fs.readFileSync(configPath, 'utf-8');
            const config = yaml.load(configContent) as ActionBlockConfig;

            if (!config.name) {
                errors.push('Config missing required field: name');
            }

            if (!config.entryPoint) {
                warnings.push('Config missing entryPoint, will default to dist/index.js');
            }

            // Check entry point exists
            const entryPoint = config.entryPoint || 'dist/index.js';
            const entryPointPath = path.join(actionBlockPath, entryPoint);

            if (!fs.existsSync(entryPointPath)) {
                errors.push(`Entry point not found: ${entryPointPath}`);
            }
        } catch (error) {
            errors.push(`Error parsing config: ${error}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Clear all registered ActionBlocks
     */
    clear(): void {
        this.actionBlocks.clear();
        this.initialized = false;
        logger.info('[ActionBlockRegistry] Cleared all ActionBlocks');
    }

    /**
     * Get the current search path for ActionBlocks
     */
    getSearchPath(): string {
        const basePath = this.projectPath || process.cwd();
        return path.join(basePath, '.codebolt', 'actionblocks');
    }
}

// Export singleton instance
export const actionBlockRegistry = ActionBlockRegistry.getInstance();
export default actionBlockRegistry;
