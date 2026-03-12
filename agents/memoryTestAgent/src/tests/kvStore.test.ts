import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert } from './helpers';

export async function testKVStore() {
    await log('\n══════════════════════════════════════');
    await log('  KV STORE TESTS');
    await log('══════════════════════════════════════');

    let instanceId = '';
    const instanceName = `KVTest_${Date.now()}`;
    const ns = 'test-namespace';

    try {
        // ---- Instance CRUD ----
        await log('\n--- Instance CRUD ---');

        // 1. Create Instance
        await log('\n1. Create Instance');
        const createRes = await codebolt.kvStore.createInstance(instanceName, 'Test KV instance');
        await assert(ok(createRes.success) && !!createRes.data?.instance, 'createInstance');
        if (createRes.data?.instance) instanceId = createRes.data.instance.id;

        // 2. Get Instance
        await log('\n2. Get Instance');
        const getRes = await codebolt.kvStore.getInstance(instanceId);
        await assert(ok(getRes.success) && getRes.data?.instance?.name === instanceName, 'getInstance');

        // 3. List Instances
        await log('\n3. List Instances');
        const listRes = await codebolt.kvStore.listInstances();
        await assert(ok(listRes.success) && listRes.data?.instances?.some((i: any) => i.id === instanceId), 'instance in list');

        // 4. Update Instance
        await log('\n4. Update Instance');
        const upRes = await codebolt.kvStore.updateInstance(instanceId, { description: 'Updated desc' });
        await assert(ok(upRes.success), 'updateInstance');

        // ---- Set Values (various types) ----
        await log('\n--- Set Values ---');

        // 5. Set String
        await log('\n5. Set String');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'greeting', 'Hello World')).success), 'set string');

        // 6. Set Number
        await log('\n6. Set Number');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'counter', 42)).success), 'set number');

        // 7. Set Boolean
        await log('\n7. Set Boolean');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'isActive', true)).success), 'set boolean');

        // 8. Set JSON Object
        await log('\n8. Set JSON Object');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'config', { theme: 'dark', lang: 'en', nested: { a: 1 } })).success), 'set JSON');

        // 9. Set Array
        await log('\n9. Set Array');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'tags', ['tag1', 'tag2', 'tag3'])).success), 'set array');

        // 10. Set Null
        await log('\n10. Set Null');
        await assert(ok((await codebolt.kvStore.set(instanceId, ns, 'empty', null)).success), 'set null');

        // ---- Get Values ----
        await log('\n--- Get Values ---');

        // 11. Get String
        await log('\n11. Get String');
        const getStr = await codebolt.kvStore.get(instanceId, ns, 'greeting');
        await assert(ok(getStr.success) && getStr.data?.value === 'Hello World', 'get string');
        await assert(getStr.data?.exists === true, 'exists flag true');

        // 12. Get Number
        await log('\n12. Get Number');
        const getNum = await codebolt.kvStore.get(instanceId, ns, 'counter');
        await assert(ok(getNum.success) && getNum.data?.value === 42, 'get number');

        // 13. Get JSON
        await log('\n13. Get JSON');
        const getJson = await codebolt.kvStore.get(instanceId, ns, 'config');
        await assert(ok(getJson.success) && getJson.data?.value?.theme === 'dark', 'get JSON');
        await assert(getJson.data?.value?.nested?.a === 1, 'nested JSON preserved');

        // 14. Get Non-existent Key
        await log('\n14. Get Non-existent Key');
        const getMissing = await codebolt.kvStore.get(instanceId, ns, 'does_not_exist');
        await assert(!getMissing.data?.exists || !getMissing.data?.value, 'non-existent key');

        // ---- Upsert ----
        await log('\n--- Upsert ---');

        // 15. Overwrite Existing Value
        await log('\n15. Upsert Overwrite');
        await codebolt.kvStore.set(instanceId, ns, 'counter', 100);
        const getUp = await codebolt.kvStore.get(instanceId, ns, 'counter');
        await assert(getUp.data?.value === 100, 'upsert overwrites');

        // ---- Namespaces ----
        await log('\n--- Namespaces ---');

        // 16. Get Namespaces
        await log('\n16. Get Namespaces');
        const nsRes = await codebolt.kvStore.getNamespaces(instanceId);
        await assert(ok(nsRes.success) && nsRes.data?.namespaces?.includes(ns), 'namespace found');

        // 17. Set in Second Namespace
        await log('\n17. Second Namespace');
        const ns2 = 'other-ns';
        await codebolt.kvStore.set(instanceId, ns2, 'key1', 'value1');
        await codebolt.kvStore.set(instanceId, ns2, 'key2', 'value2');
        const nsRes2 = await codebolt.kvStore.getNamespaces(instanceId);
        await assert(nsRes2.data?.namespaces?.includes(ns2), 'second namespace');

        // ---- Record Count ----
        await log('\n--- Record Count ---');

        // 18. Count All
        await log('\n18. Count All Records');
        const countAll = await codebolt.kvStore.getRecordCount(instanceId);
        await assert(ok(countAll.success) && (countAll.data?.count ?? 0) >= 6, 'total count >= 6');

        // 19. Count by Namespace
        await log('\n19. Count by Namespace');
        const countNs = await codebolt.kvStore.getRecordCount(instanceId, ns);
        await assert(ok(countNs.success) && (countNs.data?.count ?? 0) >= 5, 'ns count >= 5');

        const countNs2 = await codebolt.kvStore.getRecordCount(instanceId, ns2);
        await assert(ok(countNs2.success) && (countNs2.data?.count ?? 0) >= 2, 'ns2 count >= 2');

        // ---- Query DSL ----
        await log('\n--- Query DSL ---');

        // 20. Basic Query
        await log('\n20. Basic Query');
        const q1 = await codebolt.kvStore.query({
            from: { instance: instanceId, namespace: ns },
            limit: 10
        });
        await assert(ok(q1.success) && !!q1.data?.result, 'basic query');

        // 21. Query with orderBy
        await log('\n21. Query with orderBy');
        const q2 = await codebolt.kvStore.query({
            from: { instance: instanceId, namespace: ns },
            orderBy: { field: 'key', direction: 'asc' },
            limit: 5
        });
        await assert(ok(q2.success), 'query with orderBy');

        // 22. Query with limit/offset
        await log('\n22. Query with limit/offset');
        const q3 = await codebolt.kvStore.query({
            from: { instance: instanceId, namespace: ns },
            limit: 2,
            offset: 1
        });
        await assert(ok(q3.success), 'query with limit/offset');

        // ---- Delete Operations ----
        await log('\n--- Delete Operations ---');

        // 23. Delete Single Value
        await log('\n23. Delete Value');
        await assert(ok((await codebolt.kvStore.delete(instanceId, ns, 'greeting')).success), 'delete value');
        const getDeleted = await codebolt.kvStore.get(instanceId, ns, 'greeting');
        await assert(!getDeleted.data?.exists, 'deleted value gone');

        // 24. Delete Namespace
        await log('\n24. Delete Namespace');
        await assert(ok((await codebolt.kvStore.deleteNamespace(instanceId, ns2)).success), 'deleteNamespace');

        // 25. Auto-Create Instance via set
        await log('\n25. Auto-Create Instance');
        const autoRes = await codebolt.kvStore.set('auto-create-test', 'default', 'key', 'val', true);
        await assert(ok(autoRes.success), 'autoCreateInstance via set');

        // 26. Delete Instance
        await log('\n26. Delete Instance');
        await assert(ok((await codebolt.kvStore.deleteInstance(instanceId)).success), 'deleteInstance');

    } catch (err) {
        await log(`  ❌ KV Store error: ${err}`);
    }
}
