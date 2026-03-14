import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert } from './helpers';

export async function testContextRuleEngine() {
    await log('\n══════════════════════════════════════');
    await log('  CONTEXT RULE ENGINE TESTS');
    await log('══════════════════════════════════════');

    let ruleEngineId = '';
    const ruleName = `RuleEngineTest_${Date.now()}`;

    try {
        // 1. Create Rule Engine
        await log('\n1. Create Rule Engine');
        // const createRes = await codebolt.contextRuleEngine.create({
        //     name: ruleName,
        //     description: 'Test rule engine for automated testing',
        //     rules: [
        //         {
        //             condition: 'variables.urgent === true',
        //             action: 'include',
        //             memoryType: 'episodic'
        //         }
        //     ]
        // } as any);
        // await assert(!!createRes, 'create returns response');
        // if ((createRes as any).success !== undefined) {
        //     await assert(ok((createRes as any).success), 'create success');
        // }
        // if ((createRes as any).ruleEngine) {
        //     ruleEngineId = (createRes as any).ruleEngine.id;
        //     await assert(!!(createRes as any).ruleEngine.id, 'ruleEngine has id');
        //     await log(`  Rule engine ID: ${ruleEngineId}`);
        // } else if ((createRes as any).data) {
        //     ruleEngineId = (createRes as any).data.id;
        //     await assert(!!(createRes as any).data.id, 'ruleEngine has id (data path)');
        //     await log(`  Rule engine ID: ${ruleEngineId}`);
        // }

        // 2. List Rule Engines
        await log('\n2. List Rule Engines');
        const listRes = await codebolt.contextRuleEngine.list();
        await assert(!!listRes, 'list returns response');
        if ((listRes as any).ruleEngines) {
            await assert(Array.isArray((listRes as any).ruleEngines), 'ruleEngines is array');
            await assert(
                (listRes as any).ruleEngines.some((re: any) => re.id === ruleEngineId),
                'created engine found in list'
            );
        } else if ((listRes as any).data) {
            await assert(Array.isArray((listRes as any).data), 'data is array');
            await assert(
                (listRes as any).data.some((re: any) => re.id === ruleEngineId),
                'created engine found in list (data path)'
            );
        }

        // 3. Get Rule Engine by ID
        await log('\n3. Get Rule Engine by ID');
        if (ruleEngineId) {
            const getRes = await codebolt.contextRuleEngine.get(ruleEngineId);
            await assert(!!getRes, 'get returns response');
            if ((getRes as any).ruleEngine) {
                await assert((getRes as any).ruleEngine.id === ruleEngineId, 'get returns correct engine');
            } else if ((getRes as any).data) {
                await assert((getRes as any).data.id === ruleEngineId, 'get returns correct engine (data path)');
            }
        } else {
            await log('  ⏭️  Skipped — no ruleEngineId from create');
        }



        // 5. Evaluate Rules — basic
        await log('\n5. Evaluate Rules — basic');
        const evalRes = await codebolt.contextRuleEngine.evaluate({
            variables: {
                urgent: true,
                priority: 'high'
            }
        } as any);
        await assert(!!evalRes, 'evaluate returns response');
        if ((evalRes as any).results) {
            await assert(Array.isArray((evalRes as any).results), 'results is array');
            await log(`  Results count: ${(evalRes as any).results.length}`);
        } else if ((evalRes as any).data) {
            await assert(!!((evalRes as any).data), 'evaluate data present');
        }

        // 6. Evaluate Rules — with different variables
        await log('\n6. Evaluate Rules — different variables');
        const evalRes2 = await codebolt.contextRuleEngine.evaluate({
            variables: {
                urgent: false,
                priority: 'low',
                context: 'testing'
            }
        } as any);
        await assert(!!evalRes2, 'evaluate with different variables returns response');

        // 7. Get Possible Variables
        await log('\n7. Get Possible Variables');
        const varsRes = await codebolt.contextRuleEngine.getPossibleVariables();
        await assert(!!varsRes, 'getPossibleVariables returns response');
        if ((varsRes as any).variables) {
            await assert(Array.isArray((varsRes as any).variables), 'variables is array');
            await log(`  Variables count: ${(varsRes as any).variables.length}`);
        } else if ((varsRes as any).data) {
            await assert(!!((varsRes as any).data), 'variables data present');
        }



    } catch (err) {
        await log(`  ❌ Context Rule Engine error: ${err}`);
    }
}
