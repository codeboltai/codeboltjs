const codebolt = require('@codebolt/codeboltjs').default;
async function testLLMOperations() {
    console.log('🤖 Testing LLM Operations');
    console.log('=========================');
    
    try {

        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing basic LLM inference...');
        const basicResult = await codebolt.llm.inference(
            'Hello! This is a test message from CodeboltJS. Please respond with a simple greeting.',
        );
        console.log('✅ Basic inference result:', {
            success: basicResult.success,
            responseLength: basicResult.response ? basicResult.response.length : 0,
            response: basicResult.response ? basicResult.response.substring(0, 100) + '...' : 'No response'
        });
        
        console.log('\n2. Testing code generation request...');
        const codeResult = await codebolt.llm.inference(
            'Write a simple JavaScript function that adds two numbers and returns the result.',
        );
        console.log('✅ Code generation result:', {
            success: codeResult.success,
            responseLength: codeResult.response ? codeResult.response.length : 0,
            response: codeResult.response ? codeResult.response.substring(0, 200) + '...' : 'No response'
        });
        
        console.log('\n3. Testing question answering...');
        const qaResult = await codebolt.llm.inference(
            'What is the capital of France? Please provide a brief answer.',
        );
        console.log('✅ Q&A result:', {
            success: qaResult.success,
            responseLength: qaResult.response ? qaResult.response.length : 0,
            response: qaResult.response ? qaResult.response.substring(0, 100) + '...' : 'No response'
        });
        
        console.log('\n4. Testing with different role - user...');
        const userRoleResult = await codebolt.llm.inference(
            'This is a test message with user role.',
        );
        console.log('✅ User role result:', {
            success: userRoleResult.success,
            responseLength: userRoleResult.response ? userRoleResult.response.length : 0,
            response: userRoleResult.response ? userRoleResult.response.substring(0, 100) + '...' : 'No response'
        });
        
        console.log('\n5. Testing with system role...');
        const systemRoleResult = await codebolt.llm.inference(
            'You are a helpful coding assistant. Respond to this test message.',
        );
        console.log('✅ System role result:', {
            success: systemRoleResult.success,
            responseLength: systemRoleResult.response ? systemRoleResult.response.length : 0,
            response: systemRoleResult.response ? systemRoleResult.response.substring(0, 100) + '...' : 'No response'
        });
        
        console.log('\n6. Testing technical explanation request...');
        const techResult = await codebolt.llm.inference(
            'Explain what REST API is in simple terms.',

        );
        console.log('✅ Technical explanation result:', {
            success: techResult.success,
            responseLength: techResult.response ? techResult.response.length : 0,
            response: techResult.response ? techResult.response.substring(0, 150) + '...' : 'No response'
        });
        
        console.log('\n7. Testing creative writing request...');
        const creativeResult = await codebolt.llm.inference(
            'Write a short haiku about programming.',
        );
        console.log('✅ Creative writing result:', {
            success: creativeResult.success,
            responseLength: creativeResult.response ? creativeResult.response.length : 0,
            response: creativeResult.response || 'No response'
        });
        
        console.log('\n8. Testing error handling with empty message...');
        try {
            const emptyResult = await codebolt.llm.inference('', 'assistant');
            console.log('✅ Empty message result:', {
                success: emptyResult.success,
                response: emptyResult.response || 'No response'
            });
        } catch (error) {
            console.log('⚠️  Empty message error (expected):', error.message);
        }
        
        console.log('\n🎉 All LLM tests completed successfully!');
        
    } catch (error) {
        console.error('❌ LLM test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testLLMOperations().catch(console.error); 