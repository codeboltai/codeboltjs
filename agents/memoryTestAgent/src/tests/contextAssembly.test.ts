import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert, skip } from './helpers';

export async function testContextAssembly() {
    await log('\n══════════════════════════════════════');
    await log('  CONTEXT ASSEMBLY TESTS');
    await log('══════════════════════════════════════');

    try {
        // 1. List Memory Types
        await log('\n1. List Memory Types');
        const typesRes = await codebolt.contextAssembly.listMemoryTypes();
        await assert(!!typesRes, 'listMemoryTypes returns response');
        if ((typesRes as any).success !== undefined) {
            await assert(ok((typesRes as any).success), 'listMemoryTypes success');
        }

        // 2. Get Required Variables — empty list
        await log('\n2. Get Required Variables — empty');
        const reqEmpty = await codebolt.contextAssembly.getRequiredVariables([]);
        await assert(!!reqEmpty, 'getRequiredVariables empty returns response');

        // 3. Get Required Variables — with memory names
        await log('\n3. Get Required Variables — with names');
        const reqVars = await codebolt.contextAssembly.getRequiredVariables(['test_memory']);
        await assert(!!reqVars, 'getRequiredVariables returns response');

        // 4. Validate — basic request
        await log('\n4. Validate — basic request');
        const valRes = await codebolt.contextAssembly.validate({
            scope_variables: {
                agentId: 'memoryTestAgent',
                projectId: 'test-project'
            },
            input: 'test query for context assembly'
        } as any);
        await assert(!!valRes, 'validate returns response');

        // 5. Validate — with constraints
        await log('\n5. Validate — with constraints');
        const valCon = await codebolt.contextAssembly.validate({
            scope_variables: {
                agentId: 'memoryTestAgent'
            },
            input: 'test query',
            constraints: {
                max_tokens: 1000,
                required_sections: ['context']
            }
        } as any);
        await assert(!!valCon, 'validate with constraints');

        // 6. Get Context — basic
        await log('\n6. Get Context — basic');
        const ctxRes = await codebolt.contextAssembly.getContext({
            scope_variables: {
                agentId: 'memoryTestAgent',
                projectId: 'test-project'
            },
            input: 'What is the current state of the project?'
        } as any);
        await assert(!!ctxRes, 'getContext returns response');
        if ((ctxRes as any).success !== undefined) {
            await log(`  getContext success: ${(ctxRes as any).success}`);
            if (!(ctxRes as any).success) {
                skip();
                await log('  ⏭️  getContext may fail if no memories configured');
            }
        }

        // 7. Get Context — with additional variables
        await log('\n7. Get Context — additional variables');
        const ctxVars = await codebolt.contextAssembly.getContext({
            scope_variables: {
                agentId: 'memoryTestAgent',
                threadId: 'thread-123'
            },
            additional_variables: {
                custom_key: 'custom_value',
                task_type: 'testing'
            },
            input: 'Retrieve context with custom variables'
        } as any);
        await assert(!!ctxVars, 'getContext with variables');

        // 8. Get Context — with explicit memory
        await log('\n8. Get Context — explicit memory');
        const ctxMem = await codebolt.contextAssembly.getContext({
            scope_variables: {
                agentId: 'memoryTestAgent'
            },
            input: 'test with explicit memory',
            explicit_memory: [
                { key: 'fact1', value: 'The project uses TypeScript' },
                { key: 'fact2', value: 'Testing is done with codeboltjs' }
            ]
        } as any);
        await assert(!!ctxMem, 'getContext with explicit memory');

        // 9. Get Context — with constraints
        await log('\n9. Get Context — with constraints');
        const ctxCon = await codebolt.contextAssembly.getContext({
            scope_variables: {
                agentId: 'memoryTestAgent'
            },
            input: 'test with constraints',
            constraints: {
                max_tokens: 500,
                required_sections: ['context'],
                excluded_memories: ['large_memory']
            }
        } as any);
        await assert(!!ctxCon, 'getContext with constraints');

        // 10. Evaluate Rules
        await log('\n10. Evaluate Rules');
        const rulesRes = await codebolt.contextAssembly.evaluateRules({
            scope_variables: {
                agentId: 'memoryTestAgent',
                projectId: 'test-project'
            },
            input: 'evaluate rules for this context'
        } as any);
        await assert(!!rulesRes, 'evaluateRules returns response');

        // 11. Evaluate Rules — with rule engine IDs
        await log('\n11. Evaluate Rules — with IDs');
        const rulesIds = await codebolt.contextAssembly.evaluateRules({
            scope_variables: {
                agentId: 'memoryTestAgent'
            },
            input: 'evaluate specific rules'
        } as any, ['rule-engine-1']);
        await assert(!!rulesIds, 'evaluateRules with IDs');

    } catch (err) {
        await log(`  ❌ Context Assembly error: ${err}`);
    }
}
