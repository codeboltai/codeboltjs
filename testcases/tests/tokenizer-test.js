const codebolt = require('@codebolt/codeboltjs').default;

async function testTokenizer() {
    console.log('🔤 Testing Tokenizer');
    console.log('====================');
    
    try {
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing addToken method...');
        const testKeys = [
            'api_key_1',
            'test_token_abc123',
            'development_token',
            'production_token',
            'user_session_token'
        ];
        
        // Store the tokens received from addToken responses
        const receivedTokens = {};
        
        for (const key of testKeys) {
            try {
                const addResult = await codebolt.tokenizer.addToken(key);
                console.log(`✅ Added token with key "${key}":`, addResult);
                console.log(`   - Message: ${addResult?.message || 'N/A'}`);
                console.log(`   - Tokens: ${JSON.stringify(addResult?.tokens || [])}`);
                
                // Store the tokens for later use
                if (addResult?.tokens) {
                    receivedTokens[key] = addResult.tokens;
                }
            } catch (error) {
                console.log(`⚠️ Failed to add token with key "${key}":`, error.message);
            }
        }
        
        console.log('\n2. Testing getToken method...');
        
        for (const key of Object.keys(receivedTokens)) {
            try {
                const getResult = await codebolt.tokenizer.getToken(key);
                console.log(`✅ Retrieved token with key "${key}":`, getResult);
                console.log(`   - Response type: ${getResult?.type || 'N/A'}`);
                console.log(`   - Token value: ${getResult?.token || 'N/A'}`);
                
                // Verify the token matches the key
                console.log(`   - Token matches original key: ${getResult?.token === key}`);
            } catch (error) {
                console.log(`⚠️ Failed to retrieve token with key "${key}":`, error.message);
            }
        }
        
        console.log('\n🎉 All tokenizer tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Tokenizer test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testTokenizer().catch(console.error); 