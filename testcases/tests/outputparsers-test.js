const codebolt = require('@codebolt/codeboltjs').default;

async function testOutputParsers() {
    console.log('📄 Testing Output Parsers');
    console.log('=========================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing JSON parsing with valid JSON...');
        const validJson = '{"name": "test", "value": 123, "active": true}';
        const jsonResult = await codebolt.outputparsers.parseJSON(validJson);
        console.log('✅ JSON parse result:', jsonResult);
        console.log('   - Success:', jsonResult.success);
        console.log('   - Parsed data:', jsonResult.parsed);
        
        console.log('\n2. Testing JSON parsing with invalid JSON...');
        const invalidJson = '{"name": "test", "value": 123, "active":}';
        const invalidJsonResult = await codebolt.outputparsers.parseJSON(invalidJson);
        console.log('✅ Invalid JSON parse result:', invalidJsonResult);
        console.log('   - Success:', invalidJsonResult.success);
        console.log('   - Error:', invalidJsonResult.error?.message);
        
        console.log('\n3. Testing XML parsing...');
        const xmlData = '<root><item id="1">Test Item</item><item id="2">Another Item</item></root>';
        const xmlResult = await codebolt.outputparsers.parseXML(xmlData);
        console.log('✅ XML parse result:', xmlResult);
        console.log('   - Success:', xmlResult.success);
        
        console.log('\n4. Testing CSV parsing...');
        const csvData = 'name,age,city\nJohn,25,New York\nJane,30,Los Angeles\nBob,35,Chicago';
        const csvResult = await codebolt.outputparsers.parseCSV(csvData);
        console.log('✅ CSV parse result:', csvResult);
        console.log('   - Success:', csvResult.success);
        
        console.log('\n5. Testing text parsing...');
        const textData = 'Line 1\nLine 2\nLine 3\nLine 4';
        const textResult = await codebolt.outputparsers.parseText(textData);
        console.log('✅ Text parse result:', textResult);
        console.log('   - Success:', textResult.success);
        console.log('   - Lines count:', textResult.parsed.length);
        
        console.log('\n6. Testing empty string parsing...');
        const emptyResult = await codebolt.outputparsers.parseText('');
        console.log('✅ Empty text parse result:', emptyResult);
        
        console.log('\n7. Testing complex JSON object...');
        const complexJson = JSON.stringify({
            users: [
                { id: 1, name: 'Alice', roles: ['admin', 'user'] },
                { id: 2, name: 'Bob', roles: ['user'] }
            ],
            metadata: {
                total: 2,
                timestamp: new Date().toISOString()
            }
        });
        const complexJsonResult = await codebolt.outputparsers.parseJSON(complexJson);
        console.log('✅ Complex JSON parse result:', complexJsonResult);
        console.log('   - Users count:', complexJsonResult.parsed?.users?.length);
        
        console.log('\n🎉 All output parser tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Output parser test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testOutputParsers().catch(console.error); 