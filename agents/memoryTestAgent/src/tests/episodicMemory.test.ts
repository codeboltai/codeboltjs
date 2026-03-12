import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert } from './helpers';

export async function testEpisodicMemory() {
    await log('\n══════════════════════════════════════');
    await log('  EPISODIC MEMORY TESTS');
    await log('══════════════════════════════════════');

    let memoryId = '';
    const title = `EpisodicTest_${Date.now()}`;

    try {
        // 1. Create Memory
        await log('\n1. Create Memory');
        const createRes = await codebolt.episodicMemory.createMemory({ title });
        await assert(ok(createRes.success) && !!createRes.data, 'createMemory returns success');
        if (createRes.data) {
            memoryId = createRes.data.id;
            await assert(createRes.data.title === title, 'title matches');
        }

        // 2. List Memories
        await log('\n2. List Memories');
        const listRes = await codebolt.episodicMemory.listMemories();
        await assert(ok(listRes.success) && Array.isArray(listRes.data), 'listMemories returns array');
        if (listRes.data) {
            await assert(listRes.data.some((m: any) => m.id === memoryId), 'created memory in list');
        }

        // 3. Get Memory by ID
        await log('\n3. Get Memory by ID');
        const getRes = await codebolt.episodicMemory.getMemory({ memoryId });
        await assert(ok(getRes.success) && getRes.data?.id === memoryId, 'getMemory by memoryId');

        // 4. Update Title
        await log('\n4. Update Title');
        const newTitle = `${title}_Updated`;
        const updateRes = await codebolt.episodicMemory.updateTitle({ memoryId, title: newTitle });
        await assert(ok(updateRes.success), 'updateTitle succeeds');
        const verifyTitle = await codebolt.episodicMemory.getMemory({ memoryId });
        await assert(verifyTitle.data?.title === newTitle, 'title update verified');

        // 5. Append Event with tags
        await log('\n5. Append Event');
        const appendRes = await codebolt.episodicMemory.appendEvent({
            memoryId,
            event_type: 'test_event',
            emitting_agent_id: 'memoryTestAgent',
            payload: { action: 'test', status: 'running' },
            tags: ['test', 'unit-test']
        });
        await assert(ok(appendRes.success) && !!appendRes.data, 'appendEvent succeeds');

        // 6. Append second event (different type & agent)
        await log('\n6. Append Second Event');
        const append2 = await codebolt.episodicMemory.appendEvent({
            memoryId,
            event_type: 'info_event',
            emitting_agent_id: 'otherAgent',
            payload: { detail: 'second event' },
            tags: ['info']
        });
        await assert(ok(append2.success), 'second event appended');

        // 7. Append event with string payload
        await log('\n7. Append Event with String Payload');
        const append3 = await codebolt.episodicMemory.appendEvent({
            memoryId,
            event_type: 'log_event',
            emitting_agent_id: 'memoryTestAgent',
            payload: 'Simple string payload',
            tags: ['test', 'string']
        });
        await assert(ok(append3.success), 'string payload event appended');

        // 8. Query Events — by tag
        await log('\n8. Query Events by Tag');
        const queryTag = await codebolt.episodicMemory.queryEvents({ memoryId, tags: ['test'] });
        await assert(ok(queryTag.success) && (queryTag.data?.events?.length ?? 0) >= 1, 'query by tag returns events');

        // 9. Query Events — by type
        await log('\n9. Query Events by Type');
        const queryType = await codebolt.episodicMemory.queryEvents({ memoryId, event_type: 'info_event' });
        await assert(ok(queryType.success) && (queryType.data?.events?.length ?? 0) >= 1, 'query by event_type');

        // 10. Query Events — by emitting_agent_id
        await log('\n10. Query Events by Agent');
        const queryAgent = await codebolt.episodicMemory.queryEvents({ memoryId, emitting_agent_id: 'otherAgent' });
        await assert(ok(queryAgent.success) && (queryAgent.data?.events?.length ?? 0) >= 1, 'query by emitting_agent_id');

        // 11. Query Events — lastCount
        await log('\n11. Query Events — lastCount');
        const queryLast = await codebolt.episodicMemory.queryEvents({ memoryId, lastCount: 2 });
        await assert(ok(queryLast.success) && (queryLast.data?.events?.length ?? 0) <= 2, 'lastCount limits results');

        // 12. Get Event Types
        await log('\n12. Get Event Types');
        const typesRes = await codebolt.episodicMemory.getEventTypes({ memoryId });
        await assert(ok(typesRes.success) && typesRes.data?.includes?.('test_event'), 'test_event in types');
        await assert(typesRes.data?.includes?.('info_event'), 'info_event in types');

        // 13. Get Tags
        await log('\n13. Get Tags');
        const tagsRes = await codebolt.episodicMemory.getTags({ memoryId });
        await assert(ok(tagsRes.success) && tagsRes.data?.includes?.('test'), '"test" tag found');
        await assert(tagsRes.data?.includes?.('info'), '"info" tag found');

        // 14. Get Agents
        await log('\n14. Get Agents');
        const agentsRes = await codebolt.episodicMemory.getAgents({ memoryId });
        await assert(ok(agentsRes.success) && agentsRes.data?.includes?.('memoryTestAgent'), 'memoryTestAgent in agents');
        await assert(agentsRes.data?.includes?.('otherAgent'), 'otherAgent in agents');

        // 15. Archive Memory
        await log('\n15. Archive Memory');
        const archiveRes = await codebolt.episodicMemory.archiveMemory({ memoryId });
        await assert(ok(archiveRes.success), 'archiveMemory succeeds');
        const verifyArchive = await codebolt.episodicMemory.getMemory({ memoryId });
        await assert(verifyArchive.data?.archived === true, 'archived status verified');

        // 16. Unarchive Memory
        await log('\n16. Unarchive Memory');
        const unarchiveRes = await codebolt.episodicMemory.unarchiveMemory({ memoryId });
        await assert(ok(unarchiveRes.success), 'unarchiveMemory succeeds');
        const verifyUnarchive = await codebolt.episodicMemory.getMemory({ memoryId });
        await assert(verifyUnarchive.data?.archived === false, 'unarchived status verified');

    } catch (err) {
        await log(`  ❌ Episodic Memory error: ${err}`);
    }
}
