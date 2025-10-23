/**
 * Services Module - Exports all operation services
 */

// File Services
export { 
  FileServices, 
  createFileServices, 
  fileServiceFunctions,
  type FileServicesConfig,
  type GrepMatch,
  DEFAULT_FILE_FILTERING_OPTIONS
} from './FileServices';

// Terminal Service
export {
  TerminalService,
  createTerminalService,
  terminalServiceFunctions,
  type TerminalServiceConfig,
  type CommandResult
} from './TerminalService';

// Directory
export {
  Directory,
  createDirectory,
  directoryFunctions,
  type DirectoryConfig,
  type FileEntry
} from '../utils/fsutils/Directory';

// Search
export {
  Search,
  createSearch,
  searchFunctions,
  type SearchConfig,
  type SearchMatch,
  type SearchOptions
} from '../utils/fsutils/Search';