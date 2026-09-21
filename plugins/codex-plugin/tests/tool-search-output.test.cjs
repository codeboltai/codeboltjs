const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const typescript = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/index.ts'), 'utf8');
const compiled = typescript.transpileModule(source, {
    compilerOptions: {
        module: typescript.ModuleKind.CommonJS,
        target: typescript.ScriptTarget.ES2020,
    },
}).outputText;
const context = {
    exports: {},
    require(moduleName) {
        if (moduleName === '@codebolt/plugin-sdk') {
            return { onStart() {}, onStop() {} };
        }
        if (moduleName === './auth') return {};
        return require(moduleName);
    },
};
vm.runInNewContext(`${compiled}\nexports.buildResponsesBody = buildResponsesBody;`, context);
const buildResponsesBody = (options) => JSON.parse(JSON.stringify(
    context.exports.buildResponsesBody(options),
));

const functionDefinition = {
    name: 'read_document',
    description: 'Read a document.',
    parameters: { type: 'object', properties: { paths: { type: 'array' } } },
};
const toolShapes = {
    flat: { type: 'function', ...functionDefinition, defer_loading: false },
    nested: { type: 'function', function: functionDefinition },
    provider: { type: 'provider_tool', definition: { type: 'function', ...functionDefinition } },
    namespace: {
        type: 'namespace',
        name: 'documents',
        tools: [{ type: 'function', ...functionDefinition }],
    },
};

for (const [shapeName, discoveredTool] of Object.entries(toolShapes)) {
    test(`search output marks ${shapeName} functions deferred without mutating input`, () => {
        const options = {
            tools: [{ type: 'function', name: 'tool_search', parameters: { type: 'object' } }],
            input: [
                { type: 'function_call', call_id: 'search-1', name: 'tool_search', arguments: '{}' },
                { type: 'tool_search_output', call_id: 'search-1', tools: [discoveredTool] },
            ],
        };
        const originalOptions = JSON.stringify(options);
        const body = buildResponsesBody(options);
        const output = body.input[1];
        assert.equal(output.type, 'tool_search_output');
        assert.equal(output.call_id, 'search-1');
        assert.equal(output.execution, 'client');
        assert.equal(output.status, 'completed');
        assert.equal(output.tools.length, 1);
        assert.equal(output.tools[0].name, 'read_document');
        assert.equal(output.tools[0].defer_loading, true);
        assert.deepEqual(output.tools[0].parameters.properties.paths.items, {});
        assert.equal(body.tools.find((tool) => tool.name === 'tool_search').defer_loading, undefined);
        assert.ok(body.tools.some((tool) => tool.name === 'read_document'));
        assert.equal(JSON.stringify(options), originalOptions);
    });
}

test('empty search results remain valid', () => {
    const body = buildResponsesBody({
        input: [{ type: 'tool_search_output', call_id: 'empty-search', tools: [] }],
    });
    assert.deepEqual(body.input[0].tools, []);
});
