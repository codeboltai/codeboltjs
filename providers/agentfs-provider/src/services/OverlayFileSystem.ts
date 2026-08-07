import { promises as hostFs } from 'node:fs';
import nodePath from 'node:path';
import type { Stats as NodeStats } from 'node:fs';
import type { Logger } from '../utils/logger.js';

/**
 * Prefix used for whiteout keys stored in the AgentFS KV store.
 * A whiteout marks a base-layer path (file or directory) as deleted
 * in the merged overlay view.
 */
const WHITEOUT_PREFIX = 'whiteout:';

/**
 * File statistics exposed to the provider service.
 * Mirrors the subset of Node.js / AgentFS Stats used downstream.
 */
export interface OverlayStats {
    size: number;
    mode: number;
    mtime: number;
    ctime: number;
    isFile(): boolean;
    isDirectory(): boolean;
}

/**
 * A directory entry with statistics, returned by readdirPlus.
 */
export interface OverlayDirEntry {
    name: string;
    stats: OverlayStats;
}

/**
 * The writable delta layer — the AgentFS SDK SQLite-backed filesystem.
 * Writes always land here; reads fall through to base on ENOENT.
 */
export interface DeltaFileSystem {
    writeFile(
        path: string,
        data: string | Buffer,
        options?: BufferEncoding | { encoding?: BufferEncoding }
    ): Promise<void>;
    readFile(path: string): Promise<Buffer>;
    readFile(path: string, encoding: BufferEncoding): Promise<string>;
    readdir(path: string): Promise<string[]>;
    readdirPlus(path: string): Promise<OverlayDirEntry[]>;
    stat(path: string): Promise<OverlayStats>;
    mkdir(path: string): Promise<void>;
    unlink(path: string): Promise<void>;
    rm(path: string, options?: { force?: boolean; recursive?: boolean }): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    access(path: string): Promise<void>;
    deleteFile(path: string): Promise<void>;
}

/**
 * Key-value store used to persist whiteouts across provider restarts.
 * Backed by the AgentFS SDK's KvStore (SQLite).
 */
export interface OverlayKvStore {
    set(key: string, value: unknown): Promise<void>;
    get<T = unknown>(key: string): Promise<T | undefined>;
    list(prefix: string): Promise<{ key: string; value: unknown }[]>;
    delete(key: string): Promise<void>;
}

export interface OverlayFileSystemOptions {
    /** Writable SQLite-backed delta filesystem (AgentFS SDK). */
    delta: DeltaFileSystem;
    /** KV store for persisting whiteouts. */
    kv: OverlayKvStore;
    /** Host directory whose contents form the read-only base layer. */
    baseProjectPath: string;
    /** Optional logger for debug tracing. */
    logger?: Logger;
}

/**
 * Returns true when the error is a POSIX ENOENT (no such file or directory).
 */
function isEnoentError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
    );
}

/**
 * Constructs an ENOENT error with Node-compatible properties so that
 * callers relying on `error.code` continue to work.
 */
function createEnoentError(
    agentPath: string,
    syscall = 'open'
): NodeJS.ErrnoException {
    const error = new Error(
        `ENOENT: no such file or directory, ${syscall} '${agentPath}'`
    ) as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    error.syscall = syscall;
    error.path = agentPath;
    return error;
}

/**
 * Returns the POSIX-style parent directory of a POSIX path.
 * posixDirname('/a/b') → '/a', posixDirname('/a') → '/', posixDirname('/') → '/'.
 */
function posixDirname(posixPath: string): string {
    const trimmed = posixPath.replace(/\/+$/, '');
    const lastSlashIndex = trimmed.lastIndexOf('/');
    if (lastSlashIndex <= 0) {
        return '/';
    }
    return trimmed.slice(0, lastSlashIndex);
}

/**
 * OverlayFileSystem — a copy-on-write layered filesystem.
 *
 * Layer model:
 * - **Delta** (read-write): AgentFS SQLite store. All writes land here.
 * - **Base** (read-only): the host project directory. Reads fall through
 *   to base when the delta layer returns ENOENT.
 *
 * Copy-on-write semantics:
 * - Reading a base file passes through transparently (no copy).
 * - Writing a file copies it into the delta; subsequent reads see the
 *   delta version.
 * - Deleting a file or directory records a *whiteout* in the KV store so
 *   the base-layer original stays hidden across restarts.
 *
 * This gives agents the experience of a writable copy of the project
 * without the disk/time cost of a full physical copy — implemented
 * entirely in TypeScript using the AgentFS SDK (no FUSE required).
 */
export class OverlayFileSystem {
    private readonly delta: DeltaFileSystem;
    private readonly kv: OverlayKvStore;
    private readonly baseProjectPath: string;
    private readonly logger?: Logger;

