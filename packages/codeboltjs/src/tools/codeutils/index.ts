/**
 * CodeUtils tools - Individual tools for each codeutils action
 */

// Individual codeutils tools
export { CodeUtilsGetFilesMarkdownTool, type CodeUtilsGetFilesMarkdownParams } from './codeutils-get-files-markdown';
export { CodeUtilsPerformMatchTool, type CodeUtilsPerformMatchParams } from './codeutils-perform-match';
export { CodeUtilsGetMatcherListTool, type CodeUtilsGetMatcherListParams } from './codeutils-get-matcher-list';
export { CodeUtilsMatchDetailTool, type CodeUtilsMatchDetailParams } from './codeutils-match-detail';

// Create instances for convenience
import { CodeUtilsGetFilesMarkdownTool } from './codeutils-get-files-markdown';
import { CodeUtilsPerformMatchTool } from './codeutils-perform-match';
import { CodeUtilsGetMatcherListTool } from './codeutils-get-matcher-list';
import { CodeUtilsMatchDetailTool } from './codeutils-match-detail';

/**
 * All codeutils tools
 */
export const codeutilsTools = [
    new CodeUtilsGetFilesMarkdownTool(),
    new CodeUtilsPerformMatchTool(),
    new CodeUtilsGetMatcherListTool(),
    new CodeUtilsMatchDetailTool(),
];
