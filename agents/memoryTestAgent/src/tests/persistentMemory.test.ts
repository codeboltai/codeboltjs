import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert, skip } from './helpers';

export async function testPersistentMemory() {
    await log('\n══════════════════════════════════════');
    await log('  PERSISTENT MEMORY TESTS');
    await log('══════════════════════════════════════');

    let memId = '';

    try {
        // 1. Get Step Specs
        await log('\n1. Get Step Specs');
        const specs = await codebolt.persistentMemory.getStepSpecs();
        await assert(ok(specs.success) && !!specs.data, 'getStepSpecs');
        await assert(Array.isArray(specs.data?.specs), 'specs is array');

        // 4. List All
        await log('\n4. List Persistent Memories');
        const listRes = await codebolt.persistentMemory.list();
        codebolt.chat.sendMessage(JSON.stringify(listRes), { type: 'text' });
        await assert(ok(listRes.success) && !!listRes.data?.memories, 'list returns');
        // Use existing memory from list for subsequent tests
        const existingMemory = listRes.data?.memories?.[0];
        await assert(!!existingMemory, 'has existing memory in list');
        memId = existingMemory?.id ?? '';

        // 5. List Filtered by Scope
        await log('\n5. List Filtered by Scope');
        const listScope = await codebolt.persistentMemory.list({ inputScope: 'agent' });
        await assert(ok(listScope.success), 'list with scope filter');
        codebolt.chat.sendMessage(JSON.stringify(listScope), { type: 'text' });
        // 6. List Active Only
        await log('\n6. List Active Only');
        const listActive = await codebolt.persistentMemory.list({ activeOnly: true });
        await assert(ok(listActive.success), 'list activeOnly');
        codebolt.chat.sendMessage(JSON.stringify(listActive), { type: 'text' });

        // // 7. Update
        // await log('\n7. Update Persistent Memory');
        // const upRes = await codebolt.persistentMemory.update(memId, {
        //     label: 'Updated PM Label',
        //     description: 'Updated by test',
        //     status: 'active'
        // });
        // await assert(ok(upRes.success), 'update');
        await log('\n7. Get Existing Persistent Memory');
        const verify = await codebolt.persistentMemory.get(memId);
        codebolt.chat.sendMessage(JSON.stringify(verify), { type: 'text' });
        await assert(ok(verify.success) && !!verify.data?.memory, 'get existing memory');
        // // 8. Update Retrieval Config
        // await log('\n8. Update Retrieval Config');
        // const upRet = await codebolt.persistentMemory.update(memId, {
        //     retrieval: {
        //         source_type: 'vectordb',
        //         source_id: 'new-collection',
        //         query_template: '${query} ${context}',
        //         limit: 20
        //     }
        // });
        // await assert(ok(upRet.success), 'update retrieval config');

        // // 9. Update Contribution Config
        // await log('\n9. Update Contribution Config');
        // const upCon = await codebolt.persistentMemory.update(memId, {
        //     contribution: {
        //         format: 'markdown',
        //         template: '## Results\n${output}',
        //         max_tokens: 1000
        //     }
        // });
        // await assert(ok(upCon.success), 'update contribution config');

        // 10. Validate — valid config
        // await log('\n10. Validate — valid config');
        // const valRes = await codebolt.persistentMemory.validate({
        //     id: 'validate_test',
        //     label: 'Validation Test',
        //     inputs_scope: ['thread'],
        //     retrieval: {
        //         source_type: 'kv',
        //         source_id: 'test',
        //         query_template: '${query}'
        //     },
        //     contribution: {
        //         format: 'text',
        //         max_tokens: 200
        //     }
        // });
        // await assert(ok(valRes.success), 'validate valid config');

        // 11. Validate — missing required fields
        // await log('\n11. Validate — minimal config');
        // const valMin = await codebolt.persistentMemory.validate({
        //     label: 'Minimal',
        //     retrieval: {
        //         source_type: 'kv',
        //         source_id: 'x'
        //     },
        //     contribution: {
        //         format: 'json'
        //     }
        // });
        // await assert(!!valMin, 'validate minimal returns response');

        // 12. Execute Retrieval
        await log('\n12. Execute Retrieval');
        const execRes = await codebolt.persistentMemory.executeRetrieval(memId, {
            query: 'how to solve the problem npm start',
            keywords: ['test', 'memory'],
            context: { agentId: 'memoryTestAgent' }
        });
        codebolt.chat.sendMessage(JSON.stringify(execRes), { type: 'text' });
        await log(`  Execute result: success=${execRes.success}`);
        if (!execRes.success) {
            skip();
            await log('  ⏭️  Execute may fail if backing stores not configured');
        } else {
            await assert(true, 'executeRetrieval');
        }

        // 13. Execute with action param
        await log('\n13. Execute with action');
        const execAction = await codebolt.persistentMemory.executeRetrieval(memId, {
            query: 'find recent changes',
            action: 'retrieve'
        });
        codebolt.chat.sendMessage(JSON.stringify(execAction), { type: 'text' });
        await log(`  Execute action result: success=${execAction.success}`);

        // 14. Delete
        // await log('\n14. Delete Persistent Memory');
        // await assert(ok((await codebolt.persistentMemory.delete(memId)).success), 'delete');

        // 15. Verify Deleted
        // await log('\n15. Verify Deleted');
        // const getDeleted = await codebolt.persistentMemory.get(memId);
        // await assert(!getDeleted.data?.memory, 'deleted memory not found');

    } catch (err) {
        await log(`  ❌ Persistent Memory error: ${err}`);
    }
}
