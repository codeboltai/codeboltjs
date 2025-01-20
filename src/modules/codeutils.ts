import cbws from './websocket';
import * as fs from 'fs';
import path from 'path';
// import  Parser  from 'tree-sitter';
// import  JavaScript  from 'tree-sitter-javascript';

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
        return new Promise(async (resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action": "getJsTree",
                payload: {
                    filePath
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getJsTreeResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },

    /**
     * Retrieves all files as Markdown.
     * @returns {Promise<string>} A promise that resolves with the Markdown content of all files.
     */
    getAllFilesAsMarkDown: (): Promise<string> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action": "getAllFilesMarkdown"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getAllFilesMarkdownResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },

    /**
     * Performs a matching operation based on the provided matcher definition and problem patterns.
     * @param {object} matcherDefinition - The definition of the matcher.
     * @param {Array} problemPatterns - The patterns to match against.
     * @param {Array} problems - The list of problems.
     * @returns {Promise<MatchProblemResponse>} A promise that resolves with the matching problem response.
     */
    performMatch: (matcherDefinition: object, problemPatterns: any[], problems: any[]): Promise<MatchProblemResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action": "performMatch",
                payload: {
                    matcherDefinition,
                    problemPatterns,
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getgetJsTreeResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },

    /**
     * Retrieves the list of matchers.
     * @returns {Promise<GetMatcherListTreeResponse>} A promise that resolves with the list of matchers response.
     */
    getMatcherList: (): Promise<GetMatcherListTreeResponse> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action": "getMatcherList",
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getMatcherListTreeResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },

    /**
     * Retrieves details of a match.
     * @param {string} matcher - The matcher to retrieve details for.
     * @returns {Promise<getMatchDetail>} A promise that resolves with the match detail response.
     */
    matchDetail: (matcher: string): Promise<getMatchDetail> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codeEvent",
                "action": "getMatchDetail",
                payload: {
                    match: matcher
                }
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "matchDetailTreeResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    }

};

export default cbcodeutils;
