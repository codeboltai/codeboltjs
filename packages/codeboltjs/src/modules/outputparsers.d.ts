/**
 * A module for parsing output messages to identify errors and warnings.
 */
export interface CSVRow {
    [key: string]: string;
}
export type ParsableOutput = string | string[] | {
    toString(): string;
};
export interface ParseResult<T = unknown> {
    success: boolean;
    parsed?: T;
    error?: Error;
}
declare const cboutputparsers: {
    /**
     * Parses JSON string and returns a result object.
     * @param {string} jsonString - The JSON string to parse.
     * @returns {Object} An object with success flag and parsed data or error.
     */
    parseJSON: (jsonString: string) => ParseResult<unknown>;
    /**
     * Parses XML string and returns a result object.
     * @param {string} xmlString - The XML string to parse.
     * @returns {Object} An object with success flag and parsed data.
     */
    parseXML: (xmlString: string) => ParseResult<{
        rootElement: string;
        [key: string]: unknown;
    }>;
    /**
     * Parses CSV string and returns a result object.
     * @param {string} csvString - The CSV string to parse.
     * @returns {Object} An object with success flag and parsed data or error.
     */
    parseCSV: (csvString: string) => ParseResult<CSVRow[]>;
    /**
     * Parses text string and returns a result object with lines.
     * @param {string} text - The text to parse.
     * @returns {Object} An object with success flag and parsed lines.
     */
    parseText: (text: string) => ParseResult<string[]>;
    /**
     * Parses the given output and returns all the error messages.
     * @param {ParsableOutput} output - The output to parse for error messages.
     * @returns {string[]} An array of error messages.
     */
    parseErrors: (output: ParsableOutput) => string[];
    /**
     * Parses the given output and returns all the warning messages.
     * @param {ParsableOutput} output - The output to parse for warning messages.
     * @returns {string[]} An array of warning messages.
     */
    parseWarnings: (output: ParsableOutput) => string[];
};
export default cboutputparsers;
