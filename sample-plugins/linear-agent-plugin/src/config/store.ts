import { promises as fs } from 'fs';
import * as path from 'path';

export interface LinearPluginConfig {
    workerUrl: string;
    appToken: string;
    accessToken: string;
    enabled: boolean;
    reconnectIntervalMs: number;
}

const DEFAULT_CONFIG: LinearPluginConfig = {
    workerUrl: 'wss://linear-agent-worker.arrowai.workers.dev',
    appToken: '',
    accessToken: '',
    enabled: true,
    reconnectIntervalMs: 5000,
};

const CONFIG_FILENAME = 'config.json';

export async function loadConfig(pluginDir: string): Promise<LinearPluginConfig> {
    const filePath = path.join(pluginDir, CONFIG_FILENAME);
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
            workerUrl: typeof parsed.workerUrl === 'string' ? parsed.workerUrl : DEFAULT_CONFIG.workerUrl,
            appToken: typeof parsed.appToken === 'string' ? parsed.appToken : DEFAULT_CONFIG.appToken,
            accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : DEFAULT_CONFIG.accessToken,
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
            reconnectIntervalMs:
                typeof parsed.reconnectIntervalMs === 'number' && parsed.reconnectIntervalMs >= 1000
                    ? parsed.reconnectIntervalMs
                    : DEFAULT_CONFIG.reconnectIntervalMs,
        };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export async function saveConfig(pluginDir: string, config: LinearPluginConfig): Promise<void> {
    const filePath = path.join(pluginDir, CONFIG_FILENAME);
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
}
