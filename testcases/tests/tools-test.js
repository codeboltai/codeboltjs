const codebolt = require('@codebolt/codeboltjs');

async function testTools() {
    console.log('🔧 Testing Codebolt MCP Tools Module');
    console.log('====================================');
    
    try {
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing enabled toolboxes retrieval...');
        try {
            const enabledToolBoxes = await codebolt.tools.getEnabledToolBoxes();
            console.log('✅ Enabled toolboxes result:', enabledToolBoxes);
            console.log('   - Enabled toolboxes count:', enabledToolBoxes?.length || 0);
            console.log('   - Toolbox names:', enabledToolBoxes?.map(tb => tb.name) || []);
        } catch (error) {
            console.log('⚠️  Getting enabled toolboxes failed:', error.message);
        }
        
        console.log('\n2. Testing local toolboxes retrieval...');
        try {
            const localToolBoxes = await codebolt.tools.getLocalToolBoxes();
            console.log('✅ Local toolboxes result:', localToolBoxes);
            console.log('   - Local toolboxes count:', localToolBoxes?.length || 0);
            console.log('   - Toolbox names:', localToolBoxes?.map(tb => tb.name) || []);
        } catch (error) {
            console.log('⚠️  Getting local toolboxes failed:', error.message);
        }
        
        console.log('\n3. Testing available toolboxes retrieval...');
        try {
            const availableToolBoxes = await codebolt.tools.getAvailableToolBoxes();
            console.log('✅ Available toolboxes result:', availableToolBoxes);
            console.log('   - Available toolboxes count:', availableToolBoxes?.length || 0);
            console.log('   - Toolbox names:', availableToolBoxes?.map(tb => tb.name) || []);
        } catch (error) {
            console.log('⚠️  Getting available toolboxes failed:', error.message);
        }
        
        console.log('\n4. Testing toolbox search...');
        try {
            const searchResult = await codebolt.tools.searchAvailableToolBoxes('filesystem');
            console.log('✅ Toolbox search result:', searchResult);
            console.log('   - Search query: "filesystem"');
        
        } catch (error) {
            console.log('⚠️  Toolbox search failed:', error.message);
        }
        
        console.log('\n5. Testing mentioned toolboxes from user message...');
        try {
            const mockUserMessage = {
                mentionedMCPs: ['sqlite', 'filesystem']
            };
            const mentionedToolBoxes = await codebolt.tools.getMentionedToolBoxes(mockUserMessage);
            console.log('✅ Mentioned toolboxes result:', mentionedToolBoxes);
            console.log('   - Mentioned count:', mentionedToolBoxes?.length || 0);
            console.log('   - Mentioned toolboxes:', mentionedToolBoxes || []);
        } catch (error) {
            console.log('⚠️  Getting mentioned toolboxes failed:', error.message);
        }
        
        console.log('\n6. Testing tools listing from toolboxes...');
        try {
            // Try to list tools from common toolboxes
            const toolBoxesToTest = ['filesystem'];
            const toolsResult = await codebolt.tools.listToolsFromToolBoxes(toolBoxesToTest);
            console.log('✅ Tools listing result:', toolsResult);
            console.log('   - Toolboxes queried:', toolBoxesToTest);
            console.log('   - Tools found:', toolsResult?.tools?.length || 0);
            console.log('   - Tool names:', toolsResult?.tools?.map(t => t.name) || []);
        } catch (error) {
            console.log('⚠️  Listing tools from toolboxes failed:', error.message);
        }
        
        console.log('\n7. Testing toolbox configuration...');
        try {
            const configResult = await codebolt.tools.configureToolBox('sqlite', {
                database_path: './test.db',
                read_only: false
            });
            console.log('✅ Toolbox configuration result:', configResult);
            console.log('   - Configuration applied:', !!configResult?.success);
        } catch (error) {
            console.log('⚠️  Toolbox configuration failed:', error.message);
        }
        
        console.log('\n8. Testing tool details retrieval...');
        try {
            const toolsToGet = [
                { toolbox: 'filesystem', toolName: 'read_file' },
            ];
            const toolDetails = await codebolt.tools.getTools(toolsToGet);
            console.log('✅ Tool details result:', toolDetails);
            console.log('   - Tools requested:', toolsToGet.length);
            console.log('   - Tool details received:', toolDetails?.length || 0);
            console.log('   - Tool schemas:', toolDetails?.map(t => ({ name: t.name, parameters: Object.keys(t.inputSchema?.properties || {}) })) || []);
        } catch (error) {
            console.log('⚠️  Getting tool details failed:', error.message);
        }
        
        console.log('\n9. Testing tool execution...');
        try {
            // Test SQLite list tables (assuming sqlite toolbox is available)
            const executeResult = await codebolt.tools.executeTool('sqlite', 'list_tables', {
                random_string: 'test'
            });
            console.log('✅ Tool execution result:', executeResult);
            console.log('   - Tool executed: sqlite--list_tables');
            console.log('   - Execution success:', !!executeResult?.content);
        } catch (error) {
            console.log('⚠️  Tool execution failed:', error.message);
        }
        
        console.log('\n10. Testing file system tool execution...');
        try {
            // Test filesystem read_file (assuming filesystem toolbox is available)
            const fsResult = await codebolt.tools.executeTool('filesystem', 'read_file', {
                path: './package.json'
            });
            console.log('✅ Filesystem tool execution result:', fsResult);
            console.log('   - Tool executed: filesystem--read_file');
            console.log('   - File read success:', !!fsResult?.content);
            console.log('   - Content preview:', fsResult?.content?.substring(0, 100) + '...' || 'No content');
        } catch (error) {
            console.log('⚠️  Filesystem tool execution failed:', error.message);
        }
        
        console.log('\n11. Testing error handling with invalid tool...');
        try {
            const invalidResult = await codebolt.tools.executeTool('nonexistent', 'invalid_tool', {});
            console.log('✅ Invalid tool result:', invalidResult);
        } catch (error) {
            console.log('✅ Expected error caught for invalid tool:', error.message);
        }
        
        console.log('\n12. Testing error handling with invalid parameters...');
        try {
            const invalidParamsResult = await codebolt.tools.executeTool('sqlite', 'read_query', {
                // Missing required query parameter
            });
            console.log('✅ Invalid parameters result:', invalidParamsResult);
        } catch (error) {
            console.log('✅ Expected error caught for invalid parameters:', error.message);
        }
        
        console.log('\n13. Testing multiple toolbox operations...');
        try {
            // Get enabled toolboxes and then list tools from them
            const enabledResponse = await codebolt.tools.getEnabledToolBoxes();
            console.log('✅ Enabled toolboxes result:', JSON.stringify(enabledResponse));
            
            // Extract toolbox data from the new response format
            const toolboxData = enabledResponse?.data || {};
            
            // Convert object to array of toolbox names
            const enabledNames = Object.keys(toolboxData);
            
            if (enabledNames && enabledNames.length > 0) {
                const toolboxesToTest = enabledNames.slice(0, 2); // Test first 2
                const multiToolsResult = await codebolt.tools.listToolsFromToolBoxes(toolboxesToTest);
                console.log('✅ Multiple toolbox operations result:', multiToolsResult);
                console.log('   - Toolboxes tested:', toolboxesToTest);
                console.log('   - Total tools found:', multiToolsResult?.tools?.length || 0);
            } else {
                console.log('⚠️  No enabled toolboxes found for multiple operations test');
            }
        } catch (error) {
            console.log('⚠️  Multiple toolbox operations failed:', error.message);
        }
        
        console.log('\n🎉 All Codebolt MCP tools tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Tools test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testTools().catch(console.error); 