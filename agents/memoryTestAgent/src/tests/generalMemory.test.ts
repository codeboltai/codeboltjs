import codebolt from '@codebolt/codeboltjs';
import { log, ok, assert } from './helpers';

export async function testGeneralMemory() {
    await log('\n══════════════════════════════════════');
    await log('  GENERAL MEMORY TESTS (JSON/Todo/MD)');
    await log('══════════════════════════════════════');

    // ===== JSON Memory =====
    await log('\n--- JSON Memory ---');
    let jsonId = '';

    try {
        // 1. Save JSON
        await log('\n1. Save JSON');
        const save = await codebolt.memory.json.save({
            title: 'Test Note',
            content: 'Test JSON memory content',
            tags: ['test', 'json'],
            priority: 1,
            nested: { key: 'value' }
        });
        await assert(ok(save.success) && !!save.memoryId, 'save JSON');
        if (save.memoryId) jsonId = save.memoryId;

        // 2. List JSON
        await log('\n2. List JSON');
        const list = await codebolt.memory.json.list();
        await assert(ok(list.success) && Array.isArray(list.items), 'list JSON');

        // 3. List JSON with filters
        await log('\n3. List JSON with filters');
        const listF = await codebolt.memory.json.list({ format: 'json' });
        await assert(ok(listF.success), 'list JSON filtered');

        // 4. Update JSON
        await log('\n4. Update JSON');
        const upd = await codebolt.memory.json.update(jsonId, {
            title: 'Updated Note',
            content: 'Updated content',
            tags: ['test', 'json', 'updated'],
            priority: 2
        });
        await assert(ok(upd.success), 'update JSON');

        // 5. Delete JSON
        await log('\n5. Delete JSON');
        await assert(ok((await codebolt.memory.json.delete(jsonId)).success), 'delete JSON');

    } catch (err) {
        await log(`  ❌ JSON Memory error: ${err}`);
    }

    // ===== Todo Memory =====
    await log('\n--- Todo Memory ---');
    let todoId = '';

    try {
        // 6. Save Todo
        await log('\n6. Save Todo');
        const save = await codebolt.memory.todo.save(
            {
                title: 'Test Todo List',
                items: [
                    { id: '1', text: 'Write tests', completed: false },
                    { id: '2', text: 'Run tests', completed: false },
                    { id: '3', text: 'Review results', completed: false }
                ]
            } as any,
            { project: 'memoryTestAgent', priority: 'high' }
        );
        await assert(ok(save.success) && !!save.memoryId, 'save todo');
        if (save.memoryId) todoId = save.memoryId;

        // 7. List Todo
        await log('\n7. List Todo');
        const list = await codebolt.memory.todo.list();
        await assert(ok(list.success) && Array.isArray(list.items), 'list todo');

        // 8. Update Todo — mark item complete
        await log('\n8. Update Todo Item');
        const upd = await codebolt.memory.todo.update(todoId, {
            id: '1',
            text: 'Write tests',
            completed: true
        } as any);
        await assert(ok(upd.success), 'update todo item');

        // 9. Update Todo — modify text
        await log('\n9. Update Todo — modify text');
        const upd2 = await codebolt.memory.todo.update(todoId, {
            id: '2',
            text: 'Run all test suites',
            completed: false
        } as any);
        await assert(ok(upd2.success), 'update todo text');

        // 10. Delete Todo
        await log('\n10. Delete Todo');
        await assert(ok((await codebolt.memory.todo.delete(todoId)).success), 'delete todo');

    } catch (err) {
        await log(`  ❌ Todo Memory error: ${err}`);
    }

    // ===== Markdown Memory =====
    await log('\n--- Markdown Memory ---');
    let mdId = '';

    try {
        // 11. Save Markdown
        await log('\n11. Save Markdown');
        const save = await codebolt.memory.markdown.save(
            '# Test Document\n\nThis is a **test** markdown.\n\n## Section 1\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("hello");\n```',
            { category: 'test', author: 'memoryTestAgent' }
        );
        await assert(ok(save.success) && !!save.memoryId, 'save markdown');
        if (save.memoryId) mdId = save.memoryId;

        // 12. List Markdown
        await log('\n12. List Markdown');
        const list = await codebolt.memory.markdown.list();
        await assert(ok(list.success) && Array.isArray(list.items), 'list markdown');

        // 13. Update Markdown
        await log('\n13. Update Markdown');
        const upd = await codebolt.memory.markdown.update(
            mdId,
            '# Updated Document\n\nThis is an **updated** test.\n\n## New Section\n\n1. First\n2. Second',
            { category: 'test', author: 'memoryTestAgent', version: 2 }
        );
        await assert(ok(upd.success), 'update markdown');

        // 14. Update Markdown — large content
        await log('\n14. Update Markdown — large');
        const longContent = '# Large Doc\n\n' + Array.from({ length: 50 }, (_, i) => `## Section ${i + 1}\n\nParagraph ${i + 1} content here.\n`).join('\n');
        const updLarge = await codebolt.memory.markdown.update(mdId, longContent, { category: 'test', large: true });
        await assert(ok(updLarge.success), 'update large markdown');

        // 15. Delete Markdown
        await log('\n15. Delete Markdown');
        await assert(ok((await codebolt.memory.markdown.delete(mdId)).success), 'delete markdown');

    } catch (err) {
        await log(`  ❌ Markdown Memory error: ${err}`);
    }
}
