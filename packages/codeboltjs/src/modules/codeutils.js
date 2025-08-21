"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const codeparser_1 = require("@codebolt/codeparser");
const enum_1 = require("@codebolt/types/enum");
/**
 * A utility module for working with code.
 */
const cbcodeutils = {
    /**
     * Retrieves a JavaScript tree structure for a given file path.
     * @param {string} filePath - The path of the file to retrieve the JS tree for.
     * @returns {Promise<JSTreeResponse>} A promise that resolves with the JS tree response.
     */
    getJsTree: async (filePath) => {
        try {
            // If no filePath is provided, we can't parse anything
            if (!filePath) {
                throw new Error('No file path provided for parsing');
            }
            // Get absolute path to ensure file can be accessed
            const absolutePath = path_1.default.resolve(filePath);
            // Check if file exists
            await fs.promises.access(absolutePath);
            // Get file extension to determine language parser
            const ext = path_1.default.extname(absolutePath).toLowerCase().slice(1);
            // Load appropriate language parser
            const languageParsers = await (0, codeparser_1.loadRequiredLanguageParsers)([absolutePath]);
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
            captures.sort((a, b) => a.node.startPosition.row - b.node.startPosition.row ||
                a.node.startPosition.column - b.node.startPosition.column);
            // Transform captures into a structured format
            const structure = captures.map((capture) => {
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
                event: enum_1.CodeResponseType.GET_JS_TREE_RESPONSE,
                payload: {
                    filePath: absolutePath,
                    structure
                }
            };
        }
        catch (error) {
            // Return error response
            return {
                event: enum_1.CodeResponseType.GET_JS_TREE_RESPONSE,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Retrieves all files as Markdown.
     * @returns {Promise<string>} A promise that resolves with the Markdown content of all files.
     */
    getAllFilesAsMarkDown: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODE_EVENT,
            "action": enum_1.CodeAction.GET_ALL_FILES_MARKDOWN
        }, enum_1.CodeResponseType.GET_ALL_FILES_MARKDOWN_RESPONSE);
    },
    /**
     * Performs a matching operation based on the provided matcher definition and problem patterns.
     * @param {object} matcherDefinition - The definition of the matcher (name, pattern, language, etc.).
     * @param {Array} problemPatterns - The patterns to match against (regex patterns with severity levels).
     * @param {Array} problems - Optional list of pre-existing problems to include.
     * @returns {Promise<MatchProblemResponse>} A promise that resolves with the matching problem response.
     */
    performMatch: (matcherDefinition, problemPatterns, problems = []) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODE_EVENT,
            "action": enum_1.CodeAction.PERFORM_MATCH,
            payload: {
                matcherDefinition,
                problemPatterns,
                problems
            }
        }, enum_1.CodeResponseType.MATCH_PROBLEM_RESPONSE);
    },
    /**
     * Retrieves the list of matchers.
     * @returns {Promise<GetMatcherListTreeResponse>} A promise that resolves with the list of matchers response.
     */
    getMatcherList: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODE_EVENT,
            "action": enum_1.CodeAction.GET_MATCHER_LIST,
        }, enum_1.CodeResponseType.GET_MATCHER_LIST_TREE_RESPONSE);
    },
    /**
     * Retrieves details of a match.
     * @param {string} matcher - The matcher to retrieve details for (by name or identifier).
     * @returns {Promise<getMatchDetail>} A promise that resolves with the match detail response.
     */
    matchDetail: (matcher) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CODE_EVENT,
            "action": enum_1.CodeAction.GET_MATCH_DETAIL,
            payload: {
                matcher: matcher
            }
        }, enum_1.CodeResponseType.GET_MATCH_DETAIL_RESPONSE);
    }
};
exports.default = cbcodeutils;
