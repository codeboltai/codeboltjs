import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert, skip } from './helpers';

export async function testMemoryIngestion() {
    await log('\n══════════════════════════════════════');
    await log('  MEMORY INGESTION TESTS');
    await log('══════════════════════════════════════');

    let pipelineId = '';

    try {
        // 1. Get Processor Specs
        await log('\n1. Get Processor Specs');
        const specs = await codebolt.memoryIngestion.getProcessorSpecs();
        await assert(ok(specs.success) && !!specs.data, 'getProcessorSpecs');

        // 2. Create Pipeline
        await log('\n2. Create Pipeline');
        const createConfig = {
            id: `ingestion_${Date.now()}`,
            label: 'Test Ingestion Pipeline',
            description: 'Created by memoryTestAgent',
            trigger: 'manual' as const,
            processors: [
                {
                    type: 'filter' as const,
                    config: { field: 'type', operator: '=', value: 'test' },
                    order: 1
                }
            ],
            routing: {
                destination: 'kv' as const,
                destination_id: 'test-kv-instance'
            }
        };
        const createRes = await codebolt.memoryIngestion.create(createConfig);
        await assert(ok(createRes.success) && !!createRes.data?.pipeline, 'create');
        if (createRes.data?.pipeline) pipelineId = createRes.data.pipeline.id;

        // 3. Get Pipeline
        await log('\n3. Get Pipeline');
        const getRes = await codebolt.memoryIngestion.get(pipelineId);
        await assert(ok(getRes.success) && getRes.data?.pipeline?.id === pipelineId, 'get by id');
        await assert(getRes.data?.pipeline?.trigger === 'manual', 'trigger matches');

        // 4. List All
        await log('\n4. List Pipelines');
        const listRes = await codebolt.memoryIngestion.list();
        await assert(ok(listRes.success) && listRes.data?.pipelines?.some((p: any) => p.id === pipelineId), 'in list');

        // 5. List Filtered by Trigger
        await log('\n5. List Filtered — manual');
        const listMan = await codebolt.memoryIngestion.list({ trigger: 'manual' });
        await assert(ok(listMan.success), 'filter by trigger');

        // 6. List Active Only
        await log('\n6. List Active Only');
        const listActive = await codebolt.memoryIngestion.list({ activeOnly: true });
        await assert(ok(listActive.success), 'activeOnly filter');

        // 7. Update Pipeline
        await log('\n7. Update Pipeline');
        const upRes = await codebolt.memoryIngestion.update(pipelineId, {
            label: 'Updated Pipeline',
            description: 'Updated by test'
        });
        await assert(ok(upRes.success), 'update label');

        // 8. Update Processors
        await log('\n8. Update Processors');
        const upProc = await codebolt.memoryIngestion.update(pipelineId, {
            processors: [
                { type: 'filter' as const, config: { field: 'type', operator: '=', value: 'updated' }, order: 1 },
                { type: 'transform' as const, config: { mapping: { key: 'data.key' } }, order: 2 }
            ]
        });
        await assert(ok(upProc.success), 'update processors');

        // 9. Update Routing
        await log('\n9. Update Routing');
        const upRoute = await codebolt.memoryIngestion.update(pipelineId, {
            routing: {
                destination: 'vectordb' as const,
                destination_id: 'new-collection',
                field_mapping: { content: 'data.text' }
            }
        });
        await assert(ok(upRoute.success), 'update routing');

        // 10. Validate Pipeline
        await log('\n10. Validate');
        const valRes = await codebolt.memoryIngestion.validate(createConfig);
        await assert(ok(valRes.success), 'validate');

        // 11. Activate Pipeline
        await log('\n11. Activate');
        const actRes = await codebolt.memoryIngestion.activate(pipelineId);
        await assert(ok(actRes.success), 'activate');

        // 12. Disable Pipeline
        await log('\n12. Disable');
        const disRes = await codebolt.memoryIngestion.disable(pipelineId);
        await assert(ok(disRes.success), 'disable');

        // 13. Duplicate Pipeline
        await log('\n13. Duplicate');
        const dupId = `dup_${Date.now()}`;
        const dupRes = await codebolt.memoryIngestion.duplicate(pipelineId, dupId, 'Duplicated Pipeline');
        await assert(ok(dupRes.success) && !!dupRes.data?.pipeline, 'duplicate');
        await assert(dupRes.data?.pipeline?.label === 'Duplicated Pipeline', 'dup label');

        // 14. Execute Pipeline
        await log('\n14. Execute');
        const execRes = await codebolt.memoryIngestion.execute({
            pipelineId,
            eventType: 'test',
            trigger: 'manual',
            agentId: 'memoryTestAgent',
            payload: { test: true, data: { key: 'k1', text: 'hello' } }
        });
        if (!execRes.success) {
            skip();
            await log('  ⏭️  Execute may fail if backing stores not configured');
        } else {
            await assert(true, 'execute');
        }

        // 15. Execute with threadId context
        await log('\n15. Execute with threadId');
        const exec2 = await codebolt.memoryIngestion.execute({
            pipelineId,
            eventType: 'conversation_end',
            trigger: 'manual',
            threadId: 'thread-123',
            agentId: 'memoryTestAgent',
            swarmId: 'swarm-abc',
            payload: { messages: ['hello', 'world'] }
        });
        await log(`  Execute result: success=${exec2.success}`);

        // Cleanup
        await log('\n--- Cleanup ---');
        if (dupId) {
            await assert(ok((await codebolt.memoryIngestion.delete(dupId)).success), 'delete duplicate');
        }
        await assert(ok((await codebolt.memoryIngestion.delete(pipelineId)).success), 'delete pipeline');

    } catch (err) {
        await log(`  ❌ Memory Ingestion error: ${err}`);
    }
}
