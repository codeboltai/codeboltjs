/**
 * Services Module - Exports all operation services
 */

// File Services
export { 
  FileServices, 
  createFileServices, 
  fileServiceFunctions,
  type FileServicesConfig,
  type FileEntry
} from './FileServices';

// Search Service
export {
  SearchService,
  createSearchService,
  searchServiceFunctions,
  type SearchServiceConfig,
  type GrepMatchResult
} from './SearchService';

// Terminal Service
export {
  TerminalService,
  createTerminalService,
  terminalServiceFunctions,
  type TerminalServiceConfig,
  type CommandResult
} from './TerminalService';
