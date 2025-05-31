import cbws from '../core/websocket';
import * as fs from 'fs';
import path from 'path';
// import Parser from 'tree-sitter';
// import JavaScript from 'tree-sitter-javascript';
// import typescript from "tree-sitter-typescript"; // TypeScript and TSX grammar

import { GetJsTreeResponse, MatchProblemResponse, GetMatcherListTreeResponse, getMatchDetail } from '@codebolt/types';

/**
 * A utility module for working with code.
 */
const cbcodeutils = {

    /**
     * Retrieves a JavaScript tree structure for a given file path.
     * @param {string} filePath - The path of the file to retrieve the JS tree for.
     * @returns {Promise<GetJsTreeResponse>} A promise that resolves with the JS tree response.
     */
    getJsTree: (filePath?: string) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "settingEvent",
                "action": "getProjectPath"
            },
            "getProjectPathResponse"
        );
        // return new Promise(async (resolve, reject) => {
        //     cbws.messageManager.send({
        //         "type": "codeEvent",
        //         "action": "getJsTree",
        //         payload: {
        //             filePath
        //         }
        //     });
        //     cbws.getWebsocket.on('message', (data: string) => {
        //         const response = JSON.parse(data);
        //         if (response.type === "getJsTreeResponse") {
        //             resolve(response); // Resolve the Promise with the response data
        //         }
        //     });
        // });
    },

    /**
     * Retrieves all files as Markdown.
     * @returns {Promise<string>} A promise that resolves with the Markdown content of all files.
     */
    getAllFilesAsMarkDown: (): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "codeEvent",
                "action": "getAllFilesMarkdown"
            },
            "getAllFilesMarkdownResponse"
        );
    },

    /**
     * Performs a matching operation based on the provided matcher definition and problem patterns.
     * @param {object} matcherDefinition - The definition of the matcher.
     * @param {Array} problemPatterns - The patterns to match against.
     * @param {Array} problems - The list of problems.
     * @returns {Promise<MatchProblemResponse>} A promise that resolves with the matching problem response.
     */
    performMatch: (matcherDefinition: object, problemPatterns: any[], problems: any[]): Promise<MatchProblemResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "codeEvent",
                "action": "performMatch",
                payload: {
                    matcherDefinition,
                    problemPatterns,
                }
            },
            "getgetJsTreeResponse"
        );
    },

    /**
     * Retrieves the list of matchers.
     * @returns {Promise<GetMatcherListTreeResponse>} A promise that resolves with the list of matchers response.
     */
    getMatcherList: (): Promise<GetMatcherListTreeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "codeEvent",
                "action": "getMatcherList",
            },
            "getMatcherListTreeResponse"
        );
    },

    /**
     * Retrieves details of a match.
     * @param {string} matcher - The matcher to retrieve details for.
     * @returns {Promise<getMatchDetail>} A promise that resolves with the match detail response.
     */
    matchDetail: (matcher: string): Promise<getMatchDetail> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "codeEvent",
                "action": "getMatchDetail",
                payload: {
                    match: matcher
                }
            },
            "matchDetailTreeResponse"
        );
    }

};

export default cbcodeutils;
