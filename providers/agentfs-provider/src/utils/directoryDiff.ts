import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import type { DiffFile, DiffResult } from '../interfaces/IProviderService.js';
import type { Logger } from './logger.js';

const execFileAsync = promisify(execFile);

interface DirectoryDiffOptions {
    parentPath: string;
    environmentPath: string;
    timeout: number;
    logger: Logger;
}

interface ComparedPath {
    path: string;
    status: DiffFile['status'];
}

export async function getDirectoryDiff(options: DirectoryDiffOptions): Promise<DiffResult> {
    const { parentPath, environmentPath, timeout, logger } = options;
    logger.log('Comparing environment directories:', { parentPath, environmentPath });

    const output = await runDiff(['-rq', parentPath, environmentPath], timeout);
    const comparedPaths = await expandDirectories(
        parseRecursiveDiff(output, parentPath, environmentPath),
        parentPath,
        environmentPath
    );
    const files = await Promise.all(comparedPaths.map(async (entry) => {
        const parentFile = path.join(parentPath, entry.path);
        const environmentFile = path.join(environmentPath, entry.path);
        const diff = await createUnifiedDiff(entry.status, parentFile, environmentFile, entry.path, timeout);
        const additions = (diff.match(/^\+(?!\+\+)/gm) ?? []).length;
        const deletions = (diff.match(/^-(?!--)/gm) ?? []).length;

        return {
            path: entry.path,
            status: entry.status,
            changes: { additions, deletions, changes: additions + deletions },
            diff,
        } satisfies DiffFile;
    }));

    const summary = {
        totalFiles: files.length,
        totalAdditions: files.reduce((total, file) => total + (file.changes?.additions ?? 0), 0),
        totalDeletions: files.reduce((total, file) => total + (file.changes?.deletions ?? 0), 0),
        totalChanges: files.reduce((total, file) => total + (file.changes?.changes ?? 0), 0),
    };

    return { files, summary, rawDiff: files.map((file) => file.diff).filter(Boolean).join('\n') };
}

async function runDiff(args: string[], timeout: number): Promise<string> {
    try {
        const { stdout } = await execFileAsync('diff', args, { timeout, maxBuffer: 20 * 1024 * 1024 });
        return stdout;
    } catch (error) {
        const diffError = error as NodeJS.ErrnoException & { code?: number | string; stdout?: string };
        // diff exits with 1 when differences are found. Only 2+ is an error.
        if ((diffError as { code?: number | string }).code === 1 && typeof diffError.stdout === 'string') {
            return diffError.stdout;
        }
        throw error;
    }
}

async function expandDirectories(
    entries: ComparedPath[],
    parentPath: string,
    environmentPath: string
): Promise<ComparedPath[]> {
    const expanded: ComparedPath[] = [];
    for (const entry of entries) {
        const root = entry.status === 'deleted' ? parentPath : environmentPath;
        const absolutePath = path.join(root, entry.path);
        const stats = await fs.stat(absolutePath).catch(() => null);
        if (!stats?.isDirectory()) {
            expanded.push(entry);
            continue;
        }
        await collectFiles(absolutePath, entry.path, entry.status, expanded);
    }
    return expanded.sort((a, b) => a.path.localeCompare(b.path));
}

async function collectFiles(
    absoluteDirectory: string,
    relativeDirectory: string,
    status: DiffFile['status'],
    output: ComparedPath[]
): Promise<void> {
    for (const child of await fs.readdir(absoluteDirectory, { withFileTypes: true })) {
        const absolutePath = path.join(absoluteDirectory, child.name);
        const relativePath = path.join(relativeDirectory, child.name);
        if (child.isDirectory()) {
            await collectFiles(absolutePath, relativePath, status, output);
        } else {
            output.push({ path: relativePath, status });
        }
    }
}

function parseRecursiveDiff(output: string, parentPath: string, environmentPath: string): ComparedPath[] {
    const results = new Map<string, ComparedPath>();
    for (const line of output.split('\n').filter(Boolean)) {
        const onlyMatch = line.match(/^Only in (.+): (.+)$/);
        if (onlyMatch) {
            const [, directory, name] = onlyMatch;
            const absolutePath = path.join(directory, name);
            const inEnvironment = isWithin(environmentPath, absolutePath);
            const relativePath = path.relative(inEnvironment ? environmentPath : parentPath, absolutePath);
            results.set(relativePath, { path: relativePath, status: inEnvironment ? 'added' : 'deleted' });
            continue;
        }

        const differMatch = line.match(/^Files (.+) and (.+) differ$/);
        if (differMatch) {
            const relativePath = path.relative(parentPath, differMatch[1]);
            results.set(relativePath, { path: relativePath, status: 'modified' });
        }
    }
    return [...results.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function isWithin(root: string, candidate: string): boolean {
    const relative = path.relative(root, candidate);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function createUnifiedDiff(
    status: DiffFile['status'],
    parentFile: string,
    environmentFile: string,
    relativePath: string,
    timeout: number
): Promise<string> {
    const source = status === 'added' ? '/dev/null' : parentFile;
    const destination = status === 'deleted' ? '/dev/null' : environmentFile;
    const sourceStats = source === '/dev/null' ? null : await fs.stat(source).catch(() => null);
    const destinationStats = destination === '/dev/null' ? null : await fs.stat(destination).catch(() => null);
    if (sourceStats?.isDirectory() || destinationStats?.isDirectory()) {
        return '';
    }

    const body = await runDiff([
        '-u',
        '--label', `a/${relativePath}`,
        '--label', `b/${relativePath}`,
        source,
        destination,
    ], timeout);
    if (!body) return '';
    return `diff --git a/${relativePath} b/${relativePath}\n${body}`;
}
