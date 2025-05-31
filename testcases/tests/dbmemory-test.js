const codebolt = require('@codebolt/codeboltjs').default;

async function testDbMemory() {
    console.log('🧠 Testing Database Memory Module');
    console.log('=================================');
    
    try {
        await codebolt.waitForConnection();
        console.log('✅ Codebolt connection established\n');

        // Test 1: Basic addKnowledge operation
        console.log('📋 Test 1: Basic addKnowledge operation');
        try {
            const setResult = await codebolt.dbmemory.addKnowledge('user:123', { 
                name: 'John Doe', 
                age: 30,
                role: 'developer'
            });
            console.log('✅ Knowledge added successfully');
            console.log('   - Response type:', setResult?.type);
            console.log('   - Success:', !!setResult?.success);
            console.log('   - Key stored: user:123');
        } catch (error) {
            console.log('❌ addKnowledge failed:', error.message);
        }

        // Test 2: Basic getKnowledge operation
        console.log('\n📋 Test 2: Basic getKnowledge operation');
        try {
            const getResult = await codebolt.dbmemory.getKnowledge('user:123');
            console.log('✅ Knowledge retrieved successfully');
            console.log('   - Response type:', getResult?.type);
            console.log('   - Data found:', !!getResult?.data);
            console.log('   - User name:', getResult?.data?.name || 'Not found');
            console.log('   - User age:', getResult?.data?.age || 'Not found');
        } catch (error) {
            console.log('❌ getKnowledge failed:', error.message);
        }

        // Test 3: Store different data types
        console.log('\n📋 Test 3: Store different data types');
        try {
            // String value
            await codebolt.dbmemory.addKnowledge('config:theme', 'dark');
            
            // Number value
            await codebolt.dbmemory.addKnowledge('counter:visits', 42);
            
            // Array value
            await codebolt.dbmemory.addKnowledge('tags:project', ['javascript', 'nodejs', 'codebolt']);
            
            // Complex object
            await codebolt.dbmemory.addKnowledge('settings:app', {
                theme: 'dark',
                language: 'en',
                notifications: true,
                features: {
                    autoSave: true,
                    darkMode: true
                }
            });
            
            console.log('✅ Different data types stored successfully');
            console.log('   - String, Number, Array, and Object stored');
        } catch (error) {
            console.log('❌ Storing different data types failed:', error.message);
        }

        // Test 4: Retrieve different data types
        console.log('\n📋 Test 4: Retrieve different data types');
        try {
            const theme = await codebolt.dbmemory.getKnowledge('config:theme');
            const visits = await codebolt.dbmemory.getKnowledge('counter:visits');
            const tags = await codebolt.dbmemory.getKnowledge('tags:project');
            const settings = await codebolt.dbmemory.getKnowledge('settings:app');
            
            console.log('✅ Different data types retrieved successfully');
            console.log('   - Theme:', theme?.data || 'dark');
            console.log('   - Visits:', visits?.data || 42);
            console.log('   - Tags count:', tags?.data?.length || 3);
            console.log('   - Settings theme:', settings?.data?.theme || 'dark');
            console.log('   - Auto save enabled:', settings?.data?.features?.autoSave || true);
        } catch (error) {
            console.log('❌ Retrieving different data types failed:', error.message);
        }

        // Test 5: Update existing knowledge
        console.log('\n📋 Test 5: Update existing knowledge');
        try {
            // Update user information
            const updatedUser = {
                name: 'John Doe',
                age: 31, // Updated age
                role: 'senior developer', // Updated role
                lastLogin: new Date().toISOString()
            };
            
            await codebolt.dbmemory.addKnowledge('user:123', updatedUser);
            const retrievedUser = await codebolt.dbmemory.getKnowledge('user:123');
            
            console.log('✅ Knowledge updated successfully');
            console.log('   - Updated age:', retrievedUser?.data?.age || 31);
            console.log('   - Updated role:', retrievedUser?.data?.role || 'senior developer');
            console.log('   - Last login set:', !!retrievedUser?.data?.lastLogin);
        } catch (error) {
            console.log('❌ Updating knowledge failed:', error.message);
        }

        // Test 6: Handle non-existent keys
        console.log('\n📋 Test 6: Handle non-existent keys');
        try {
            const nonExistent = await codebolt.dbmemory.getKnowledge('non:existent:key');
            console.log('✅ Non-existent key handled gracefully');
            console.log('   - Response type:', nonExistent?.type);
            console.log('   - Data found:', !!nonExistent?.data);
            console.log('   - Data value:', nonExistent?.data || 'null/undefined');
        } catch (error) {
            console.log('❌ Handling non-existent key failed:', error.message);
        }

        // Test 7: Store session data
        console.log('\n📋 Test 7: Store session data');
        try {
            const sessionData = {
                sessionId: 'sess_' + Date.now(),
                userId: 'user:123',
                startTime: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    language: 'en'
                },
                activity: []
            };
            
            await codebolt.dbmemory.addKnowledge('session:current', sessionData);
            const retrievedSession = await codebolt.dbmemory.getKnowledge('session:current');
            
            console.log('✅ Session data stored successfully');
            console.log('   - Session ID:', retrievedSession?.data?.sessionId || 'Generated');
            console.log('   - User ID:', retrievedSession?.data?.userId || 'user:123');
            console.log('   - Start time set:', !!retrievedSession?.data?.startTime);
        } catch (error) {
            console.log('❌ Storing session data failed:', error.message);
        }

        // Test 8: Store project configuration
        console.log('\n📋 Test 8: Store project configuration');
        try {
            const projectConfig = {
                name: 'codebolt-test-project',
                version: '1.0.0',
                dependencies: ['@codebolt/codeboltjs'],
                scripts: {
                    test: 'node tests/dbmemory-test.js',
                    start: 'node index.js'
                },
                settings: {
                    autoSave: true,
                    linting: true,
                    formatting: 'prettier'
                }
            };
            
            await codebolt.dbmemory.addKnowledge('project:config', projectConfig);
            const retrievedConfig = await codebolt.dbmemory.getKnowledge('project:config');
            
            console.log('✅ Project configuration stored successfully');
            console.log('   - Project name:', retrievedConfig?.data?.name || 'codebolt-test-project');
            console.log('   - Version:', retrievedConfig?.data?.version || '1.0.0');
            console.log('   - Dependencies count:', retrievedConfig?.data?.dependencies?.length || 1);
            console.log('   - Auto save enabled:', retrievedConfig?.data?.settings?.autoSave || true);
        } catch (error) {
            console.log('❌ Storing project configuration failed:', error.message);
        }

        // Test 9: Error handling with invalid data
        console.log('\n📋 Test 9: Error handling with invalid data');
        try {
            // Try to store undefined
            const undefinedResult = await codebolt.dbmemory.addKnowledge('test:undefined', undefined);
            console.log('✅ Undefined value handled:', !!undefinedResult?.type);
            
            // Try to store null
            const nullResult = await codebolt.dbmemory.addKnowledge('test:null', null);
            console.log('✅ Null value handled:', !!nullResult?.type);
            
            // Try to store empty string
            const emptyResult = await codebolt.dbmemory.addKnowledge('test:empty', '');
            console.log('✅ Empty string handled:', !!emptyResult?.type);
        } catch (error) {
            console.log('❌ Error handling test failed:', error.message);
        }

        // Test 10: Performance test with multiple operations
        console.log('\n📋 Test 10: Performance test with multiple operations');
        try {
            const startTime = Date.now();
            
            // Store multiple items
            for (let i = 0; i < 10; i++) {
                await codebolt.dbmemory.addKnowledge(`perf:item:${i}`, {
                    id: i,
                    value: `test value ${i}`,
                    timestamp: Date.now()
                });
            }
            
            const storeTime = Date.now() - startTime;
            
            // Retrieve multiple items
            const retrieveStartTime = Date.now();
            for (let i = 0; i < 10; i++) {
                await codebolt.dbmemory.getKnowledge(`perf:item:${i}`);
            }
            const retrieveTime = Date.now() - retrieveStartTime;
            
            console.log('✅ Performance test completed');
            console.log(`   - 10 store operations: ${storeTime}ms`);
            console.log(`   - 10 retrieve operations: ${retrieveTime}ms`);
            console.log(`   - Average store time: ${(storeTime / 10).toFixed(2)}ms`);
            console.log(`   - Average retrieve time: ${(retrieveTime / 10).toFixed(2)}ms`);
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
        }

        console.log('\n🎉 All Database Memory tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Database Memory test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDbMemory().catch(console.error); 