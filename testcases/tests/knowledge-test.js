const codebolt = require('@codebolt/codeboltjs').default;

async function testKnowledge() {
    console.log('🧠 Testing Knowledge Management');
    console.log('===============================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing knowledge storage...');
        const testData = {
            id: 'test-001',
            title: 'JavaScript Best Practices',
            content: 'Use const and let instead of var, prefer arrow functions, use async/await',
            tags: ['javascript', 'best-practices', 'es6'],
            category: 'programming',
            timestamp: new Date().toISOString()
        };
        const storeResult = await codebolt.knowledge.storeKnowledge(testData);
        console.log('✅ Knowledge store result:', storeResult);
        console.log('   - Stored:', storeResult.stored);
        console.log('   - Data ID:', storeResult.data.id);
        
        console.log('\n2. Testing knowledge retrieval with simple query...');
        const retrieveResult = await codebolt.knowledge.retrieveKnowledge('JavaScript');
        console.log('✅ Knowledge retrieve result:', retrieveResult);
        console.log('   - Query:', retrieveResult.query);
        console.log('   - Results count:', retrieveResult.results.length);
        
        console.log('\n3. Testing knowledge retrieval with complex query...');
        const complexQuery = 'best practices for async programming';
        const complexRetrieveResult = await codebolt.knowledge.retrieveKnowledge(complexQuery);
        console.log('✅ Complex query result:', complexRetrieveResult);
        console.log('   - Query:', complexRetrieveResult.query);
        
        console.log('\n4. Testing knowledge update...');
        const updateData = {
            ...testData,
            content: 'Updated: Use const and let instead of var, prefer arrow functions, use async/await, implement proper error handling',
            tags: [...testData.tags, 'error-handling'],
            lastModified: new Date().toISOString()
        };
        const updateResult = await codebolt.knowledge.updateKnowledge('test-001', updateData);
        console.log('✅ Knowledge update result:', updateResult);
        console.log('   - Updated:', updateResult.updated);
        console.log('   - ID:', updateResult.id);
        
        console.log('\n5. Testing knowledge storage with different data types...');
        const codeSnippet = {
            id: 'snippet-001',
            type: 'code',
            language: 'python',
            code: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
            `,
            description: 'Recursive fibonacci implementation',
            tags: ['python', 'algorithms', 'recursion']
        };
        const codeStoreResult = await codebolt.knowledge.storeKnowledge(codeSnippet);
        console.log('✅ Code snippet store result:', codeStoreResult);
        
        console.log('\n6. Testing knowledge retrieval with empty query...');
        const emptyQueryResult = await codebolt.knowledge.retrieveKnowledge('');
        console.log('✅ Empty query result:', emptyQueryResult);
        
        console.log('\n7. Testing knowledge storage with large data...');
        const largeData = {
            id: 'large-001',
            title: 'Complete API Documentation',
            content: 'A'.repeat(10000), // Large content
            metadata: {
                size: 'large',
                version: '1.0.0',
                endpoints: Array.from({length: 100}, (_, i) => `/api/endpoint${i}`)
            }
        };
        const largeStoreResult = await codebolt.knowledge.storeKnowledge(largeData);
        console.log('✅ Large data store result:', largeStoreResult);
        console.log('   - Content length:', largeStoreResult.data.content.length);
        
        console.log('\n8. Testing knowledge update with non-existent ID...');
        const nonExistentUpdate = await codebolt.knowledge.updateKnowledge('non-existent-id', {
            title: 'This should not exist'
        });
        console.log('✅ Non-existent update result:', nonExistentUpdate);
        
        console.log('\n9. Testing knowledge retrieval with special characters...');
        const specialQuery = 'JavaScript & TypeScript: Best Practices (2024)';
        const specialQueryResult = await codebolt.knowledge.retrieveKnowledge(specialQuery);
        console.log('✅ Special characters query result:', specialQueryResult);
        
        console.log('\n🎉 All knowledge management tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Knowledge test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testKnowledge().catch(console.error); 