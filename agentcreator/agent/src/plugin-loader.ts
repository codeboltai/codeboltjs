import { readdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LiteGraph } from '@codebolt/litegraph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load and execute plugin backend modules
 */
export async function loadPluginBackends() {
    const customnodesPath = join(__dirname, '../../customnodes');

    if (!existsSync(customnodesPath)) {
        console.warn('Customnodes directory not found at:', customnodesPath);
        return;
    }

    const pluginDirs = readdirSync(customnodesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .filter(dirent => !dirent.name.startsWith('.') && dirent.name !== 'plugin-template')
        .map(dirent => dirent.name);

    console.log(`Found ${pluginDirs.length} plugin(s) to load:`, pluginDirs);

    for (const pluginDir of pluginDirs) {
        try {
            const packageJsonPath = join(customnodesPath, pluginDir, 'package.json');
            const backendPath = join(customnodesPath, pluginDir, 'dist/backend.js');

            if (!existsSync(packageJsonPath)) {
                console.warn(`Skipping ${pluginDir}: package.json not found`);
                continue;
            }

            if (!existsSync(backendPath)) {
                console.warn(`Skipping ${pluginDir}: dist/backend.js not found (run build:plugins)`);
                continue;
            }

            // Read plugin metadata
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            const pluginMetadata = packageJson.codebolt?.plugin;

            if (!pluginMetadata) {
                console.warn(`Skipping ${pluginDir}: missing codebolt.plugin metadata`);
                continue;
            }

            // Import the backend module
            const backendModule = await import(backendPath);

            if (!backendModule.registerNodes) {
                console.warn(`Skipping ${pluginDir}: missing registerNodes export`);
                continue;
            }

            // Call registerNodes with LiteGraph
            backendModule.registerNodes(LiteGraph);

            console.log(`✓ Loaded plugin backend: ${pluginMetadata.displayName} (${pluginDir})`);

        } catch (error) {
            console.error(`✗ Failed to load plugin ${pluginDir}:`, error.message);
        }
    }
}
