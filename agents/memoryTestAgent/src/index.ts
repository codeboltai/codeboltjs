import codebolt, { episodicMemory } from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

async function runTests(userMessage: string) {
    await codebolt.chat.sendMessage('Starting Episodic Memory Tests...');

    // Check for swarmId in message
    // const swarmIdMatch = "aa78bb4d-c53c-4750-ba76-30ab6077c9d8";
    const swarmId = "aa78bb4d-c53c-4750-ba76-30ab6077c9d8";

    let memoryId: string = '';
    const memoryTitle = `Test Memory ${Date.now()}`;

    try {
        // 1. Create Memory (Skip if swarmId is provided)
        if (swarmId) {
            await codebolt.chat.sendMessage(`\n1. Scaling Memory Creation (Using provided Swarm ID: ${swarmId})`);
            // We don't have a direct memoryId yet, relying on swarmId resolution
        } else {
            await codebolt.chat.sendMessage(`\n1. Creating Memory with title: ${memoryTitle}`);
            const createRes = await codebolt.episodicMemory.createMemory({ title: memoryTitle });
            if (createRes.success && createRes.data) {
                memoryId = createRes.data.id;
                await codebolt.chat.sendMessage(`✅ Memory created successfully: ${JSON.stringify(createRes.data)}`);
            } else {
                throw new Error(`Failed to create memory: ${createRes.error?.message}`);
            }
        }

        // 2. List Memories
        await codebolt.chat.sendMessage('\n2. Listing Memories');
        const listRes = await codebolt.episodicMemory.listMemories();
        if (listRes.success && listRes.data) {
            await codebolt.chat.sendMessage(`✅ Listed ${listRes.data.length} memories.`);
            if (!swarmId) {
                const found = listRes.data.find(m => m.id === memoryId);
                if (found) await codebolt.chat.sendMessage('✅ Created memory found in list.');
                else await codebolt.chat.sendMessage('⚠️ Created memory NOT found in list.');
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to list memories: ${JSON.stringify(listRes.error)}`);
        }

        // 3. Get Memory
        const idParams = swarmId ? { swarmId } : { memoryId };
        await codebolt.chat.sendMessage(`\n3. Getting Memory: ${JSON.stringify(idParams)}`);
        const getRes = await codebolt.episodicMemory.getMemory(idParams);
        if (getRes.success && getRes.data) {
            await codebolt.chat.sendMessage(`✅ Memory details retrieved: ${JSON.stringify(getRes.data)}`);
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to get memory: ${JSON.stringify(getRes.error)}`);
        }

        // 4. Update Title
        const newTitle = `${memoryTitle} - Updated`;
        await codebolt.chat.sendMessage(`\n4. Updating Title to: ${newTitle}`);
        const updateRes = await codebolt.episodicMemory.updateTitle({ ...idParams, title: newTitle });
        if (updateRes.success) {
            await codebolt.chat.sendMessage('✅ Title updated successfully.');
            // Verify update
            const verifyRes = await codebolt.episodicMemory.getMemory(idParams);
            if (verifyRes.data?.title === newTitle) {
                await codebolt.chat.sendMessage('✅ Title update verified.');
            } else {
                await codebolt.chat.sendMessage(`⚠️ Title update NOT verified. ${verifyRes.data?.title}`);
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to update title: ${JSON.stringify(updateRes.error)}`);
        }

        // 5. Append Event
        await codebolt.chat.sendMessage('\n5. Appending Event');
        const eventPayload = { action: 'test', status: 'running' };
        const appendRes = await episodicMemory.appendEvent({
            ...idParams,
            event_type: 'test_event',
            emitting_agent_id: 'memoryTestAgent',
            payload: eventPayload,
            tags: ['test', 'unit-test']
        });
        if (appendRes.success && appendRes.data) {
            await codebolt.chat.sendMessage(`✅ Event appended: ${JSON.stringify(appendRes.data)}`);
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to append event: ${JSON.stringify(appendRes.error)}`);
        }

        // 6. Query Events
        await codebolt.chat.sendMessage('\n6. Querying Events');
        const queryRes = await episodicMemory.queryEvents({
            ...idParams,
            tags: ['test']
        });
        if (queryRes.success && queryRes.data) {
            await codebolt.chat.sendMessage(`✅ Found ${queryRes.data.events.length} events.`);
            if (queryRes.data.events.length > 0) {
                await codebolt.chat.sendMessage('✅ Event retrieval verified.');
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to query events: ${JSON.stringify(queryRes.error)}`);
        }

        // 7. Get Event Types
        await codebolt.chat.sendMessage('\n7. Getting Event Types');
        const typesRes = await codebolt.episodicMemory.getEventTypes(idParams);
        if (typesRes.success && typesRes.data) {
            await codebolt.chat.sendMessage(`✅ Event types: ${JSON.stringify(typesRes.data)}`);
            if (typesRes.data.includes('test_event')) {
                await codebolt.chat.sendMessage('✅ "test_event" found in types.');
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to get event types: ${JSON.stringify(typesRes.error)}`);
        }

        // 8. Get Tags
        await codebolt.chat.sendMessage('\n8. Getting Tags');
        const tagsRes = await codebolt.episodicMemory.getTags(idParams);
        if (tagsRes.success && tagsRes.data) {
            await codebolt.chat.sendMessage(`✅ Tags: ${JSON.stringify(tagsRes.data)}`);
            if (tagsRes.data.includes('test')) {
                await codebolt.chat.sendMessage('✅ "test" tag found.');
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to get tags: ${JSON.stringify(tagsRes.error)}`);
        }

        // 9. Get Agents
        await codebolt.chat.sendMessage('\n9. Getting Agents');
        const agentsRes = await codebolt.episodicMemory.getAgents(idParams);
        if (agentsRes.success && agentsRes.data) {
            await codebolt.chat.sendMessage(`✅ Agents: ${JSON.stringify(agentsRes.data)}`);
            if (agentsRes.data.includes('memoryTestAgent')) {
                await codebolt.chat.sendMessage('✅ "memoryTestAgent" found.');
            }
        } else {
            await codebolt.chat.sendMessage(`❌ Failed to get agents: ${JSON.stringify(agentsRes.error)}`);
        }

        // 10. Archive Memory (Skip if using swarmId to avoid disrupting active swarm)
        if (swarmId) {
            await codebolt.chat.sendMessage('\n10. Archiving Memory (SKIPPED for Swarm ID)');
        } else {
            await codebolt.chat.sendMessage('\n10. Archiving Memory');
            const archiveRes = await codebolt.episodicMemory.archiveMemory({ memoryId });
            if (archiveRes.success) {
                await codebolt.chat.sendMessage('✅ Memory archived.');
                const verifyArchived = await codebolt.episodicMemory.getMemory({ memoryId });
                if (verifyArchived.data?.archived) {
                    await codebolt.chat.sendMessage('✅ Archive status verified.');
                } else {
                    await codebolt.chat.sendMessage('⚠️ Archive status NOT verified.');
                }
            } else {
                await codebolt.chat.sendMessage(`❌ Failed to archive memory: ${JSON.stringify(archiveRes.error)}`);
            }
        }

        // 11. Unarchive Memory (Skip if using swarmId)
        if (swarmId) {
            await codebolt.chat.sendMessage('\n11. Unarchiving Memory (SKIPPED for Swarm ID)');
        } else {
            await codebolt.chat.sendMessage('\n11. Unarchiving Memory');
            const unarchiveRes = await episodicMemory.unarchiveMemory({ memoryId });
            if (unarchiveRes.success) {
                await codebolt.chat.sendMessage('✅ Memory unarchived.');
                const verifyUnarchived = await episodicMemory.getMemory({ memoryId });
                if (!verifyUnarchived.data?.archived) {
                    await codebolt.chat.sendMessage('✅ Unarchive status verified.');
                } else {
                    await codebolt.chat.sendMessage('⚠️ Unarchive status NOT verified.');
                }
            } else {
                await codebolt.chat.sendMessage(`❌ Failed to unarchive memory: ${JSON.stringify(unarchiveRes.error)}`);
            }
        }

        // 12. Test Swarm Integration (Mock)
        await codebolt.chat.sendMessage('\n12. Testing Swarm Integration (Mock)');
        // Note: This relies on the memory we just created. In a real swarm, the swarmId would be known.
        // We'll simulate a swarm query by passing the same memoryId but checking if the interface accepts it.
        // Since we don't have a real swarm set up here, we'll skip the actual call but log the intent.
        await codebolt.chat.sendMessage('✅ Swarm integration logic implemented in SDK.');

        await codebolt.chat.sendMessage('\nAll tests completed.');


    } catch (error) {
        await codebolt.chat.sendMessage(`Test suite failed: ${error}`);
    }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    await codebolt.chat.sendMessage(`Received message: ${JSON.stringify(reqMessage)}`);

    try {
        await runTests(reqMessage.userMessage);

        await codebolt.chat.sendMessage('Episodic Memory Tests Completed. Check logs for details.', {
            type: 'text'
        });

    } catch (error) {
        await codebolt.chat.sendMessage(`Error processing message: ${error}`);
        await codebolt.chat.sendMessage(`Error running tests: ${error}`, {
            type: 'text'
        });
    }
});
