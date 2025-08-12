const codebolt = require('@codebolt/codeboltjs');

async function testCodeUtilsMCPTools() {
    console.log('🧩 Testing CodeUtils MCP Tools');
    console.log('==============================');
    await codebolt.waitForConnection();
    try {
        // 1. get_files_markdown
        try {
            const result = await codebolt.tools.executeTool('codebolt.code_utils', 'get_files_markdown', {});
            console.log('✅ get_files_markdown:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  get_files_markdown failed:', e.message); }
        // 2. get_js_tree
        try {
            const result = await codebolt.tools.executeTool('codebolt.code_utils', 'get_js_tree', { filePath: './tests/terminal-test.js' });
            console.log('✅ get_js_tree:', result?.success, 'Data:', !!result?.data);
        } catch (e) { console.log('⚠️  get_js_tree failed:', e.message); }
        // 3. perform_match
        try {
            const matcherDefinition = {
                owner: "eslint-compact",
                pattern: [{
                    regexp: "^(.+):\\sline\\s(\\d+),\\scol\\s(\\d+),\\s(Error|Warning|Info)\\s-\\s(.+)\\s\\((.+)\\)$",
                    file: 1,
                    line: 2,
                    column: 3,
                    severity: 4,
                    message: 5,
                    code: 6
                }]
            };
            const testProblems = [
                { line: "src/file1.js: line 10, col 5, Error - Unexpected console statement (no-console)", source: "test" },
                { line: "src/file2.js: line 25, col 8, Warning - 'var' used instead of 'let' or 'const' (no-var)", source: "test" },
                { line: "This should not match", source: "test" },
                {},
                { line: "src/file3.js: line 5, col 15, Info - Missing JSDoc comment (require-jsdoc)", source: "test" }
            ];
            const result = await codebolt.tools.executeTool('codebolt.code_utils', 'perform_match', { matcherDefinition, pattern: matcherDefinition.pattern, problems: testProblems });
            console.log('✅ perform_match:', result?.success);
        } catch (e) { console.log('⚠️  perform_match failed:', e.message); }
        // 4. get_matcher_list
        try {
            const result = await codebolt.tools.executeTool('codebolt.code_utils', 'get_matcher_list', {});
            console.log('✅ get_matcher_list:', result?.success, 'List:', result?.list?.length || 0);
        } catch (e) { console.log('⚠️  get_matcher_list failed:', e.message); }
        // 5. get_match_detail
        try {
            const result = await codebolt.tools.executeTool('codebolt.code_utils', 'get_match_detail', { matcherId: 'xmllint' });
            console.log('✅ get_match_detail:', result?.success, 'Detail:', !!result?.detail);
        } catch (e) { console.log('⚠️  get_match_detail failed:', e.message); }
        console.log('🎉 CodeUtils MCP tools tests completed!');
    } catch (e) {
        console.error('❌ CodeUtils MCP tools test error:', e.message);
    }
}

testCodeUtilsMCPTools(); 