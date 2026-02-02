/**
 * Cache Manager Utility
 * Provides TTL-based caching for model lists and other data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Generic cache manager with TTL support
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;

  /**
   * Create a new CacheManager
   * @param defaultTTL - Default TTL in milliseconds (default: 1 hour)
   */
  constructor(defaultTTL = 3600000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get a cached value
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a cached value
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Optional TTL in milliseconds (default: defaultTTL)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    });
  }

  /**
   * Check if a key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern - Optional pattern to match keys (if not provided, clears all)
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns Object with cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   * Call periodically to prevent memory bloat
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Shared cache instance for model lists
 * TTL: 1 hour (models don't change frequently)
 */
export const modelCache = new CacheManager(3600000);

/**
 * Shared cache instance for provider capabilities
 * TTL: 24 hours (capabilities are mostly static)
 */
export const capabilityCache = new CacheManager(86400000);
