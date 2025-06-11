/**
 * A module for parsing output messages to identify errors and warnings.
 */
const cboutputparsers = {
    /**
     * Parses JSON string and returns a result object.
     * @param {string} jsonString - The JSON string to parse.
     * @returns {Object} An object with success flag and parsed data or error.
     */
    parseJSON: (jsonString: string): { success: boolean; parsed?: any; error?: Error } => {
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
    parseXML: (xmlString: string): { success: boolean; parsed?: any } => {
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
    parseCSV: (csvString: string): { success: boolean; parsed?: any[]; error?: Error } => {
        try {
            const lines = csvString.split('\n');
            const headers = lines[0].split(',');
            
            const results = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj: Record<string, string> = {};
                
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
    parseText: (text: string): { success: boolean; parsed: string[] } => {
        const lines = text ? text.split('\n') : [];
        return { success: true, parsed: lines };
    },
  
    /**
     * Parses the given output and returns all the error messages.
     * @param {any} output - The output to parse for error messages.
     * @returns {string[]} An array of error messages.
     */
    parseErrors: (output: any): string[] => {
        return output.split('\n').filter((line: string) => line.includes('Error:'));
    },
    /**
     * Parses the given output and returns all the warning messages.
     * @param {any} output - The output to parse for warning messages.
     * @returns {string[]} An array of warning messages.
     */
    parseWarnings: (output: any): string[] => {
        return output.split('\n').filter((line: string) => line.includes('Warning:'));
    }
};
export default cboutputparsers;