import { CodeboltModule, param, fn } from './types';

export const searchModule: CodeboltModule = {
  name: 'search',
  displayName: 'Search',
  description: 'Web search operations',
  category: 'search',
  functions: [
    fn('init', 'Initializes search engine', [
      param('engine', 'string', false, 'Search engine name'),
    ], 'InitResponse'),
    fn('search', 'Performs web search', [
      param('query', 'string', true, 'Search query'),
    ], 'SearchResultsResponse'),
    fn('get_first_link', 'Gets first link from results', [
      param('query', 'string', true, 'Search query'),
    ], 'LinkResponse'),
  ],
};

export const codebaseSearchModule: CodeboltModule = {
  name: 'codebaseSearch',
  displayName: 'Codebase Search',
  description: 'Semantic code search',
  category: 'search',
  functions: [
    fn('search', 'Performs semantic search', [
      param('query', 'string', true, 'Search query'),
      param('targetDirectories', 'array', false, 'Target directories'),
    ], 'SearchResultsResponse'),
    fn('searchMcpTool', 'Searches for MCP tools', [
      param('query', 'string', true, 'Search query'),
      param('tags', 'array', false, 'Tag filters'),
    ], 'MCPToolSearchResponse'),
  ],
};

export const vectordbModule: CodeboltModule = {
  name: 'vectordb',
  displayName: 'Vector DB',
  description: 'Vector database operations',
  category: 'search',
  functions: [
    fn('getVector', 'Gets a vector', [
      param('key', 'string', true, 'Vector key'),
    ], 'VectorResponse'),
    fn('addVectorItem', 'Adds a vector item', [
      param('item', 'any', true, 'Vector item'),
    ], 'AddVectorResponse'),
    fn('queryVectorItem', 'Queries a vector item', [
      param('key', 'string', true, 'Query key'),
    ], 'QueryVectorResponse'),
    fn('queryVectorItems', 'Queries multiple vector items', [
      param('items', 'array', true, 'Query items'),
      param('dbPath', 'string', true, 'Database path'),
    ], 'QueryVectorsResponse'),
  ],
};
