import { promises as fs } from 'fs';
import * as path from 'path';

export interface LinearPluginConfig {
    apiKey: string;
    pollIntervalMs: number;
    enabled: boolean;
}

const DEFAULT_CONFIG: LinearPluginConfig = {
    apiKey: '',
    pollIntervalMs: 10000,
    enabled: true,
};

const CONFIG_FILENAME = 'config.json';

export async function loadConfig(pluginDir: string): Promise<LinearPluginConfig> {
    const filePath = path.join(pluginDir, CONFIG_FILENAME);
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
            apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : DEFAULT_CONFIG.apiKey,
            pollIntervalMs: typeof parsed.pollIntervalMs === 'number' && parsed.pollIntervalMs >= 1000
                ? parsed.pollIntervalMs
                : DEFAULT_CONFIG.pollIntervalMs,
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
        };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export async function saveConfig(pluginDir: string, config: LinearPluginConfig): Promise<void> {
    const filePath = path.join(pluginDir, CONFIG_FILENAME);
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
}
