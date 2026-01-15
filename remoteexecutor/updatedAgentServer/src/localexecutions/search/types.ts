/**
 * Subset of 'Path' interface provided by 'glob' that we can implement for testing
 */
export interface GlobPath {
  fullpath(): string;
  mtimeMs?: number;
}