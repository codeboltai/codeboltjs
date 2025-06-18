const codebolt = require('@codebolt/codeboltjs');

async function testFSMCPTools() {
    console.log('📁 Testing FS MCP Tools');
    console.log('=======================');
    await codebolt.waitForConnection();
    try {
        // 1. read_file
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'read_file', { path: './README.md' });
            console.log('✅ read_file:', result?.success, result?.content ? 'Content loaded' : 'No content');
        } catch (e) { console.log('⚠️  read_file failed:', e.message); }
        // 2. list_files
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'list_files',{path: './'});
            console.log('✅ list_files:', result?.success, 'Files:', result?.files?.length || 0);
        } catch (e) { console.log('⚠️  list_files failed:', e.message); }
        // 3. write_file
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'write_file', { path: './test-fs-mcp.txt', content: 'test' });
            console.log('✅ write_file:', result?.success);
        } catch (e) { console.log('⚠️  write_file failed:', e.message); }
       
        // 5. grep_search
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'grep_search', { pattern: 'test', path: './' });
            console.log('✅ grep_search:', result?.success, 'Matches:', result?.matches?.length || 0);
        } catch (e) { console.log('⚠️  grep_search failed:', e.message); }
        // 6. search_files
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'search_files', { pattern: 'test', path: './' });
            console.log('✅ search_files:', result?.success, 'Files:', result?.files?.length || 0);
        } catch (e) { console.log('⚠️  search_files failed:', e.message); }
        // 7. list_code_definitions
        try {
            const result = await codebolt.tools.executeTool('codebolt.fs', 'list_code_definitions', { path: './src/index.js' });
            console.log('✅ list_code_definitions:', result?.success, 'Defs:', result?.definitions?.length || 0);
        } catch (e) { console.log('⚠️  list_code_definitions failed:', e.message); }
        console.log('🎉 FS MCP tools tests completed!');
    } catch (e) {
        console.error('❌ FS MCP tools test error:', e.message);
    }
}

testFSMCPTools(); 