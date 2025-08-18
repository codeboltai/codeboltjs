/**
 * Output Parsers SDK Function Types
 * Types for the cboutputparsers module functions
 */

// Base response interface for output parser operations
export interface BaseOutputParserResponse {
  success: boolean;
  error?: Error;
}

// JSON parsing result
export interface JSONParseResult extends BaseOutputParserResponse {
  parsed?: unknown;
}

// XML parsing result
export interface XMLParseResult extends BaseOutputParserResponse {
  parsed?: {
    rootElement: string;
    [key: string]: unknown;
  };
}

// CSV row data structure
export interface CSVRow {
  [key: string]: string;
}

// CSV parsing result
export interface CSVParseResult extends BaseOutputParserResponse {
  parsed?: CSVRow[];
}

// Text parsing result
export interface TextParseResult extends BaseOutputParserResponse {
  parsed: string[];
}

// Error and warning parsing input types
export type ParsableOutput = string | string[] | { toString(): string };

// Error parsing result
export interface ErrorParseResult {
  errors: string[];
}

// Warning parsing result
export interface WarningParseResult {
  warnings: string[];
}

// Output parser module interface
export interface OutputParsersModule {
  /**
   * Parses JSON string and returns a result object.
   * @param jsonString - The JSON string to parse.
   * @returns An object with success flag and parsed data or error.
   */
  parseJSON(jsonString: string): JSONParseResult;

  /**
   * Parses XML string and returns a result object.
   * @param xmlString - The XML string to parse.
   * @returns An object with success flag and parsed data.
   */
  parseXML(xmlString: string): XMLParseResult;

  /**
   * Parses CSV string and returns a result object.
   * @param csvString - The CSV string to parse.
   * @returns An object with success flag and parsed data or error.
   */
  parseCSV(csvString: string): CSVParseResult;

  /**
   * Parses text string and returns a result object with lines.
   * @param text - The text to parse.
   * @returns An object with success flag and parsed lines.
   */
  parseText(text: string): TextParseResult;

  /**
   * Parses the given output and returns all the error messages.
   * @param output - The output to parse for error messages.
   * @returns An array of error messages.
   */
  parseErrors(output: ParsableOutput): string[];

  /**
   * Parses the given output and returns all the warning messages.
   * @param output - The output to parse for warning messages.
   * @returns An array of warning messages.
   */
  parseWarnings(output: ParsableOutput): string[];
}
