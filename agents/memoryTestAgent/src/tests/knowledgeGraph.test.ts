import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert, skip } from './helpers';

export async function testKnowledgeGraph() {
    await log('\n══════════════════════════════════════');
    await log('  KNOWLEDGE GRAPH TESTS');
    await log('══════════════════════════════════════');

    let templateId = '';
    let instanceId = '';
    let recordId1 = '';
    let recordId2 = '';
    let edgeId = '';
    let viewTemplateId = '';
    let viewId = '';

    try {
        // ---- Instance Template CRUD ----
        await log('\n--- Instance Template CRUD ---');

        // 1. Create Instance Template
        await log('\n1. Create Instance Template');
        const templateRes = await codebolt.knowledgeGraph.createInstanceTemplate({
            name: `TestTemplate_${Date.now()}`,
            description: 'Test template for memory agent',
            record_kinds: [
                {
                    name: 'Person',
                    label: 'Person',
                    attributes: {
                        name: { type: 'string' },
                        age: { type: 'number' },
                        email: { type: 'string' }
                    }
                },
                {
                    name: 'Project',
                    label: 'Project',
                    attributes: {
                        title: { type: 'string' },
                        active: { type: 'boolean' },
                        startDate: { type: 'date' }
                    }
                }
            ],
            edge_types: [
                {
                    name: 'WORKS_ON',
                    label: 'Works On',
                    from_kinds: ['Person'],
                    to_kinds: ['Project'],
                    attributes: { role: { type: 'string' } }
                },
                {
                    name: 'MANAGES',
                    label: 'Manages',
                    from_kinds: ['Person'],
                    to_kinds: ['Project'],
                    attributes: { since: { type: 'date' } }
                }
            ]
        });
        await assert(ok(templateRes.success) && !!templateRes.data, 'createInstanceTemplate');
        if (templateRes.data) templateId = templateRes.data.id;

        // 2. Get Instance Template
        await log('\n2. Get Instance Template');
        const getT = await codebolt.knowledgeGraph.getInstanceTemplate(templateId);
        await assert(ok(getT.success) && getT.data?.id === templateId, 'getInstanceTemplate');
        await assert(getT.data?.record_kinds?.length === 2, 'template has 2 record kinds');
        await assert(getT.data?.edge_types?.length === 2, 'template has 2 edge types');

        // 3. List Instance Templates
        await log('\n3. List Instance Templates');
        const listT = await codebolt.knowledgeGraph.listInstanceTemplates();
        await assert(ok(listT.success) && listT.data?.some((t: any) => t.id === templateId), 'template in list');

        // 4. Update Instance Template
        await log('\n4. Update Instance Template');
        const upT = await codebolt.knowledgeGraph.updateInstanceTemplate(templateId, {
            description: 'Updated description'
        });
        await assert(ok(upT.success), 'updateInstanceTemplate');

        // ---- Instance CRUD ----
        await log('\n--- Instance CRUD ---');

        // 5. Create Instance
        await log('\n5. Create Instance');
        const instRes = await codebolt.knowledgeGraph.createInstance({
            templateId,
            name: `TestInst_${Date.now()}`,
            description: 'Test instance'
        });
        await assert(ok(instRes.success) && !!instRes.data, 'createInstance');
        if (instRes.data) instanceId = instRes.data.id;

        // 6. Get Instance
        await log('\n6. Get Instance');
        const getI = await codebolt.knowledgeGraph.getInstance(instanceId);
        await assert(ok(getI.success) && getI.data?.id === instanceId, 'getInstance');

        // 7. List Instances (filtered by templateId)
        await log('\n7. List Instances');
        const listI = await codebolt.knowledgeGraph.listInstances(templateId);
        await assert(ok(listI.success) && listI.data?.some((i: any) => i.id === instanceId), 'instance in filtered list');

        // 8. List Instances (all)
        await log('\n8. List All Instances');
        const listAll = await codebolt.knowledgeGraph.listInstances();
        await assert(ok(listAll.success) && (listAll.data?.length ?? 0) >= 1, 'list all instances');

        // ---- Memory Record CRUD ----
        await log('\n--- Memory Record CRUD ---');

        // 9. Add Single Record — Person
        await log('\n9. Add Record — Person');
        const rec1 = await codebolt.knowledgeGraph.addMemoryRecord(instanceId, {
            kind: 'Person',
            attributes: { name: 'Alice', age: 30, email: 'alice@test.com' }
        });
        await assert(ok(rec1.success) && !!rec1.data, 'addMemoryRecord Person');
        if (rec1.data) recordId1 = rec1.data.id;

        // 10. Add Single Record — Project
        await log('\n10. Add Record — Project');
        const rec2 = await codebolt.knowledgeGraph.addMemoryRecord(instanceId, {
            kind: 'Project',
            attributes: { title: 'CodeBolt', active: true, startDate: '2024-01-01' }
        });
        await assert(ok(rec2.success) && !!rec2.data, 'addMemoryRecord Project');
        if (rec2.data) recordId2 = rec2.data.id;

        // 11. Add Multiple Records
        await log('\n11. Add Multiple Records');
        const bulkRec = await codebolt.knowledgeGraph.addMemoryRecords(instanceId, [
            { kind: 'Person', attributes: { name: 'Bob', age: 25 } },
            { kind: 'Person', attributes: { name: 'Charlie', age: 35 } },
            { kind: 'Person', attributes: { name: 'Diana', age: 28 } }
        ]);
        await assert(ok(bulkRec.success) && Array.isArray(bulkRec.data), 'addMemoryRecords bulk');
        await assert((bulkRec.data?.length ?? 0) === 3, 'bulk added 3 records');

        // 12. Get Memory Record
        await log('\n12. Get Memory Record');
        const getRec = await codebolt.knowledgeGraph.getMemoryRecord(instanceId, recordId1);
        await assert(ok(getRec.success) && getRec.data?.attributes?.name === 'Alice', 'getMemoryRecord');

        // 13. List Memory Records — all
        await log('\n13. List Memory Records — all');
        const listRec = await codebolt.knowledgeGraph.listMemoryRecords(instanceId);
        await assert(ok(listRec.success) && (listRec.data?.length ?? 0) >= 5, 'listMemoryRecords >= 5');

        // 14. List Memory Records — filter by kind
        await log('\n14. List Records — filter by kind');
        const filtRec = await codebolt.knowledgeGraph.listMemoryRecords(instanceId, { kind: 'Person' });
        await assert(ok(filtRec.success) && (filtRec.data?.length ?? 0) >= 4, 'filter Person >= 4');

        // 15. List Memory Records — with limit/offset
        await log('\n15. List Records — limit/offset');
        const pageRec = await codebolt.knowledgeGraph.listMemoryRecords(instanceId, { limit: 2, offset: 0 });
        await assert(ok(pageRec.success) && (pageRec.data?.length ?? 0) <= 2, 'limit 2 returns <= 2');

        // 16. Update Memory Record
        await log('\n16. Update Memory Record');
        const upRec = await codebolt.knowledgeGraph.updateMemoryRecord(instanceId, recordId1, {
            attributes: { name: 'Alice Updated', age: 31 }
        });
        await assert(ok(upRec.success), 'updateMemoryRecord');
        const verRec = await codebolt.knowledgeGraph.getMemoryRecord(instanceId, recordId1);
        await assert(verRec.data?.attributes?.name === 'Alice Updated', 'update verified');

        // ---- Edge CRUD ----
        await log('\n--- Edge CRUD ---');

        // 17. Add Single Edge
        await log('\n17. Add Edge');
        const edge1 = await codebolt.knowledgeGraph.addEdge(instanceId, {
            kind: 'WORKS_ON',
            from_node_id: recordId1,
            to_node_id: recordId2,
            attributes: { role: 'Developer' }
        });
        await assert(ok(edge1.success) && !!edge1.data, 'addEdge');
        if (edge1.data) edgeId = edge1.data.id;

        // 18. Add Multiple Edges
        await log('\n18. Add Multiple Edges');
        const bulkIds = bulkRec.data?.map((r: any) => r.id) ?? [];
        if (bulkIds.length >= 2) {
            const bulkEdge = await codebolt.knowledgeGraph.addEdges(instanceId, [
                { kind: 'WORKS_ON', from_node_id: bulkIds[0], to_node_id: recordId2, attributes: { role: 'Tester' } },
                { kind: 'MANAGES', from_node_id: bulkIds[1], to_node_id: recordId2, attributes: { since: '2024-06-01' } }
            ]);
            await assert(ok(bulkEdge.success), 'addEdges bulk');
        } else {
            skip();
            await log('  ⏭️  addEdges bulk skipped');
        }

        // 19. List Edges — all
        await log('\n19. List Edges — all');
        const listE = await codebolt.knowledgeGraph.listEdges(instanceId);
        await assert(ok(listE.success) && (listE.data?.length ?? 0) >= 1, 'listEdges');

        // 20. List Edges — filter by kind
        await log('\n20. List Edges — filter kind');
        const filtE = await codebolt.knowledgeGraph.listEdges(instanceId, { kind: 'WORKS_ON' });
        await assert(ok(filtE.success), 'listEdges filter kind');

        // 21. List Edges — filter by from_node_id
        await log('\n21. List Edges — filter from_node_id');
        const filtFrom = await codebolt.knowledgeGraph.listEdges(instanceId, { from_node_id: recordId1 });
        await assert(ok(filtFrom.success) && (filtFrom.data?.length ?? 0) >= 1, 'filter by from_node_id');

        // 22. List Edges — filter by to_node_id
        await log('\n22. List Edges — filter to_node_id');
        const filtTo = await codebolt.knowledgeGraph.listEdges(instanceId, { to_node_id: recordId2 });
        await assert(ok(filtTo.success) && (filtTo.data?.length ?? 0) >= 1, 'filter by to_node_id');

        // ---- View Template CRUD ----
        await log('\n--- View Template CRUD ---');

        // 23. Create View Template
        await log('\n23. Create View Template');
        const vtRes = await codebolt.knowledgeGraph.createViewTemplate({
            name: `TestView_${Date.now()}`,
            description: 'Test view template',
            applicable_template_ids: [templateId],
            match: { kind: 'Person', alias: 'p' },
            return: ['p.name', 'p.age']
        });
        await assert(ok(vtRes.success) && !!vtRes.data, 'createViewTemplate');
        if (vtRes.data) viewTemplateId = vtRes.data.id;

        // 24. Get View Template
        await log('\n24. Get View Template');
        const getVT = await codebolt.knowledgeGraph.getViewTemplate(viewTemplateId);
        await assert(ok(getVT.success) && getVT.data?.id === viewTemplateId, 'getViewTemplate');

        // 25. List View Templates
        await log('\n25. List View Templates');
        const listVT = await codebolt.knowledgeGraph.listViewTemplates();
        await assert(ok(listVT.success) && Array.isArray(listVT.data), 'listViewTemplates');

        // 26. List View Templates — filtered
        await log('\n26. List View Templates — filtered');
        const filtVT = await codebolt.knowledgeGraph.listViewTemplates(templateId);
        await assert(ok(filtVT.success), 'listViewTemplates filtered');

        // 27. Update View Template
        await log('\n27. Update View Template');
        const upVT = await codebolt.knowledgeGraph.updateViewTemplate(viewTemplateId, {
            description: 'Updated view description'
        });
        await assert(ok(upVT.success), 'updateViewTemplate');

        // ---- View CRUD ----
        await log('\n--- View CRUD ---');

        // 28. Create View
        await log('\n28. Create View');
        const viewRes = await codebolt.knowledgeGraph.createView({
            name: `View_${Date.now()}`,
            instanceId,
            templateId: viewTemplateId
        });
        await assert(ok(viewRes.success) && !!viewRes.data, 'createView');
        if (viewRes.data) viewId = viewRes.data.id;

        // 29. List Views
        await log('\n29. List Views');
        const listV = await codebolt.knowledgeGraph.listViews(instanceId);
        await assert(ok(listV.success) && listV.data?.some((v: any) => v.id === viewId), 'view in list');

        // 30. Execute View
        await log('\n30. Execute View');
        const execV = await codebolt.knowledgeGraph.executeView(viewId);
        await assert(ok(execV.success), 'executeView');

        // ---- Cleanup ----
        await log('\n--- Cleanup ---');

        await assert(ok((await codebolt.knowledgeGraph.deleteView(viewId)).success), 'deleteView');
        await assert(ok((await codebolt.knowledgeGraph.deleteViewTemplate(viewTemplateId)).success), 'deleteViewTemplate');
        await assert(ok((await codebolt.knowledgeGraph.deleteEdge(instanceId, edgeId)).success), 'deleteEdge');
        await assert(ok((await codebolt.knowledgeGraph.deleteMemoryRecord(instanceId, recordId1)).success), 'deleteMemoryRecord');
        await assert(ok((await codebolt.knowledgeGraph.deleteInstance(instanceId)).success), 'deleteInstance');
        await assert(ok((await codebolt.knowledgeGraph.deleteInstanceTemplate(templateId)).success), 'deleteInstanceTemplate');

    } catch (err) {
        await log(`  ❌ Knowledge Graph error: ${err}`);
    }
}
