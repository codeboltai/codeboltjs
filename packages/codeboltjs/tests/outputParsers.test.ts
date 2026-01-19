/**
 * Test Suite for Output Parsers Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Output Parsers Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Output Parsers module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Output Parsers module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should parse JSON output successfully', () => {
        const codebolt = sharedCodebolt();

        const jsonString = '{"name": "test", "value": 123}';
        const result = codebolt.outputparsers.parseJSON(jsonString);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.parsed).toEqual({ name: 'test', value: 123 });

        // AskUserQuestion: Verify JSON parsing
        console.log('✅ AskUserQuestion: Was JSON parsed successfully?');
        console.log('   Input:', jsonString);
        console.log('   Success:', result.success);
        console.log('   Parsed:', result.parsed);
    });

    test('should handle invalid JSON gracefully', () => {
        const codebolt = sharedCodebolt();

        const invalidJson = '{"name": "test", invalid}';
        const result = codebolt.outputparsers.parseJSON(invalidJson);

        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();

        // AskUserQuestion: Verify error handling for invalid JSON
        console.log('✅ AskUserQuestion: Was invalid JSON handled gracefully?');
        console.log('   Input:', invalidJson);
        console.log('   Success:', result.success);
        console.log('   Error:', result.error?.message);
    });

    test('should parse XML output', () => {
        const codebolt = sharedCodebolt();

        const xmlString = '<root><item>test</item></root>';
        const result = codebolt.outputparsers.parseXML(xmlString);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.parsed).toBeDefined();

        // AskUserQuestion: Verify XML parsing
        console.log('✅ AskUserQuestion: Was XML parsed successfully?');
        console.log('   Input:', xmlString);
        console.log('   Success:', result.success);
    });

    test('should parse CSV output', () => {
        const codebolt = sharedCodebolt();

        const csvString = 'name,age\nJohn,30\nJane,25';
        const result = codebolt.outputparsers.parseCSV(csvString);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.parsed).toBeDefined();
        expect(Array.isArray(result.parsed)).toBe(true);

        // AskUserQuestion: Verify CSV parsing
        console.log('✅ AskUserQuestion: Was CSV parsed successfully?');
        console.log('   Input:', csvString);
        console.log('   Success:', result.success);
        console.log('   Rows parsed:', result.parsed?.length);
    });

    test('should parse text output into lines', () => {
        const codebolt = sharedCodebolt();

        const text = 'Line 1\nLine 2\nLine 3';
        const result = codebolt.outputparsers.parseText(text);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.parsed).toEqual(['Line 1', 'Line 2', 'Line 3']);

        // AskUserQuestion: Verify text parsing
        console.log('✅ AskUserQuestion: Was text parsed into lines successfully?');
        console.log('   Input:', text);
        console.log('   Success:', result.success);
        console.log('   Lines parsed:', result.parsed?.length);
    });

    test('should parse errors from output', () => {
        const codebolt = sharedCodebolt();

        const output = 'Some log\nError: Something went wrong\nAnother log\nError: Another error';
        const errors = codebolt.outputparsers.parseErrors(output);

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBeGreaterThan(0);

        // AskUserQuestion: Verify error parsing
        console.log('✅ AskUserQuestion: Were errors parsed successfully?');
        console.log('   Output:', output);
        console.log('   Errors found:', errors.length);
        console.log('   Errors:', errors);
    });

    test('should parse warnings from output', () => {
        const codebolt = sharedCodebolt();

        const output = 'Some log\nWarning: This is a warning\nAnother log\nWarning: Another warning';
        const warnings = codebolt.outputparsers.parseWarnings(output);

        expect(warnings).toBeDefined();
        expect(Array.isArray(warnings)).toBe(true);
        expect(warnings.length).toBeGreaterThan(0);

        // AskUserQuestion: Verify warning parsing
        console.log('✅ AskUserQuestion: Were warnings parsed successfully?');
        console.log('   Output:', output);
        console.log('   Warnings found:', warnings.length);
        console.log('   Warnings:', warnings);
    });

    test('should handle empty output in parsers', () => {
        const codebolt = sharedCodebolt();

        // Test empty text parsing
        const textResult = codebolt.outputparsers.parseText('');
        expect(textResult.success).toBe(true);
        expect(textResult.parsed).toEqual([]);

        // Test empty error parsing
        const errorResult = codebolt.outputparsers.parseErrors('No errors here');
        expect(errorResult).toEqual([]);

        // Test empty warning parsing
        const warningResult = codebolt.outputparsers.parseWarnings('No warnings here');
        expect(warningResult).toEqual([]);

        // AskUserQuestion: Verify empty output handling
        console.log('✅ AskUserQuestion: Was empty output handled correctly?');
        console.log('   Text parsing result:', textResult.parsed);
        console.log('   Error parsing result:', errorResult);
        console.log('   Warning parsing result:', warningResult);
    });
});
