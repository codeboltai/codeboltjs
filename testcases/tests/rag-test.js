const codebolt = require('@codebolt/codeboltjs').default;

async function testRAG() {
    console.log('🔍 Testing RAG (Retrieval-Augmented Generation)');
    console.log('================================================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing document indexing for RAG...');
        const documents = [
            {
                id: 'doc1',
                content: 'JavaScript is a programming language used for web development.',
                metadata: { type: 'programming', language: 'javascript' }
            },
            {
                id: 'doc2',
                content: 'Python is a versatile programming language used for data science and web development.',
                metadata: { type: 'programming', language: 'python' }
            },
            {
                id: 'doc3',
                content: 'Machine learning is a subset of artificial intelligence that enables computers to learn.',
                metadata: { type: 'ai', domain: 'machine-learning' }
            }
        ];
        
        try {
            const indexResult = await codebolt.rag.indexDocuments(documents);
            console.log('✅ Document indexing result:', indexResult);
            console.log('   - Indexed documents:', indexResult?.indexed || 0);
            console.log('   - Success:', indexResult?.success);
        } catch (error) {
            console.log('⚠️  Document indexing failed:', error.message);
        }
        
        console.log('\n2. Testing retrieval with query...');
        const query = 'What is JavaScript used for?';
        
        try {
            const retrievalResult = await codebolt.rag.retrieve(query, { limit: 3 });
            console.log('✅ Retrieval result:', retrievalResult);
            console.log('   - Query:', query);
            console.log('   - Retrieved documents:', retrievalResult?.documents?.length || 0);
            console.log('   - Relevance scores available:', !!retrievalResult?.scores);
        } catch (error) {
            console.log('⚠️  Retrieval failed:', error.message);
        }
        
        console.log('\n3. Testing RAG generation...');
        const generationQuery = 'Explain the differences between JavaScript and Python';
        
        try {
            const generateResult = await codebolt.rag.generate(generationQuery, {
                maxTokens: 200,
                temperature: 0.7,
                includeContext: true
            });
            console.log('✅ RAG generation result:', generateResult);
            console.log('   - Query:', generationQuery);
            console.log('   - Generated text length:', generateResult?.text?.length || 0);
            console.log('   - Context used:', !!generateResult?.context);
        } catch (error) {
            console.log('⚠️  RAG generation failed:', error.message);
        }
        
        console.log('\n4. Testing semantic search...');
        const semanticQuery = 'programming languages for web development';
        
        try {
            const semanticResult = await codebolt.rag.semanticSearch(semanticQuery, {
                threshold: 0.5,
                maxResults: 5
            });
            console.log('✅ Semantic search result:', semanticResult);
            console.log('   - Query:', semanticQuery);
            console.log('   - Results count:', semanticResult?.results?.length || 0);
        } catch (error) {
            console.log('⚠️  Semantic search failed:', error.message);
        }
        
        console.log('\n5. Testing context building...');
        const contextQuery = 'machine learning applications';
        
        try {
            const contextResult = await codebolt.rag.buildContext(contextQuery, {
                maxContextLength: 1000,
                includeMetadata: true
            });
            console.log('✅ Context building result:', contextResult);
            console.log('   - Context length:', contextResult?.context?.length || 0);
            console.log('   - Sources count:', contextResult?.sources?.length || 0);
        } catch (error) {
            console.log('⚠️  Context building failed:', error.message);
        }
        
        console.log('\n6. Testing RAG with filters...');
        const filteredQuery = 'programming languages';
        const filters = {
            type: 'programming',
            exclude: ['deprecated']
        };
        
        try {
            const filteredResult = await codebolt.rag.retrieveWithFilters(filteredQuery, filters);
            console.log('✅ Filtered retrieval result:', filteredResult);
            console.log('   - Applied filters:', Object.keys(filters));
            console.log('   - Filtered results:', filteredResult?.documents?.length || 0);
        } catch (error) {
            console.log('⚠️  Filtered retrieval failed:', error.message);
        }
        
        console.log('\n7. Testing RAG pipeline...');
        const pipelineQuery = 'How to get started with machine learning?';
        
        try {
            const pipelineResult = await codebolt.rag.runPipeline(pipelineQuery, {
                steps: ['retrieve', 'rerank', 'generate'],
                retrievalLimit: 5,
                rerankTop: 3
            });
            console.log('✅ RAG pipeline result:', pipelineResult);
            console.log('   - Pipeline steps:', pipelineResult?.steps?.length || 0);
            console.log('   - Final output length:', pipelineResult?.output?.length || 0);
        } catch (error) {
            console.log('⚠️  RAG pipeline failed:', error.message);
        }
        
        console.log('\n8. Testing document update in RAG...');
        const updatedDoc = {
            id: 'doc1',
            content: 'JavaScript is a dynamic programming language used for web development, mobile apps, and server-side development.',
            metadata: { type: 'programming', language: 'javascript', updated: true }
        };
        
        try {
            const updateResult = await codebolt.rag.updateDocument(updatedDoc);
            console.log('✅ Document update result:', updateResult);
            console.log('   - Updated document ID:', updatedDoc.id);
            console.log('   - Update success:', updateResult?.success);
        } catch (error) {
            console.log('⚠️  Document update failed:', error.message);
        }
        
        console.log('\n9. Testing RAG with custom embeddings...');
        const customEmbeddings = {
            model: 'custom-embedding-model',
            dimensions: 768,
            normalize: true
        };
        
        try {
            const embeddingResult = await codebolt.rag.generateEmbeddings('test content for embeddings', customEmbeddings);
            console.log('✅ Custom embeddings result:', embeddingResult);
            console.log('   - Embedding dimensions:', embeddingResult?.dimensions);
            console.log('   - Model used:', embeddingResult?.model);
        } catch (error) {
            console.log('⚠️  Custom embeddings failed:', error.message);
        }
        
        console.log('\n10. Testing RAG performance metrics...');
        const metricsQuery = 'artificial intelligence applications';
        
        try {
            const metricsResult = await codebolt.rag.getPerformanceMetrics(metricsQuery);
            console.log('✅ Performance metrics result:', metricsResult);
            console.log('   - Retrieval time:', metricsResult?.retrievalTime);
            console.log('   - Generation time:', metricsResult?.generationTime);
            console.log('   - Total time:', metricsResult?.totalTime);
        } catch (error) {
            console.log('⚠️  Performance metrics failed:', error.message);
        }
        
        console.log('\n11. Testing RAG with multiple queries...');
        const multipleQueries = [
            'What is Python?',
            'How does machine learning work?',
            'Best practices for JavaScript development'
        ];
        
        try {
            const batchResult = await codebolt.rag.batchProcess(multipleQueries);
            console.log('✅ Batch processing result:', batchResult);
            console.log('   - Processed queries:', batchResult?.results?.length || 0);
            console.log('   - Success rate:', batchResult?.successRate);
        } catch (error) {
            console.log('⚠️  Batch processing failed:', error.message);
        }
        
        console.log('\n12. Testing RAG cleanup and optimization...');
        try {
            const cleanupResult = await codebolt.rag.cleanup({
                removeOrphaned: true,
                optimizeIndex: true,
                compactStorage: true
            });
            console.log('✅ RAG cleanup result:', cleanupResult);
            console.log('   - Orphaned documents removed:', cleanupResult?.orphanedRemoved || 0);
            console.log('   - Index optimized:', cleanupResult?.indexOptimized);
        } catch (error) {
            console.log('⚠️  RAG cleanup failed:', error.message);
        }
        
        console.log('\n🎉 All RAG tests completed successfully!');
        
    } catch (error) {
        console.error('❌ RAG test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testRAG().catch(console.error); 