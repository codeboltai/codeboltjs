/**
 * Memory Service — Persistent memory read/write operations.
 * Equivalent to Gemini CLI's GEMINI.md memory system + memory tool.
 *
 * Uses codebolt.memory APIs to persist:
 *   - User preferences (cross-project)
 *   - Project context (per-project conventions)
 *   - Session facts (within current session)
 */
import codebolt from '@codebolt/codeboltjs';

const USER_MEMORY_KEY = 'gemini_user_memory';
const PROJECT_MEMORY_KEY = 'gemini_project_memory';

export interface MemoryEntry {
  value: string;
  timestamp: string;
}

/**
 * Save a key-value pair to user-level memory (persists across projects).
 */
export async function saveUserMemory(key: string, value: string): Promise<void> {
  const existing = await loadMemoryStore(USER_MEMORY_KEY);
  existing[key] = { value, timestamp: new Date().toISOString() };
  await codebolt.memory.json.save({ [USER_MEMORY_KEY]: existing });
}

/**
 * Save a key-value pair to project-level memory (persists within project).
 */
export async function saveProjectMemory(key: string, value: string): Promise<void> {
  const existing = await loadMemoryStore(PROJECT_MEMORY_KEY);
  existing[key] = { value, timestamp: new Date().toISOString() };
  await codebolt.memory.json.save({ [PROJECT_MEMORY_KEY]: existing });
}

/**
 * Read a specific key from user memory.
 */
export async function readUserMemory(key: string): Promise<string | null> {
  const store = await loadMemoryStore(USER_MEMORY_KEY);
  return store[key]?.value ?? null;
}

/**
 * Read a specific key from project memory.
 */
export async function readProjectMemory(key: string): Promise<string | null> {
  const store = await loadMemoryStore(PROJECT_MEMORY_KEY);
  return store[key]?.value ?? null;
}

/**
 * List all keys in a memory store.
 */
export async function listMemoryKeys(storeKey: string): Promise<string[]> {
  const store = await loadMemoryStore(storeKey);
  return Object.keys(store);
}

/**
 * Delete a key from a memory store.
 */
export async function deleteMemoryKey(storeKey: string, key: string): Promise<void> {
  const store = await loadMemoryStore(storeKey);
  delete store[key];
  await codebolt.memory.json.save({ [storeKey]: store });
}

/**
 * Get formatted memory content for prompt injection.
 */
export async function getFormattedMemory(storeKey: string): Promise<string | null> {
  const store = await loadMemoryStore(storeKey);
  const entries = Object.entries(store);
  if (entries.length === 0) return null;

  return entries
    .map(([key, entry]) => `- **${key}:** ${(entry as MemoryEntry).value}`)
    .join('\n');
}

/** Internal helper to load a memory store safely. */
async function loadMemoryStore(
  storeKey: string
): Promise<Record<string, MemoryEntry>> {
  try {
    const response = await codebolt.memory.json.list({ key: storeKey });
    if (response && response.items && response.items.length > 0) {
      // The first matching item contains our store data
      const item = response.items[0] as Record<string, unknown>;
      const data = item?.data ?? item;
      if (data && typeof data === 'object') {
        return data as Record<string, MemoryEntry>;
      }
    }
    return {};
  } catch {
    return {};
  }
}
