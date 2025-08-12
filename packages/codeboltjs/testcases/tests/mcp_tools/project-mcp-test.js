const codebolt = require('@codebolt/codeboltjs');

async function testProjectMCPTools() {
    console.log('📁 Testing Project MCP Tools');
    console.log('============================');
    await codebolt.waitForConnection();
    try {
        // 1. project_get_path
        try {
            const result = await codebolt.tools.executeTool('codebolt.project', 'project_get_path', {});
            console.log('✅ project_get_path:', result?.success, 'Path:', result?.data);
        } catch (e) { console.log('⚠️  project_get_path failed:', e.message); }
        // 2. project_get_settings
        try {
            const result = await codebolt.tools.executeTool('codebolt.project', 'project_get_settings', {});
            console.log('✅ project_get_settings:', result?.success, 'Settings:', !!result?.data);
        } catch (e) { console.log('⚠️  project_get_settings failed:', e.message); }
        // 3. project_get_repo_map
        try {
            const result = await codebolt.tools.executeTool('codebolt.project', 'project_get_repo_map', {});
            console.log('✅ project_get_repo_map:', result?.success, 'RepoMap:', !!result?.data);
        } catch (e) { console.log('⚠️  project_get_repo_map failed:', e.message); }
        // 4. project_get_editor_status
        try {
            const result = await codebolt.tools.executeTool('codebolt.project', 'project_get_editor_status', {});
            console.log('✅ project_get_editor_status:', result?.success, 'Status:', !!result?.data);
        } catch (e) { console.log('⚠️  project_get_editor_status failed:', e.message); }
        console.log('🎉 Project MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Project MCP tools test error:', e.message);
    }
}

testProjectMCPTools(); 