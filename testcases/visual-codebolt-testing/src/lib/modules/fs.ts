import { CodeboltModule, param, fn } from './types';

export const fsModule: CodeboltModule = {
  name: 'fs',
  displayName: 'File System',
  description: 'File and folder operations',
  category: 'file-system',
  functions: [
    fn('createFile', 'Creates a new file', [
      param('fileName', 'string', true, 'Name of the file'),
      param('source', 'string', true, 'File content'),
      param('filePath', 'string', true, 'Path where to create the file'),
    ], 'CreateFileResponse'),
    fn('createFolder', 'Creates a new folder', [
      param('folderName', 'string', true, 'Name of the folder'),
      param('folderPath', 'string', true, 'Path where to create the folder'),
    ], 'CreateFolderResponse'),
    fn('readFile', 'Reads file content', [
      param('filePath', 'string', true, 'Path to the file'),
    ], 'ReadFileResponse'),
    fn('updateFile', 'Updates file content', [
      param('filename', 'string', true, 'Name of the file'),
      param('filePath', 'string', true, 'Path to the file'),
      param('newContent', 'string', true, 'New file content'),
    ], 'UpdateFileResponse'),
    fn('deleteFile', 'Deletes a file', [
      param('filename', 'string', true, 'Name of the file'),
      param('filePath', 'string', true, 'Path to the file'),
    ], 'DeleteFileResponse'),
    fn('deleteFolder', 'Deletes a folder', [
      param('foldername', 'string', true, 'Name of the folder'),
      param('folderpath', 'string', true, 'Path to the folder'),
    ], 'DeleteFolderResponse'),
    fn('listFile', 'Lists files in directory', [
      param('folderPath', 'string', true, 'Path to the folder'),
      param('isRecursive', 'boolean', false, 'Recursive listing', false),
    ], 'ListFileResponse'),
    fn('listCodeDefinitionNames', 'Lists code definition names', [
      param('path', 'string', true, 'Path to scan'),
    ], 'CodeDefinitionResponse'),
    fn('searchFiles', 'Searches files by pattern', [
      param('path', 'string', true, 'Path to search in'),
      param('regex', 'string', true, 'Regex pattern'),
      param('filePattern', 'string', false, 'File pattern filter'),
    ], 'SearchFilesResponse'),
    fn('writeToFile', 'Writes content to file', [
      param('relPath', 'string', true, 'Relative path to file'),
      param('newContent', 'string', true, 'Content to write'),
    ], 'WriteFileResponse'),
    fn('grepSearch', 'Grep search in files', [
      param('path', 'string', true, 'Path to search'),
      param('query', 'string', true, 'Search query'),
      param('includePattern', 'string', false, 'Include pattern'),
      param('excludePattern', 'string', false, 'Exclude pattern'),
      param('caseSensitive', 'boolean', false, 'Case sensitive search', false),
    ], 'GrepSearchResponse'),
    fn('fileSearch', 'Fuzzy file search', [
      param('query', 'string', true, 'Search query'),
    ], 'FileSearchResponse'),
    fn('editFileWithDiff', 'Applies diff to file', [
      param('targetFile', 'string', true, 'Target file path'),
      param('codeEdit', 'string', true, 'Code edit/diff'),
      param('diffIdentifier', 'string', true, 'Diff identifier'),
      param('prompt', 'string', true, 'Edit prompt'),
      param('applyModel', 'string', false, 'Model to use'),
    ], 'EditFileResponse'),
    fn('readManyFiles', 'Reads multiple files at once', [
      param('files', 'array', true, 'Array of file paths'),
    ], 'ReadManyFilesResponse'),
    fn('listDirectory', 'Lists directory contents', [
      param('path', 'string', true, 'Directory path'),
      param('recursive', 'boolean', false, 'Recursive listing', false),
    ], 'ListDirectoryResponse'),
  ],
};

export const codeutilsModule: CodeboltModule = {
  name: 'codeutils',
  displayName: 'Code Utils',
  description: 'Code analysis and matching utilities',
  category: 'file-system',
  functions: [
    fn('getAllFilesAsMarkDown', 'Gets all files as Markdown', [], 'MarkdownFilesResponse'),
    fn('performMatch', 'Performs pattern matching', [
      param('matcherDefinition', 'object', true, 'Matcher definition object'),
      param('problemPatterns', 'array', true, 'Problem patterns to match'),
      param('problems', 'array', false, 'Existing problems'),
    ], 'MatchResponse'),
    fn('getMatcherList', 'Gets list of available matchers', [], 'MatcherListResponse'),
    fn('matchDetail', 'Gets matcher details', [
      param('matcher', 'string', true, 'Matcher name'),
    ], 'MatcherDetailResponse'),
  ],
};

export const outputparsersModule: CodeboltModule = {
  name: 'outputparsers',
  displayName: 'Output Parsers',
  description: 'Output parsing and formatting utilities',
  category: 'file-system',
  functions: [
    fn('parseJSON', 'Parses JSON string', [
      param('jsonString', 'string', true, 'JSON string to parse'),
    ], 'ParsedJSON'),
    fn('parseXML', 'Parses XML string', [
      param('xmlString', 'string', true, 'XML string to parse'),
    ], 'ParsedXML'),
    fn('parseCSV', 'Parses CSV string', [
      param('csvString', 'string', true, 'CSV string to parse'),
    ], 'ParsedCSV'),
    fn('parseText', 'Parses text', [
      param('text', 'string', true, 'Text to parse'),
    ], 'ParsedText'),
    fn('parseErrors', 'Extracts errors from output', [
      param('output', 'object', true, 'Output to parse'),
    ], 'ErrorsResponse'),
    fn('parseWarnings', 'Extracts warnings from output', [
      param('output', 'object', true, 'Output to parse'),
    ], 'WarningsResponse'),
  ],
};
