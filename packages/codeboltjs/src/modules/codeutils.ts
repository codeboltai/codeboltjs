import cbws from '../core/websocket';
import * as fs from 'fs';
import path from 'path';
// import Parser from 'tree-sitter';
// import JavaScript from 'tree-sitter-javascript';
// import typescript from "tree-sitter-typescript"; // TypeScript and TSX grammar

import { MatchProblemResponse, GetMatcherListTreeResponse, getMatchDetail } from '../types/socketMessageTypes';
import { loadRequiredLanguageParsers } from '@codebolt/codeparser';

// Import and re-export types from InternalTypes for consistency
import type { JSTreeStructureItem, JSTreeResponse } from '../types/InternalTypes';
export type { JSTreeStructureItem, JSTreeResponse };

import { CodeAction, CodeResponseType, EventType } from '@codebolt/types';

/**
 * A utility module for working with code.
 */
const cbcodeutils = {

    /**
     * Retrieves a JavaScript tree structure for a given file path.
     * @param {string} filePath - The path of the file to retrieve the JS tree for.
     * @returns {Promise<JSTreeResponse>} A promise that resolves with the JS tree response.
     */
    getJsTree: async (filePath?: string): Promise<JSTreeResponse> => {
        try {
            // If no filePath is provided, we can't parse anything
            if (!filePath) {
                throw new Error('No file path provided for parsing');
            }
            
            // Get absolute path to ensure file can be accessed
            const absolutePath = path.resolve(filePath);
            
            // Check if file exists
            await fs.promises.access(absolutePath);
            
            // Get file extension to determine language parser
            const ext = path.extname(absolutePath).toLowerCase().slice(1);
            
            // Load appropriate language parser
            const languageParsers = await loadRequiredLanguageParsers([absolutePath]);
            
            // Get parser for this file type
            const { parser, query } = languageParsers[ext] || {};
            if (!parser || !query) {
                throw new Error(`Unsupported language: ${ext}`);
            }
            
            // Read file content
            const fileContent = await fs.promises.readFile(absolutePath, 'utf8');
            
            // Parse file to get AST
            const tree = parser.parse(fileContent);
            
            // Get captures from the AST using the query
            const captures = query.captures(tree.rootNode);
            
            // Sort captures by position
            captures.sort((a: any, b: any) => 
                a.node.startPosition.row - b.node.startPosition.row || 
                a.node.startPosition.column - b.node.startPosition.column
            );
            
            // Transform captures into a structured format
            const structure = captures.map((capture: any) => {
                const { node, name } = capture;
                return {
                    type: name.includes('definition.') ? name.split('definition.')[1] : name,
                    name: node.text,
                    startLine: node.startPosition.row,
                    endLine: node.endPosition.row,
                    startColumn: node.startPosition.column,
                    endColumn: node.endPosition.column,
                    nodeType: node.type
                };
            });
            
            // Return response with the appropriate structure
            return {
                event: CodeResponseType.GET_JS_TREE_RESPONSE,
                payload: {
                    filePath: absolutePath,
                    structure
                }
            };
        } catch (error) {
            // Return error response
            return {
                event: CodeResponseType.GET_JS_TREE_RESPONSE,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Retrieves all files as Markdown.
     * @returns {Promise<string>} A promise that resolves with the Markdown content of all files.
     */
    getAllFilesAsMarkDown: (): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODE_EVENT,
                "action": CodeAction.GET_ALL_FILES_MARKDOWN
            },
            CodeResponseType.GET_ALL_FILES_MARKDOWN_RESPONSE
        );
    },

    /**
     * Performs a matching operation based on the provided matcher definition and problem patterns.
     * @param {object} matcherDefinition - The definition of the matcher (name, pattern, language, etc.).
     * @param {Array} problemPatterns - The patterns to match against (regex patterns with severity levels).
     * @param {Array} problems - Optional list of pre-existing problems to include.
     * @returns {Promise<MatchProblemResponse>} A promise that resolves with the matching problem response.
     */
    performMatch: (matcherDefinition: object, problemPatterns: any[], problems: any[] = []): Promise<MatchProblemResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODE_EVENT,
                "action": CodeAction.PERFORM_MATCH,
                payload: {
                    matcherDefinition,
                    problemPatterns,
                    problems
                }
            },
            CodeResponseType.MATCH_PROBLEM_RESPONSE
        );
    },

    /**
     * Retrieves the list of matchers.
     * @returns {Promise<GetMatcherListTreeResponse>} A promise that resolves with the list of matchers response.
     */
    getMatcherList: (): Promise<GetMatcherListTreeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODE_EVENT,
                "action": CodeAction.GET_MATCHER_LIST,
            },
            CodeResponseType.GET_MATCHER_LIST_TREE_RESPONSE
        );
    },

    /**
     * Retrieves details of a match.
     * @param {string} matcher - The matcher to retrieve details for (by name or identifier).
     * @returns {Promise<getMatchDetail>} A promise that resolves with the match detail response.
     */
    matchDetail: (matcher: string): Promise<getMatchDetail> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.CODE_EVENT,
                "action": CodeAction.GET_MATCH_DETAIL,
                payload: {
                    matcher: matcher
                }
            },
            CodeResponseType.GET_MATCH_DETAIL_RESPONSE
        );
    }
};

export default cbcodeutils;
