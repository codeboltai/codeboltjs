import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { passed, failed, skipped, resetCounters, log, saveLogsToFile } from './tests/helpers';

import { testEpisodicMemory } from './tests/episodicMemory.test';
import { testKnowledgeGraph } from './tests/knowledgeGraph.test';
import { testKVStore } from './tests/kvStore.test';
import { testPersistentMemory } from './tests/persistentMemory.test';
import { testMemoryIngestion } from './tests/memoryIngestion.test';
import { testVectorDB } from './tests/vectordb.test';
import { testGeneralMemory } from './tests/generalMemory.test';
import { testContextAssembly } from './tests/contextAssembly.test';
import { testDbMemory } from './tests/dbMemory.test';
import { testContextRuleEngine } from './tests/contextRuleEngine.test';

const TEST_MAP: Record<string, () => Promise<void>> = {
    episodic: testEpisodicMemory,
    kg: testKnowledgeGraph,
    knowledgegraph: testKnowledgeGraph,
    kv: testKVStore,
    kvstore: testKVStore,
    persistent: testPersistentMemory,
    persistentmemory: testPersistentMemory,
    ingestion: testMemoryIngestion,
    memoryingestion: testMemoryIngestion,
    vector: testVectorDB,
    vectordb: testVectorDB,
    memory: testGeneralMemory,
    general: testGeneralMemory,
    context: testContextAssembly,
    contextassembly: testContextAssembly,
    db: testDbMemory,
    dbmemory: testDbMemory,
    contextruleengine: testContextRuleEngine,
    ruleengine: testContextRuleEngine,
    rules: testContextRuleEngine,
};

async function runAllTests() {
    resetCounters();
    const start = Date.now();

    await log('╔══════════════════════════════════════╗');
    await log('║   MEMORY SYSTEM — FULL TEST SUITE    ║');
    await log('╚══════════════════════════════════════╝');

    await testEpisodicMemory();
    await testKnowledgeGraph();
    await testKVStore();
    await testPersistentMemory();
    await testMemoryIngestion();
    await testVectorDB();
    await testGeneralMemory();
    await testContextAssembly();
    await testDbMemory();
    await testContextRuleEngine();

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    await log('\n╔══════════════════════════════════════╗');
    await log('║           TEST RESULTS               ║');
    await log('╚══════════════════════════════════════╝');
    await log(`  Passed:   ${passed}`);
    await log(`  Failed:   ${failed}`);
    await log(`  Skipped:  ${skipped}`);
    await log(`  Duration: ${duration}s`);
    await log(`  Total:    ${passed + failed + skipped}`);

    const logFiles = saveLogsToFile();
    await log(`\n  Logs saved to: ${JSON.stringify(logFiles)}`);

    return { passed, failed, skipped, duration };
}

async function runSingleTest(name: string) {
    resetCounters();
    const start = Date.now();

    const key = name.toLowerCase().replace(/[\s_-]/g, '');
    const testFn = TEST_MAP[key];
    if (!testFn) {
        await log(`Unknown test: "${name}". Available: ${Object.keys(TEST_MAP).join(', ')}`);
        return { passed: 0, failed: 0, skipped: 0, duration: '0' };
    }

    await testFn();

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    await log(`\n  Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | ${duration}s`);

    const logFiles = saveLogsToFile();
    await log(`\n  Logs saved to: ${JSON.stringify(logFiles)}`);

    return { passed, failed, skipped, duration };
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    const msg = (reqMessage.userMessage || '').trim();
    await log(`Received: ${msg}`);

    try {
        let results;

        if (msg && msg.toLowerCase() !== 'all' && msg.toLowerCase() !== 'run') {
            results = await runSingleTest(msg);
        } else {
            results = await runAllTests();
        }

        codebolt.chat.sendMessage(
            `Test Complete — ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped (${results.duration}s)`,
            { type: 'text' }
        );
    } catch (error) {
        codebolt.chat.sendMessage(`Test suite crashed: ${error}`, { type: 'text' });
    }
});