    /**
     * In-memory mirror of persisted whiteouts, loaded lazily from the KV
     * store and kept in sync on every mutation. Avoids a KV lookup per
     * read operation.
     */
    private whiteouts: Set<string> | null = null;

    constructor(options: OverlayFileSystemOptions) {
        this.delta = options.delta;
        this.kv = options.kv;
        this.baseProjectPath = nodePath.resolve(options.baseProjectPath);
        this.logger = options.logger;
    }

    // ---------------------------------------------------------------------------
    // Whiteout management
    // ---------------------------------------------------------------------------

    private whiteoutKey(agentPath: string): string {
        return `${WHITEOUT_PREFIX}${agentPath}`;
    }

    /**
     * Lazily load the whiteout set from the KV store (once), then serve
     * from memory for all subsequent checks.
     */
    private async getWhiteouts(): Promise<Set<string>> {
        if (this.whiteouts !== null) {
            return this.whiteouts;
        }
        const entries = await this.kv.list(WHITEOUT_PREFIX);
        const whiteoutSet = new Set<string>();
        for (const entry of entries) {
            whiteoutSet.add(entry.key.slice(WHITEOUT_PREFIX.length));
        }
        this.whiteouts = whiteoutSet;
        this.logger?.log(`OverlayFileSystem loaded ${whiteoutSet.size} whiteout(s) from base:`, this.baseProjectPath);
        return whiteoutSet;
    }

    /**
     * Record a whiteout for a path (marks the base-layer original as deleted).
     */
    private async recordWhiteout(agentPath: string): Promise<void> {
        const whiteouts = await this.getWhiteouts();
        if (whiteouts.has(agentPath)) {
            return;
        }
        whiteouts.add(agentPath);
        await this.kv.set(this.whiteoutKey(agentPath), true);
    }

    /**
     * Remove a whiteout for a single path (the path is recreated in delta).
     */
    private async clearWhiteout(agentPath: string): Promise<void> {
        const whiteouts = await this.getWhiteouts();
        if (!whiteouts.has(agentPath)) {
            return;
        }
        whiteouts.delete(agentPath);
        await this.kv.delete(this.whiteoutKey(agentPath));
    }

    /**
     * Clear whiteouts for a path and every ancestor directory.
     *
     * Used when writing/creating a path deep in a previously-deleted
     * subtree: recreating `/src/new.txt` must un-hide `/src` so the
     * merged directory listing shows the delta's version.
     */
    private async clearAncestorWhiteouts(agentPath: string): Promise<void> {
        const whiteouts = await this.getWhiteouts();
        let currentPath = agentPath;
        while (true) {
            if (whiteouts.has(currentPath)) {
                whiteouts.delete(currentPath);
                await this.kv.delete(this.whiteoutKey(currentPath));
            }
            if (currentPath === '/' || currentPath === '') {
                break;
            }
            currentPath = posixDirname(currentPath);
        }
    }

    /**
     * Determine whether a path is hidden in the merged view.
     *
     * A path is hidden if it, or any ancestor directory, has a whiteout.
     */
    private async isPathWhiteouted(agentPath: string): Promise<boolean> {
        const whiteouts = await this.getWhiteouts();
        let currentPath = agentPath;
        while (true) {
            if (whiteouts.has(currentPath)) {
                return true;
            }
            if (currentPath === '/' || currentPath === '') {
                return false;
            }
            currentPath = posixDirname(currentPath);
        }
    }

    // ---------------------------------------------------------------------------
    // Path helpers
    // ---------------------------------------------------------------------------

    /**
     * Normalize an agent path to canonical POSIX form (leading slash,
     * no trailing slash except root, no backslashes).
     */
    private normalizeAgentPath(inputPath: string): string {
        if (!inputPath || inputPath === 'root') {
            return '/';
        }
        const forwardSlashed = inputPath.replace(/\\/g, '/');
        const normalized = nodePath.posix.normalize(forwardSlashed);
        return normalized.startsWith('/') ? normalized : `/${normalized}`;
    }

    /**
     * Translate a POSIX agent path to the corresponding host filesystem path
     * under the base project directory.
     */
    private toHostPath(agentPath: string): string {
        const relativePath = agentPath.replace(/^\/+/, '');
        return nodePath.join(this.baseProjectPath, relativePath);
    }

    /**
     * Convert a Node.js host Stats object to the overlay stats shape.
     */
    private toOverlayStats(hostStats: NodeStats): OverlayStats {
        return {
            size: hostStats.size,
            mode: hostStats.mode,
            mtime: hostStats.mtimeMs,
            ctime: hostStats.ctimeMs,
            isFile: () => hostStats.isFile(),
            isDirectory: () => hostStats.isDirectory(),
        };
    }

