import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';


/**
 * Compute the Claude project directory name.
 * Claude stores sessions at: ~/.claude/projects/<dir-name>/<session>.jsonl
 * The dir name is the absolute path with '/' replaced by '-'.
 * e.g. /Users/foo/project -> -Users-foo-project
 */
export function computeClaudeProjectDirName(projectPath: string): string {
    const normalized = path.resolve(projectPath);
    return normalized.replace(/\//g, '-');
}

/**
 * Find the Claude projects directory for a given project path.
 */
export function findClaudeProjectDir(projectPath: string): string | null {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(claudeDir)) return null;

    const normalized = path.resolve(projectPath);
    const dirName = computeClaudeProjectDirName(normalized);
    const projectDir = path.join(claudeDir, dirName);

    if (fs.existsSync(projectDir)) return projectDir;

    return null;
}

/**
 * Find the most recently modified .jsonl session file in a project directory.
 */
export function findLatestSessionFile(projectDir: string): string | null {
    try {
        const files = fs.readdirSync(projectDir)
            .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'))
            .map(f => ({
                name: f,
                path: path.join(projectDir, f),
                mtime: fs.statSync(path.join(projectDir, f)).mtimeMs,
            }))
            .sort((a, b) => b.mtime - a.mtime);

        return files.length > 0 ? files[0].path : null;
    } catch {
        return null;
    }
}

export type JsonlEntryCallback = (entry: any) => void;

/**
 * Watch a JSONL file for new lines appended to it.
 * Returns a cleanup function to stop watching.
 */
export function watchJsonlFile(
    filePath: string,
    onEntry: JsonlEntryCallback
): () => void {
    let currentSize = 0;
    let lineBuffer = '';

    // Read existing size to skip already-written content
    try {
        const stat = fs.statSync(filePath);
        currentSize = stat.size;
    } catch {
        currentSize = 0;
    }

    const watcher = fs.watch(filePath, (eventType) => {
        if (eventType !== 'change') return;

        try {
            const stat = fs.statSync(filePath);
            if (stat.size <= currentSize) return;

            // Read only the new bytes
            const fd = fs.openSync(filePath, 'r');
            const newBytes = stat.size - currentSize;
            const buffer = Buffer.alloc(newBytes);
            fs.readSync(fd, buffer, 0, newBytes, currentSize);
            fs.closeSync(fd);

            currentSize = stat.size;

            // Parse new lines
            lineBuffer += buffer.toString('utf-8');
            const lines = lineBuffer.split('\n');
            lineBuffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                    const entry = JSON.parse(trimmed);
                    onEntry(entry);
                } catch (err) {
                    console.log('Failed to parse JSONL line:', trimmed.substring(0, 100));
                }
            }
        } catch (err) {
            // File might be temporarily unavailable
        }
    });

    return () => {
        watcher.close();
    };
}

/**
 * Wait for a JSONL file to appear at the expected path.
 * Polls the project directory for new .jsonl files.
 */
export function waitForSessionFile(
    projectDir: string,
    timeoutMs: number = 30000
): Promise<string> {
    return new Promise((resolve, reject) => {
        let existingFiles: Set<string>;
        try {
            existingFiles = new Set(
                fs.readdirSync(projectDir)
                    .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'))
            );
        } catch {
            existingFiles = new Set();
        }

        const startTime = Date.now();

        let dirWatcher: fs.FSWatcher | null = null;
        let pollInterval: NodeJS.Timeout | null = null;

        const cleanup = () => {
            if (dirWatcher) { dirWatcher.close(); dirWatcher = null; }
            if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        };

        const checkForNewFile = () => {
            try {
                const currentFiles = fs.readdirSync(projectDir)
                    .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));

                for (const file of currentFiles) {
                    if (!existingFiles.has(file)) {
                        cleanup();
                        resolve(path.join(projectDir, file));
                        return true;
                    }
                }
            } catch {
                // Directory might not exist yet
            }

            if (Date.now() - startTime > timeoutMs) {
                cleanup();
                const latest = findLatestSessionFile(projectDir);
                if (latest) {
                    resolve(latest);
                } else {
                    reject(new Error('Timeout waiting for session file'));
                }
                return true;
            }

            return false;
        };

        if (checkForNewFile()) return;

        pollInterval = setInterval(() => {
            checkForNewFile();
        }, 500);

        try {
            dirWatcher = fs.watch(projectDir, () => {
                checkForNewFile();
            });
        } catch {
            // Directory watch not supported, rely on polling
        }
    });
}
