/**
 * A module for parsing output messages to identify errors and warnings.
 */

// Type definitions for output parsing
interface CSVRow {
  [key: string]: string;
}

type ParsableOutput = string | string[] | { toString(): string };

interface ParseResult<T = unknown> {
  success: boolean;
  parsed?: T;
  error?: Error;
}

const cboutputparsers = {
    /**
     * Parses JSON string and returns a result object.
     * @param {string} jsonString - The JSON string to parse.
     * @returns {Object} An object with success flag and parsed data or error.
     */
    parseJSON: (jsonString: string): ParseResult<unknown> => {
        try {
            const parsed = JSON.parse(jsonString);
            return { success: true, parsed };
        } catch (error) {
            return { success: false, error: error as Error };
        }
    },
    
    /**
     * Parses XML string and returns a result object.
     * @param {string} xmlString - The XML string to parse.
     * @returns {Object} An object with success flag and parsed data.
     */
    parseXML: (xmlString: string): ParseResult<{ rootElement: string; [key: string]: unknown }> => {
        // Simple XML parsing - in a real implementation, would use a proper XML parser
        const hasValidRoot = xmlString.trim().startsWith('<') && xmlString.trim().endsWith('>');
        return { 
            success: hasValidRoot,
            parsed: hasValidRoot ? { rootElement: xmlString } : undefined
        };
    },
    
    /**
     * Parses CSV string and returns a result object.
     * @param {string} csvString - The CSV string to parse.
     * @returns {Object} An object with success flag and parsed data or error.
     */
    parseCSV: (csvString: string): ParseResult<CSVRow[]> => {
        try {
            const lines = csvString.split('\n');
            const headers = lines[0].split(',');
            
            const results: CSVRow[] = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj: CSVRow = {};
                
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                
                return obj;
            });
            
            return { success: true, parsed: results };
        } catch (error) {
            return { success: false, error: error as Error };
        }
    },
    
    /**
     * Parses text string and returns a result object with lines.
     * @param {string} text - The text to parse.
     * @returns {Object} An object with success flag and parsed lines.
     */
    parseText: (text: string): ParseResult<string[]> => {
        const lines = text ? text.split('\n') : [];
        return { success: true, parsed: lines };
    },
  
    /**
     * Parses the given output and returns all the error messages.
     * @param {ParsableOutput} output - The output to parse for error messages.
     * @returns {string[]} An array of error messages.
     */
    parseErrors: (output: ParsableOutput): string[] => {
        const outputString = typeof output === 'string' ? output : output.toString();
        return outputString.split('\n').filter((line: string) => line.includes('Error:'));
    },
    
    /**
     * Parses the given output and returns all the warning messages.
     * @param {ParsableOutput} output - The output to parse for warning messages.
     * @returns {string[]} An array of warning messages.
     */
    parseWarnings: (output: ParsableOutput): string[] => {
        const outputString = typeof output === 'string' ? output : output.toString();
        return outputString.split('\n').filter((line: string) => line.includes('Warning:'));
    }
};

export default cboutputparsers;