    // ---------------------------------------------------------------------------
    // Read operations (delta-first, base fallback)
    // ---------------------------------------------------------------------------

    async stat(agentPath: string): Promise<OverlayStats> {
        const normalized = this.normalizeAgentPath(agentPath);
        if (await this.isPathWhiteouted(normalized)) {
            throw createEnoentError(normalized, 'stat');
        }
        try {
            return await this.delta.stat(normalized);
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
        }
        const hostPath = this.toHostPath(normalized);
        try {
            const hostStats = await hostFs.stat(hostPath);
            return this.toOverlayStats(hostStats);
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
            throw createEnoentError(normalized, 'stat');
        }
    }

    async lstat(agentPath: string): Promise<OverlayStats> {
        return this.stat(agentPath);
    }

    async readFile(agentPath: string): Promise<Buffer>;
    async readFile(agentPath: string, encoding: BufferEncoding): Promise<string>;
    async readFile(agentPath: string, encoding?: BufferEncoding): Promise<Buffer | string> {
        const normalized = this.normalizeAgentPath(agentPath);
        if (await this.isPathWhiteouted(normalized)) {
            throw createEnoentError(normalized, 'open');
        }
        try {
            if (encoding) {
                return await this.delta.readFile(normalized, encoding);
            }
            return await this.delta.readFile(normalized);
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
        }
        const hostPath = this.toHostPath(normalized);
        const hostStats = await hostFs.stat(hostPath);
        if (hostStats.isDirectory()) {
            const error = new Error(
                `EISDIR: illegal operation on a directory, read '${normalized}'`
            ) as NodeJS.ErrnoException;
            error.code = 'EISDIR';
            throw error;
        }
        if (encoding) {
            return hostFs.readFile(hostPath, encoding);
        }
        return hostFs.readFile(hostPath);
    }

    async readdir(agentPath: string): Promise<string[]> {
        const entries = await this.readdirPlus(agentPath);
        return entries.map((entry) => entry.name);
    }

    async readdirPlus(agentPath: string): Promise<OverlayDirEntry[]> {
        const normalized = this.normalizeAgentPath(agentPath);
        if (await this.isPathWhiteouted(normalized)) {
            throw createEnoentError(normalized, 'scandir');
        }

        const mergedEntries = new Map<string, OverlayDirEntry>();

        // --- delta layer ---
        let deltaHasDirectory = false;
        try {
            for (const entry of await this.delta.readdirPlus(normalized)) {
                mergedEntries.set(entry.name, entry);
            }
            deltaHasDirectory = true;
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
        }

        // --- base layer ---
        let baseHasDirectory = false;
        try {
            const hostPath = this.toHostPath(normalized);
            const hostEntries = await hostFs.readdir(hostPath, { withFileTypes: true });
            const whiteouts = await this.getWhiteouts();
            for (const hostEntry of hostEntries) {
                const entryAgentPath = nodePath.posix.join(normalized, hostEntry.name);
                // Skip base entries that are individually deleted or under a
                // deleted subtree.
                if (this.isPathInWhiteoutSet(whiteouts, entryAgentPath)) {
                    continue;
                }
                // Delta entries take precedence — do not overwrite.
                if (mergedEntries.has(hostEntry.name)) {
                    continue;
                }
                const hostStats = await hostFs.stat(nodePath.join(hostPath, hostEntry.name));
                mergedEntries.set(hostEntry.name, {
                    name: hostEntry.name,
                    stats: this.toOverlayStats(hostStats),
                });
            }
            baseHasDirectory = true;
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
        }

        if (!deltaHasDirectory && !baseHasDirectory) {
            throw createEnoentError(normalized, 'scandir');
        }

        return Array.from(mergedEntries.values());
    }

    async access(agentPath: string): Promise<void> {
        const normalized = this.normalizeAgentPath(agentPath);
        if (await this.isPathWhiteouted(normalized)) {
            throw createEnoentError(normalized, 'access');
        }
        try {
            await this.delta.access(normalized);
            return;
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
        }
        const hostPath = this.toHostPath(normalized);
        try {
            await hostFs.access(hostPath);
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
            throw createEnoentError(normalized, 'access');
        }
    }

    // ---------------------------------------------------------------------------
    // Write operations (delta-only + whiteout maintenance)
    // ---------------------------------------------------------------------------

    async writeFile(
        agentPath: string,
        data: string | Buffer,
        options?: BufferEncoding | { encoding?: BufferEncoding }
    ): Promise<void> {
        const normalized = this.normalizeAgentPath(agentPath);
        await this.delta.writeFile(normalized, data, options);
        // If the path (or an ancestor dir) was previously deleted via a
        // whiteout, clear those whiteouts so the merged view shows the
        // newly written file and its parent directories.
        await this.clearAncestorWhiteouts(normalized);
    }

