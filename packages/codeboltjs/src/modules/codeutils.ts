import cbws from '../core/websocket';
// import Parser from 'tree-sitter';
// import JavaScript from 'tree-sitter-javascript';
// import typescript from "tree-sitter-typescript"; // TypeScript and TSX grammar

import { MatchProblemResponse, GetMatcherListTreeResponse, getMatchDetail } from '@codebolt/types/sdk';

import { CodeAction, CodeResponseType, EventType } from '@codebolt/types/enum';

/**
 * A utility module for working with code.
 */
const cbcodeutils = {

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
