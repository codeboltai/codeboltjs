const codebolt = require('@codebolt/codeboltjs').default;

async function testDebug() {
    console.log('🐛 Testing Debug Module');
    console.log('=======================');
    
    try {
        await codebolt.waitForConnection();
        console.log('✅ Codebolt connection established\n');

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

      
       



        console.log('\n🎉 All Debug tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Debug test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDebug().catch(console.error); 