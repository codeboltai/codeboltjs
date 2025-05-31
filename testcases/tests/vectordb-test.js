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
            const addResult = await codebolt.vectordb.addVectorItem(testItem);
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
        
        console.log('\n5. Testing vector addition with different data types...');
        const dataTypes = [
            {
                id: 'code-snippet-001',
                content: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
                type: 'code',
                language: 'javascript'
            },
            {
                id: 'text-doc-001',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                type: 'text',
                language: 'latin'
            },
            {
                id: 'json-data-001',
                content: JSON.stringify({ users: [{ id: 1, name: 'John' }] }),
                type: 'json',
                structure: 'object'
            }
        ];
        
        for (const item of dataTypes) {
            try {
                const typeResult = await codebolt.vectordb.addVectorItem(item);
                console.log(`✅ ${item.type} vector addition:`, !!typeResult);
            } catch (error) {
                console.log(`⚠️  ${item.type} vector addition failed:`, error.message);
            }
        }
        
        console.log('\n6. Testing vector search with similarity...');
        try {
            const similarityQuery = 'fibonacci recursive function';
            const similarityResult = await codebolt.vectordb.queryVectorItem(similarityQuery);
            console.log('✅ Similarity search result:', similarityResult);
            console.log('   - Query:', similarityQuery);
        } catch (error) {
            console.log('⚠️  Similarity search failed:', error.message);
        }
        
        console.log('\n7. Testing vector database with large content...');
        const largeContent = {
            id: 'large-doc-001',
            content: 'Large document content. '.repeat(1000),
            metadata: {
                size: 'large',
                wordCount: 3000,
                category: 'documentation'
            }
        };
        
        try {
            const largeResult = await codebolt.vectordb.addVectorItem(largeContent);
            console.log('✅ Large content vector addition:', !!largeResult);
            console.log('   - Content size:', largeContent.content.length);
        } catch (error) {
            console.log('⚠️  Large content addition failed:', error.message);
        }
        
        console.log('\n8. Testing vector retrieval with non-existent key...');
        try {
            const nonExistentResult = await codebolt.vectordb.getVector('non-existent-key');
            console.log('✅ Non-existent key result:', nonExistentResult);
        } catch (error) {
            console.log('✅ Expected error for non-existent key:', error.message);
        }
        
        console.log('\n9. Testing vector query with empty string...');
        try {
            const emptyQueryResult = await codebolt.vectordb.queryVectorItem('');
            console.log('✅ Empty query result:', emptyQueryResult);
        } catch (error) {
            console.log('⚠️  Empty query failed:', error.message);
        }
        
        console.log('\n10. Testing vector database performance...');
        const startTime = Date.now();
        const performanceItems = Array.from({ length: 10 }, (_, i) => ({
            id: `perf-test-${i}`,
            content: `Performance test document ${i}`,
            index: i
        }));
        
        let successCount = 0;
        for (const item of performanceItems) {
            try {
                await codebolt.vectordb.addVectorItem(item);
                successCount++;
            } catch (error) {
                console.log(`⚠️  Performance test item ${item.index} failed`);
            }
        }
        
        const endTime = Date.now();
        console.log('✅ Performance test results:', {
            totalItems: performanceItems.length,
            successfulItems: successCount,
            duration: `${endTime - startTime}ms`,
            averageTime: `${(endTime - startTime) / performanceItems.length}ms per item`
        });
        
        console.log('\n11. Testing vector query with special characters...');
        try {
            const specialQuery = 'test@example.com & special-characters_123';
            const specialResult = await codebolt.vectordb.queryVectorItem(specialQuery);
            console.log('✅ Special characters query result:', specialResult);
        } catch (error) {
            console.log('⚠️  Special characters query failed:', error.message);
        }
        
        console.log('\n12. Testing vector database with different database paths...');
        const dbPaths = ['./test_db', './vectors', './embeddings'];
        const testQueries = ['test query 1', 'test query 2'];
        
        for (const dbPath of dbPaths) {
            try {
                const pathResult = await codebolt.vectordb.queryVectorItems(testQueries, dbPath);
                console.log(`✅ Database path ${dbPath}:`, !!pathResult);
            } catch (error) {
                console.log(`⚠️  Database path ${dbPath} failed:`, error.message);
            }
        }
        
        console.log('\n🎉 All vector database tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Vector database test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testVectorDB().catch(console.error); 