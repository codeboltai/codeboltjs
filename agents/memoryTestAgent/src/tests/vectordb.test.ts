import codebolt from '@codebolt/codeboltjs';
import { log, assert } from './helpers';

export async function testVectorDB() {
    await log('\n══════════════════════════════════════');
    await log('  VECTOR DB TESTS');
    await log('══════════════════════════════════════');

    try {
        // 1. Add Vector Item — simple text
        await log('\n1. Add Vector Item — text');
        const add1 = await codebolt.vectordb.addVectorItem({
            key: `vec_test_${Date.now()}`,
            text: 'This is a test document for vector search about machine learning',
            metadata: { source: 'memoryTestAgent', category: 'ml' }
        });
        await assert(!!add1, 'addVectorItem text');

        // 2. Add Vector Item — code snippet
        await log('\n2. Add Vector Item — code');
        const add2 = await codebolt.vectordb.addVectorItem({
            key: `vec_code_${Date.now()}`,
            text: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
            metadata: { source: 'memoryTestAgent', category: 'code' }
        });
        await assert(!!add2, 'addVectorItem code');

        // 3. Add Vector Item — JSON content
        await log('\n3. Add Vector Item — JSON');
        const add3 = await codebolt.vectordb.addVectorItem({
            key: `vec_json_${Date.now()}`,
            text: JSON.stringify({ topic: 'AI', subtopics: ['NLP', 'CV', 'RL'] }),
            metadata: { source: 'memoryTestAgent', category: 'json' }
        });
        await assert(!!add3, 'addVectorItem JSON');

        // 4. Query Vector Item — semantic search
        await log('\n4. Query Vector Item — semantic');
        const q1 = await codebolt.vectordb.queryVectorItem('machine learning artificial intelligence');
        await assert(!!q1, 'queryVectorItem semantic');

        // 5. Query Vector Item — code search
        await log('\n5. Query Vector Item — code');
        const q2 = await codebolt.vectordb.queryVectorItem('recursive function fibonacci');
        await assert(!!q2, 'queryVectorItem code');

        // 6. Get Vector
        await log('\n6. Get Vector');
        const gv = await codebolt.vectordb.getVector('machine learning');
        await assert(!!gv, 'getVector');

        // 7. Query Vector Items — batch
        await log('\n7. Query Vector Items — batch');
        const batch = await codebolt.vectordb.queryVectorItems(
            ['machine learning', 'fibonacci function'] as any,
            '.codebolt/vectordb'
        );
        await assert(!!batch, 'queryVectorItems batch');

        // 8. Query with empty string
        await log('\n8. Query — empty string');
        const qEmpty = await codebolt.vectordb.queryVectorItem('');
        await assert(!!qEmpty, 'queryVectorItem empty string');

    } catch (err) {
        await log(`  ❌ Vector DB error: ${err}`);
    }
}
