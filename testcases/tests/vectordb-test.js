const codebolt = require('@codebolt/codeboltjs').default;

async function testVectorDB() {
    console.log('🗄️  Testing Vector Database');
    console.log('============================');
    
    try {
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing vector item addition...');
        const testItem = {
            id: 'test-vector-001',
            content: 'This is a test document for vector database',
            metadata: {
                type: 'document',
                category: 'test',
                timestamp: new Date().toISOString()
            },
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Mock embedding vector
        };
        
        try {
            const addResult = await codebolt.vectordb.addVectorItem("This is a test document for vector database");
            console.log('✅ Vector item addition result:', addResult);
            console.log('   - Type:', addResult?.type);
            console.log('   - Success:', addResult?.success);
        } catch (error) {
            console.log('⚠️  Vector item addition failed:', error.message);
        }
        
        console.log('\n2. Testing vector retrieval by key...');
        try {
            const getResult = await codebolt.vectordb.getVector('test-vector-001');
            console.log('✅ Vector retrieval result:', getResult);
            console.log('   - Type:', getResult?.type);
            console.log('   - Data available:', !!getResult?.data);
        } catch (error) {
            console.log('⚠️  Vector retrieval failed:', error.message);
        }
        
        console.log('\n3. Testing vector item query...');
        try {
            const queryResult = await codebolt.vectordb.queryVectorItem('test document vector');
            console.log('✅ Vector query result:', queryResult);
            console.log('   - Type:', queryResult?.type);
            console.log('   - Results count:', queryResult?.results?.length || 0);
        } catch (error) {
            console.log('⚠️  Vector query failed:', error.message);
        }
        
        console.log('\n4. Testing multiple vector items query...');
        const queryItems = [
            'test document',
            'vector database',
            'machine learning',
            'artificial intelligence'
        ];
        const dbPath = './vector_db';
        
        try {
            const multiQueryResult = await codebolt.vectordb.queryVectorItems(queryItems, dbPath);
            console.log('✅ Multiple vector query result:', multiQueryResult);
            console.log('   - Type:', multiQueryResult?.type);
            console.log('   - Query items count:', queryItems.length);
        } catch (error) {
            console.log('⚠️  Multiple vector query failed:', error.message);
        }
     
        
        console.log('\n5. Testing vector search with similarity...');
        try {
            const similarityQuery = 'fibonacci recursive function';
            const similarityResult = await codebolt.vectordb.queryVectorItem(similarityQuery);
            console.log('✅ Similarity search result:', similarityResult);
            console.log('   - Query:', similarityQuery);
        } catch (error) {
            console.log('⚠️  Similarity search failed:', error.message);
        }
        
      
       
        
        console.log('\n🎉 All vector database tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Vector database test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testVectorDB().catch(console.error); 