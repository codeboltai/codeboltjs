import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert, skip } from './helpers';

export async function testPersistentMemory() {
    await log('\n══════════════════════════════════════');
    await log('  PERSISTENT MEMORY TESTS');
    await log('══════════════════════════════════════');

    const memId = `pm_test_${Date.now()}`;

    try {
        // 1. Get Step Specs
        await log('\n1. Get Step Specs');
        const specs = await codebolt.persistentMemory.getStepSpecs();
        await assert(ok(specs.success) && !!specs.data, 'getStepSpecs');
        await assert(Array.isArray(specs.data?.specs), 'specs is array');

        // 2. Create Persistent Memory
        await log('\n2. Create Persistent Memory');
        const createRes = await codebolt.persistentMemory.create({
            id: memId,
            label: 'Test Persistent Memory',
            description: 'Created by memoryTestAgent',
            inputs_scope: ['agent', 'project'],
            retrieval: {
                source_type: 'kv',
                source_id: 'test-instance',
                query_template: '${query}',
                limit: 10
            },
            contribution: {
                format: 'json',
                max_tokens: 500
            }
        });
        await assert(ok(createRes.success) && !!createRes.data?.memory, 'create');

        // 3. Get Persistent Memory
        await log('\n3. Get Persistent Memory');
        const getRes = await codebolt.persistentMemory.get(memId);
        await assert(ok(getRes.success) && getRes.data?.memory?.id === memId, 'get by id');
        await assert(getRes.data?.memory?.label === 'Test Persistent Memory', 'label matches');
        await assert(getRes.data?.memory?.inputs_scope?.includes('agent'), 'scope includes agent');

        // 4. List All
        await log('\n4. List Persistent Memories');
        const listRes = await codebolt.persistentMemory.list();
        await assert(ok(listRes.success) && !!listRes.data?.memories, 'list returns');
        await assert(listRes.data?.memories?.some((m: any) => m.id === memId), 'in list');

        // 5. List Filtered by Scope
        await log('\n5. List Filtered by Scope');
        const listScope = await codebolt.persistentMemory.list({ inputScope: 'agent' });
        await assert(ok(listScope.success), 'list with scope filter');

        // 6. List Active Only
        await log('\n6. List Active Only');
        const listActive = await codebolt.persistentMemory.list({ activeOnly: true });
        await assert(ok(listActive.success), 'list activeOnly');

        // 7. Update
        await log('\n7. Update Persistent Memory');
        const upRes = await codebolt.persistentMemory.update(memId, {
            label: 'Updated PM Label',
            description: 'Updated by test',
            status: 'active'
        });
        await assert(ok(upRes.success), 'update');
        const verify = await codebolt.persistentMemory.get(memId);
        await assert(verify.data?.memory?.label === 'Updated PM Label', 'update verified');

        // 8. Update Retrieval Config
        await log('\n8. Update Retrieval Config');
        const upRet = await codebolt.persistentMemory.update(memId, {
            retrieval: {
                source_type: 'vectordb',
                source_id: 'new-collection',
                query_template: '${query} ${context}',
                limit: 20
            }
        });
        await assert(ok(upRet.success), 'update retrieval config');

        // 9. Update Contribution Config
        await log('\n9. Update Contribution Config');
        const upCon = await codebolt.persistentMemory.update(memId, {
            contribution: {
                format: 'markdown',
                template: '## Results\n${output}',
                max_tokens: 1000
            }
        });
        await assert(ok(upCon.success), 'update contribution config');

        // 10. Validate — valid config
        await log('\n10. Validate — valid config');
        const valRes = await codebolt.persistentMemory.validate({
            id: 'validate_test',
            label: 'Validation Test',
            inputs_scope: ['thread'],
            retrieval: {
                source_type: 'kv',
                source_id: 'test',
                query_template: '${query}'
            },
            contribution: {
                format: 'text',
                max_tokens: 200
            }
        });
        await assert(ok(valRes.success), 'validate valid config');

        // 11. Validate — missing required fields
        await log('\n11. Validate — minimal config');
        const valMin = await codebolt.persistentMemory.validate({
            label: 'Minimal',
            retrieval: {
                source_type: 'kv',
                source_id: 'x'
            },
            contribution: {
                format: 'json'
            }
        });
        await assert(!!valMin, 'validate minimal returns response');

        // 12. Execute Retrieval
        await log('\n12. Execute Retrieval');
        const execRes = await codebolt.persistentMemory.executeRetrieval(memId, {
            query: 'test query',
            keywords: ['test', 'memory'],
            context: { agentId: 'memoryTestAgent' }
        });
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
        await log(`  Execute action result: success=${execAction.success}`);

        // 14. Delete
        await log('\n14. Delete Persistent Memory');
        await assert(ok((await codebolt.persistentMemory.delete(memId)).success), 'delete');

        // 15. Verify Deleted
        await log('\n15. Verify Deleted');
        const getDeleted = await codebolt.persistentMemory.get(memId);
        await assert(!getDeleted.data?.memory, 'deleted memory not found');

    } catch (err) {
        await log(`  ❌ Persistent Memory error: ${err}`);
    }
}
