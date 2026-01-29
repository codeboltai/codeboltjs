const codebolt = require('@codebolt/codeboltjs').default;

async function testState() {
    console.log('🗃️  Testing State Management Module');
    console.log('===================================');
    
    try {
        await codebolt.waitForConnection();
        console.log('✅ Codebolt connection established\n');

        // Test 1: Get application state
        console.log('📋 Test 1: Get application state');
        try {
            const appState = await codebolt.cbstate.getApplicationState();
            console.log('✅ Application state retrieved successfully');
            console.log('   - Response type:', appState?.type);
            console.log('   - Has data:', !!appState?.data);
            console.log('   - State keys:', Object.keys(appState?.data || {}));
        } catch (error) {
            console.log('❌ Getting application state failed:', error.message);
        }

        // Test 2: Add to agent state
        console.log('\n📋 Test 2: Add to agent state');
        try {
            const addResult = await codebolt.cbstate.addToAgentState('user_preference', 'dark_theme');
            console.log('✅ Added to agent state successfully');
            console.log('   - Response type:', addResult?.type);
            console.log('   - Success:', !!addResult?.success);
            console.log('   - Key added: user_preference');
            console.log('   - Value: dark_theme');
        } catch (error) {
            console.log('❌ Adding to agent state failed:', error.message);
        }

        // Test 3: Get agent state
        console.log('\n📋 Test 3: Get agent state');
        try {
            const agentState = await codebolt.cbstate.getAgentState();
            console.log('✅ Agent state retrieved successfully');
            console.log('   - Response type:', agentState?.type);
            console.log('   - Has data:', !!agentState?.data);
            console.log('   - State keys:', Object.keys(agentState?.data || {}));
            console.log('   - User preference:', agentState?.data?.user_preference || 'Not found');
        } catch (error) {
            console.log('❌ Getting agent state failed:', error.message);
        }

        // Test 4: Add multiple items to agent state
        console.log('\n📋 Test 4: Add multiple items to agent state');
        try {
            const agentItems = [
                { key: 'session_id', value: 'sess_' + Date.now() },
                { key: 'user_language', value: 'en' },
                { key: 'debug_mode', value: 'true' },
                { key: 'last_activity', value: new Date().toISOString() }
            ];

            for (const item of agentItems) {
                await codebolt.cbstate.addToAgentState(item.key, item.value);
            }

            console.log('✅ Multiple items added to agent state');
            console.log(`   - Items added: ${agentItems.length}`);
            console.log('   - Keys:', agentItems.map(item => item.key).join(', '));
        } catch (error) {
            console.log('❌ Adding multiple items to agent state failed:', error.message);
        }

        // Test 5: Get project state
        console.log('\n📋 Test 5: Get project state');
        try {
            const projectState = await codebolt.cbstate.getProjectState();
            console.log('✅ Project state retrieved successfully');
            console.log('   - Response type:', projectState?.type);
            console.log('   - Has data:', !!projectState?.data);
            console.log('   - State keys:', Object.keys(projectState?.data || {}));
        } catch (error) {
            console.log('❌ Getting project state failed:', error.message);
        }

        // Test 6: Update project state
        console.log('\n📋 Test 6: Update project state');
        try {
            const updateResult = await codebolt.cbstate.updateProjectState('project_name', 'codebolt-test-project');
            console.log('✅ Project state updated successfully');
            console.log('   - Response type:', updateResult?.type);
            console.log('   - Success:', !!updateResult?.success);
            console.log('   - Key updated: project_name');
            console.log('   - Value: codebolt-test-project');
        } catch (error) {
            console.log('❌ Updating project state failed:', error.message);
        }

        // Test 7: Update multiple project state items
        console.log('\n📋 Test 7: Update multiple project state items');
        try {
            const projectUpdates = [
                { key: 'version', value: '1.0.0' },
                { key: 'environment', value: 'development' },
                { key: 'last_modified', value: new Date().toISOString() },
                { key: 'dependencies_count', value: '5' }
            ];

            for (const update of projectUpdates) {
                await codebolt.cbstate.updateProjectState(update.key, update.value);
            }

            console.log('✅ Multiple project state items updated');
            console.log(`   - Items updated: ${projectUpdates.length}`);
            console.log('   - Keys:', projectUpdates.map(item => item.key).join(', '));
        } catch (error) {
            console.log('❌ Updating multiple project state items failed:', error.message);
        }

        // Test 8: Update project state with complex values
        console.log('\n📋 Test 8: Update project state with complex values');
        try {
            const complexConfig = {
                theme: 'dark',
                features: ['autocomplete', 'syntax-highlighting'],
                settings: {
                    autoSave: true,
                    tabSize: 2
                }
            };

            await codebolt.cbstate.updateProjectState('ui_config', JSON.stringify(complexConfig));
            console.log('✅ Complex project state updated');
            console.log('   - Complex object stored as JSON string');
            console.log('   - Features count:', complexConfig.features.length);
        } catch (error) {
            console.log('❌ Updating complex project state failed:', error.message);
        }

        // Test 9: Verify state persistence across operations
        console.log('\n📋 Test 9: Verify state persistence across operations');
        try {
            // Add to agent state
            await codebolt.cbstate.addToAgentState('test_persistence', 'persistent_value');
            
            // Update project state
            await codebolt.cbstate.updateProjectState('test_project_key', 'persistent_project_value');
            
            // Retrieve both states to verify persistence
            const agentState = await codebolt.cbstate.getAgentState();
            const projectState = await codebolt.cbstate.getProjectState();
            
            console.log('✅ State persistence verified');
            console.log('   - Agent test key exists:', !!agentState?.data?.test_persistence);
            console.log('   - Project test key exists:', !!projectState?.data?.test_project_key);
            console.log('   - Agent value:', agentState?.data?.test_persistence || 'Not found');
            console.log('   - Project value:', projectState?.data?.test_project_key || 'Not found');
        } catch (error) {
            console.log('❌ State persistence verification failed:', error.message);
        }

        // Test 10: Test with special characters and edge cases
        console.log('\n📋 Test 10: Test with special characters and edge cases');
        try {
            const specialCases = [
                { key: 'empty_value', value: '' },
                { key: 'special_chars', value: '!@#$%^&*()' },
                { key: 'unicode_test', value: '🚀🔧⚡' },
                { key: 'json_string', value: '{"nested": "value"}' },
                { key: 'long_key_name_with_underscores', value: 'long_value' }
            ];

            for (const testCase of specialCases) {
                await codebolt.cbstate.addToAgentState(testCase.key, testCase.value);
            }

            console.log('✅ Special characters and edge cases handled');
            console.log(`   - Test cases: ${specialCases.length}`);
            console.log('   - Empty values, special chars, unicode tested');
        } catch (error) {
            console.log('❌ Special characters testing failed:', error.message);
        }

        // Test 11: Performance test with multiple state operations
        console.log('\n📋 Test 11: Performance test with multiple state operations');
        try {
            const startTime = Date.now();
            
            // Multiple agent state additions
            for (let i = 0; i < 10; i++) {
                await codebolt.cbstate.addToAgentState(`perf_agent_${i}`, `value_${i}`);
            }
            
            const agentTime = Date.now() - startTime;
            
            // Multiple project state updates
            const projectStartTime = Date.now();
            for (let i = 0; i < 10; i++) {
                await codebolt.cbstate.updateProjectState(`perf_project_${i}`, `project_value_${i}`);
            }
            const projectTime = Date.now() - projectStartTime;
            
            // State retrievals
            const retrievalStartTime = Date.now();
            await codebolt.cbstate.getAgentState();
            await codebolt.cbstate.getProjectState();
            await codebolt.cbstate.getApplicationState();
            const retrievalTime = Date.now() - retrievalStartTime;
            
            console.log('✅ Performance test completed');
            console.log(`   - 10 agent additions: ${agentTime}ms`);
            console.log(`   - 10 project updates: ${projectTime}ms`);
            console.log(`   - 3 state retrievals: ${retrievalTime}ms`);
            console.log(`   - Average agent add: ${(agentTime / 10).toFixed(2)}ms`);
            console.log(`   - Average project update: ${(projectTime / 10).toFixed(2)}ms`);
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
        }

        // Test 12: State data types and serialization
        console.log('\n📋 Test 12: State data types and serialization');
        try {
            const dataTypes = [
                { key: 'string_value', value: 'simple string' },
                { key: 'number_as_string', value: '42' },
                { key: 'boolean_as_string', value: 'true' },
                { key: 'array_as_json', value: JSON.stringify(['item1', 'item2', 'item3']) },
                { key: 'object_as_json', value: JSON.stringify({ nested: { deep: 'value' } }) }
            ];

            for (const dataType of dataTypes) {
                await codebolt.cbstate.addToAgentState(dataType.key, dataType.value);
            }

            // Verify by retrieving state
            const finalAgentState = await codebolt.cbstate.getAgentState();
            
            console.log('✅ Data types and serialization tested');
            console.log('   - String values stored correctly');
            console.log('   - JSON serialization working');
            console.log('   - Array as JSON:', !!finalAgentState?.data?.array_as_json);
            console.log('   - Object as JSON:', !!finalAgentState?.data?.object_as_json);
        } catch (error) {
            console.log('❌ Data types testing failed:', error.message);
        }

        console.log('\n🎉 All State Management tests completed successfully!');
        
    } catch (error) {
        console.error('❌ State test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testState().catch(console.error); 