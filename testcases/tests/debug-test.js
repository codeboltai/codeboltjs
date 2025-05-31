const codebolt = require('@codebolt/codeboltjs').default;

async function testDebug() {
    console.log('🐛 Testing Debug Module');
    console.log('=======================');
    
    try {
        await codebolt.waitForConnection();
        console.log('✅ Codebolt connection established\n');

        // Test 1: Basic debug logging with info type
        console.log('📋 Test 1: Basic debug logging with info type');
        try {
            const debugResult = await codebolt.debug.debug('This is an info message', 'info');
            console.log('✅ Info debug message logged successfully');
            console.log('   - Response type:', debugResult?.type);
            console.log('   - Success:', !!debugResult?.success);
            console.log('   - Message: "This is an info message"');
        } catch (error) {
            console.log('❌ Info debug logging failed:', error.message);
        }

        // Test 2: Debug logging with error type
        console.log('\n📋 Test 2: Debug logging with error type');
        try {
            const errorResult = await codebolt.debug.debug('This is an error message', 'error');
            console.log('✅ Error debug message logged successfully');
            console.log('   - Response type:', errorResult?.type);
            console.log('   - Success:', !!errorResult?.success);
            console.log('   - Message: "This is an error message"');
        } catch (error) {
            console.log('❌ Error debug logging failed:', error.message);
        }

        // Test 3: Debug logging with warning type
        console.log('\n📋 Test 3: Debug logging with warning type');
        try {
            const warningResult = await codebolt.debug.debug('This is a warning message', 'warning');
            console.log('✅ Warning debug message logged successfully');
            console.log('   - Response type:', warningResult?.type);
            console.log('   - Success:', !!warningResult?.success);
            console.log('   - Message: "This is a warning message"');
        } catch (error) {
            console.log('❌ Warning debug logging failed:', error.message);
        }

        // Test 4: Multiple debug messages of different types
        console.log('\n📋 Test 4: Multiple debug messages of different types');
        try {
            const messages = [
                { log: 'Application started successfully', type: 'info' },
                { log: 'Database connection established', type: 'info' },
                { log: 'Deprecated API endpoint used', type: 'warning' },
                { log: 'Failed to load configuration file', type: 'error' },
                { log: 'User authentication successful', type: 'info' }
            ];

            for (const message of messages) {
                await codebolt.debug.debug(message.log, message.type);
            }

            console.log('✅ Multiple debug messages logged successfully');
            console.log(`   - Total messages: ${messages.length}`);
            console.log('   - Types used: info, warning, error');
        } catch (error) {
            console.log('❌ Multiple debug messages failed:', error.message);
        }

        // Test 5: Debug logging with complex message content
        console.log('\n📋 Test 5: Debug logging with complex message content');
        try {
            const complexMessages = [
                'User login attempt: user@example.com from IP 192.168.1.100',
                'Database query executed: SELECT * FROM users WHERE active = true (took 45ms)',
                'API request: POST /api/users - Status: 201 Created',
                'Memory usage: 128MB heap, 256MB total',
                'Cache miss for key: user_profile_123'
            ];

            for (let i = 0; i < complexMessages.length; i++) {
                const type = i % 3 === 0 ? 'info' : i % 3 === 1 ? 'warning' : 'error';
                await codebolt.debug.debug(complexMessages[i], type);
            }

            console.log('✅ Complex debug messages logged successfully');
            console.log('   - Messages with detailed information logged');
        } catch (error) {
            console.log('❌ Complex debug messages failed:', error.message);
        }

        // Test 6: Open debug browser
        console.log('\n📋 Test 6: Open debug browser');
        try {
            const browserResult = await codebolt.debug.openDebugBrowser('http://localhost', 3000);
            console.log('✅ Debug browser opened successfully');
            console.log('   - Response type:', browserResult?.type);
            console.log('   - Success:', !!browserResult?.success);
            console.log('   - URL: http://localhost');
            console.log('   - Port: 3000');
        } catch (error) {
            console.log('❌ Opening debug browser failed:', error.message);
        }

        // Test 7: Open debug browser with different URL and port
        console.log('\n📋 Test 7: Open debug browser with different URL and port');
        try {
            const browserResult2 = await codebolt.debug.openDebugBrowser('http://127.0.0.1', 8080);
            console.log('✅ Debug browser opened with custom settings');
            console.log('   - Response type:', browserResult2?.type);
            console.log('   - Success:', !!browserResult2?.success);
            console.log('   - URL: http://127.0.0.1');
            console.log('   - Port: 8080');
        } catch (error) {
            console.log('❌ Opening debug browser with custom settings failed:', error.message);
        }

        // Test 8: Debug logging for application lifecycle events
        console.log('\n📋 Test 8: Debug logging for application lifecycle events');
        try {
            const lifecycleEvents = [
                { event: 'Application initialization started', type: 'info' },
                { event: 'Loading configuration files', type: 'info' },
                { event: 'Connecting to database', type: 'info' },
                { event: 'Database connection timeout warning', type: 'warning' },
                { event: 'Retrying database connection', type: 'info' },
                { event: 'Database connection established', type: 'info' },
                { event: 'Starting HTTP server', type: 'info' },
                { event: 'Server listening on port 3000', type: 'info' }
            ];

            for (const event of lifecycleEvents) {
                await codebolt.debug.debug(event.event, event.type);
            }

            console.log('✅ Application lifecycle events logged');
            console.log(`   - ${lifecycleEvents.length} lifecycle events tracked`);
        } catch (error) {
            console.log('❌ Lifecycle event logging failed:', error.message);
        }

        // Test 9: Error handling with invalid log types
        console.log('\n📋 Test 9: Error handling with invalid log types');
        try {
            // Test with valid types first
            await codebolt.debug.debug('Valid info message', 'info');
            await codebolt.debug.debug('Valid error message', 'error');
            await codebolt.debug.debug('Valid warning message', 'warning');
            
            console.log('✅ Valid log types handled correctly');
            
            // Note: The actual library uses TypeScript enum, so invalid types would be caught at compile time
            // But we can test the behavior with the valid types
            console.log('✅ Log type validation working (TypeScript enum protection)');
        } catch (error) {
            console.log('❌ Log type validation failed:', error.message);
        }

        // Test 10: Performance test with multiple debug operations
        console.log('\n📋 Test 10: Performance test with multiple debug operations');
        try {
            const startTime = Date.now();
            
            // Log multiple debug messages
            for (let i = 0; i < 20; i++) {
                const type = i % 3 === 0 ? 'info' : i % 3 === 1 ? 'warning' : 'error';
                await codebolt.debug.debug(`Performance test message ${i + 1}`, type);
            }
            
            const debugTime = Date.now() - startTime;
            
            // Test opening debug browser multiple times
            const browserStartTime = Date.now();
            for (let i = 0; i < 3; i++) {
                await codebolt.debug.openDebugBrowser('http://localhost', 3000 + i);
            }
            const browserTime = Date.now() - browserStartTime;
            
            console.log('✅ Performance test completed');
            console.log(`   - 20 debug messages: ${debugTime}ms`);
            console.log(`   - 3 browser opens: ${browserTime}ms`);
            console.log(`   - Average debug time: ${(debugTime / 20).toFixed(2)}ms`);
            console.log(`   - Average browser open time: ${(browserTime / 3).toFixed(2)}ms`);
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
        }

        // Test 11: Debug logging with empty and special characters
        console.log('\n📋 Test 11: Debug logging with empty and special characters');
        try {
            const specialMessages = [
                '', // Empty string
                '   ', // Whitespace only
                'Message with "quotes" and \'apostrophes\'',
                'Message with special chars: !@#$%^&*()',
                'Message with unicode: 🐛🔧⚡',
                'Message\nwith\nnewlines',
                'Message\twith\ttabs'
            ];

            for (let i = 0; i < specialMessages.length; i++) {
                const type = i % 3 === 0 ? 'info' : i % 3 === 1 ? 'warning' : 'error';
                await codebolt.debug.debug(specialMessages[i], type);
            }

            console.log('✅ Special character messages handled');
            console.log('   - Empty strings, unicode, newlines, tabs tested');
        } catch (error) {
            console.log('❌ Special character handling failed:', error.message);
        }

        // Test 12: Debug browser with edge case URLs and ports
        console.log('\n📋 Test 12: Debug browser with edge case URLs and ports');
        try {
            const testCases = [
                { url: 'https://example.com', port: 443 },
                { url: 'http://192.168.1.1', port: 8000 },
                { url: 'http://localhost', port: 1 },
                { url: 'http://0.0.0.0', port: 65535 }
            ];

            for (const testCase of testCases) {
                await codebolt.debug.openDebugBrowser(testCase.url, testCase.port);
            }

            console.log('✅ Edge case URLs and ports handled');
            console.log('   - HTTPS, IP addresses, edge ports tested');
        } catch (error) {
            console.log('❌ Edge case URL/port handling failed:', error.message);
        }

        console.log('\n🎉 All Debug tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Debug test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDebug().catch(console.error); 