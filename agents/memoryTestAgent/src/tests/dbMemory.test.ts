import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert } from './helpers';

export async function testDbMemory() {
    await log('\n══════════════════════════════════════');
    await log('  DB MEMORY TESTS');
    await log('══════════════════════════════════════');

    try {
        // 1. Add Knowledge — string value
        await log('\n1. Add Knowledge — string');
        const add1 = await codebolt.dbmemory.addKnowledge('test_string', 'Hello from memoryTestAgent');
        await assert(!!add1, 'addKnowledge string');

        // 2. Get Knowledge — string value
        await log('\n2. Get Knowledge — string');
        const get1 = await codebolt.dbmemory.getKnowledge('test_string');
        await assert(!!get1, 'getKnowledge string');

        // 3. Add Knowledge — number value
        await log('\n3. Add Knowledge — number');
        const add2 = await codebolt.dbmemory.addKnowledge('test_number', 42 as any);
        await assert(!!add2, 'addKnowledge number');

        // 4. Get Knowledge — number value
        await log('\n4. Get Knowledge — number');
        const get2 = await codebolt.dbmemory.getKnowledge('test_number');
        await assert(!!get2, 'getKnowledge number');

        // 5. Add Knowledge — JSON object
        await log('\n5. Add Knowledge — JSON');
        const add3 = await codebolt.dbmemory.addKnowledge('test_json', JSON.stringify({
            name: 'test',
            data: { nested: true, count: 5 }
        }) as any);
        await assert(!!add3, 'addKnowledge JSON');

        // 6. Get Knowledge — JSON object
        await log('\n6. Get Knowledge — JSON');
        const get3 = await codebolt.dbmemory.getKnowledge('test_json');
        await assert(!!get3, 'getKnowledge JSON');

        // 7. Overwrite existing key
        await log('\n7. Overwrite Key');
        const over = await codebolt.dbmemory.addKnowledge('test_string', 'Overwritten value');
        await assert(!!over, 'overwrite existing key');

        // 8. Get overwritten value
        await log('\n8. Get Overwritten');
        const getOver = await codebolt.dbmemory.getKnowledge('test_string');
        await assert(!!getOver, 'get overwritten value');

        // 9. Get non-existent key
        await log('\n9. Get Non-existent Key');
        const getMissing = await codebolt.dbmemory.getKnowledge('key_that_does_not_exist_' + Date.now());
        await assert(!!getMissing, 'get non-existent returns response');

        // 10. Add Knowledge — boolean
        await log('\n10. Add Knowledge — boolean');
        const addBool = await codebolt.dbmemory.addKnowledge('test_bool', true as any);
        await assert(!!addBool, 'addKnowledge boolean');

        // 11. Add Knowledge — array
        await log('\n11. Add Knowledge — array');
        const addArr = await codebolt.dbmemory.addKnowledge('test_array', JSON.stringify(['a', 'b', 'c']) as any);
        await assert(!!addArr, 'addKnowledge array');

        // 12. Get Knowledge — array
        await log('\n12. Get Knowledge — array');
        const getArr = await codebolt.dbmemory.getKnowledge('test_array');
        await assert(!!getArr, 'getKnowledge array');

    } catch (err) {
        await log(`  ❌ DB Memory error: ${err}`);
    }
}
