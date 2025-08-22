/**
 * JS Tree functionality - moved from @codebolt/codeboltjs codeutils module
 * 
 * This module provides functionality to parse JavaScript/TypeScript files
 * and extract structured information about code elements.
 */

import * as fs from 'fs';
import path from 'path';
import { loadRequiredLanguageParsers } from './parse-source-code/languageParser';
import type { JSTreeStructureItem, JSTreeResponse } from './types';

// Event type constant
const GET_JS_TREE_RESPONSE = 'getJsTreeResponse';

/**
 * Retrieves a JavaScript tree structure for a given file path.
 * @param {string} filePath - The path of the file to retrieve the JS tree for.
 * @returns {Promise<JSTreeResponse>} A promise that resolves with the JS tree response.
 */
export async function getJsTree(filePath?: string): Promise<JSTreeResponse> {
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
        const structure: JSTreeStructureItem[] = captures.map((capture: any) => {
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
            event: GET_JS_TREE_RESPONSE,
            payload: {
                filePath: absolutePath,
                structure
            }
        };
    } catch (error) {
        // Return error response
        return {
            event: GET_JS_TREE_RESPONSE,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}