    async mkdir(agentPath: string): Promise<void> {
        const normalized = this.normalizeAgentPath(agentPath);
        await this.delta.mkdir(normalized);
        await this.clearWhiteout(normalized);
        await this.clearAncestorWhiteouts(normalized);
    }

    // ---------------------------------------------------------------------------
    // Delete operations (delta removal + base whiteout)
    // ---------------------------------------------------------------------------

    async unlink(agentPath: string): Promise<void> {
        const normalized = this.normalizeAgentPath(agentPath);
        let existedInDelta = true;
        try {
            await this.delta.unlink(normalized);
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
            existedInDelta = false;
        }
        const existsInBase = await this.pathExistsOnBase(normalized);
        if (existsInBase) {
            await this.recordWhiteout(normalized);
        } else if (!existedInDelta) {
            throw createEnoentError(normalized, 'unlink');
        }
    }

    async deleteFile(agentPath: string): Promise<void> {
        return this.unlink(agentPath);
    }

    async rm(
        agentPath: string,
        options?: { force?: boolean; recursive?: boolean }
    ): Promise<void> {
        const normalized = this.normalizeAgentPath(agentPath);
        let existedInDelta = true;
        try {
            await this.delta.rm(normalized, { force: true, recursive: true });
        } catch (error) {
            if (!isEnoentError(error)) {
                throw error;
            }
            existedInDelta = false;
        }
        const existsInBase = await this.pathExistsOnBase(normalized);
        if (existsInBase) {
            await this.recordWhiteout(normalized);
        } else if (!existedInDelta && !options?.force) {
            throw createEnoentError(normalized, 'rm');
        }
    }

    // ---------------------------------------------------------------------------
    // Rename / move (copy-up into delta, then whiteout source)
    // ---------------------------------------------------------------------------

    async rename(oldPath: string, newPath: string): Promise<void> {
        const normalizedOld = this.normalizeAgentPath(oldPath);
        const normalizedNew = this.normalizeAgentPath(newPath);
        if (await this.isPathWhiteouted(normalizedOld)) {
            throw createEnoentError(normalizedOld, 'rename');
        }
        await this.copyTreeMerged(normalizedOld, normalizedNew);
        await this.removeAndWhiteout(normalizedOld);
    }

    /**
     * Recursively copy a path from the merged view into the delta at the
     * destination. Used by rename to materialise moved content.
     */
    private async copyTreeMerged(
        sourceAgentPath: string,
        destAgentPath: string
    ): Promise<void> {
        const sourceStats = await this.stat(sourceAgentPath);
        if (sourceStats.isFile()) {
            const content = await this.readFile(sourceAgentPath);
            await this.writeFile(destAgentPath, content);
            return;
        }
        // Directory: create it in delta and recurse into each merged child.
        await this.delta.mkdir(destAgentPath);
        const children = await this.readdirPlus(sourceAgentPath);
        for (const child of children) {
            const childSource = nodePath.posix.join(sourceAgentPath, child.name);
            const childDest = nodePath.posix.join(destAgentPath, child.name);
            await this.copyTreeMerged(childSource, childDest);
        }
    }

    /**
     * Remove a path from the delta and, if it existed in the base layer,
     * record a whiteout so the base original stays hidden.
     */
    private async removeAndWhiteout(agentPath: string): Promise<void> {
        try {
            await this.delta.rm(agentPath, { force: true, recursive: true });
        } catch {
            // Delta may not have the path (pure base-layer move); ignore.
        }
        if (await this.pathExistsOnBase(agentPath)) {
            await this.recordWhiteout(agentPath);
        }
    }

    // ---------------------------------------------------------------------------
    // Base-layer probes (host filesystem)
    // ---------------------------------------------------------------------------

    /**
     * Check whether a path exists in the base layer (without consulting
     * whiteouts — callers guard whiteouts separately).
     */
    private async pathExistsOnBase(agentPath: string): Promise<boolean> {
        const hostPath = this.toHostPath(agentPath);
        try {
            await hostFs.access(hostPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check whether a path is hidden, using an already-loaded whiteout set.
     * Walks ancestor directories to respect subtree whiteouts.
     */
    private isPathInWhiteoutSet(
        whiteouts: Set<string>,
        agentPath: string
    ): boolean {
        let currentPath = agentPath;
        while (true) {
            if (whiteouts.has(currentPath)) {
                return true;
            }
            if (currentPath === '/' || currentPath === '') {
                return false;
            }
            currentPath = posixDirname(currentPath);
        }
    }
}
