const codebolt = require('@codebolt/codeboltjs');

async function testGitMCPTools() {
    console.log('🔀 Testing Git MCP Tools');
    console.log('========================');
    await codebolt.waitForConnection();
    try {
        // 1. git_init
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_init', { dir: './' });
            console.log('✅ git_init:', result?.success);
        } catch (e) { console.log('⚠️  git_init failed:', e.message); }
        // 2. git_add
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_add', { files: ['test.txt'] });
            console.log('✅ git_add:', result?.success);
        } catch (e) { console.log('⚠️  git_add failed:', e.message); }
        // 3. git_commit
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_commit', { message: 'Test commit' });
            console.log('✅ git_commit:', result?.success);
        } catch (e) { console.log('⚠️  git_commit failed:', e.message); }
        // 4. git_push
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_push', {});
            console.log('✅ git_push:', result?.success);
        } catch (e) { console.log('⚠️  git_push failed:', e.message); }
        // 5. git_pull
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_pull', {});
            console.log('✅ git_pull:', result?.success);
        } catch (e) { console.log('⚠️  git_pull failed:', e.message); }
        // 6. git_checkout (requires a real branch name)
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_checkout', { branch: 'main' });
            console.log('✅ git_checkout:', result?.success);
        } catch (e) { console.log('⚠️  git_checkout failed:', e.message); }
        // 7. git_branch (requires a new branch name)
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_branch', { branch: 'test-branch' });
            console.log('✅ git_branch:', result?.success);
        } catch (e) { console.log('⚠️  git_branch failed:', e.message); }
        // 8. git_logs
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_logs', {});
            console.log('✅ git_logs:', result?.success, 'Logs:', result?.data?.length || 0);
        } catch (e) { console.log('⚠️  git_logs failed:', e.message); }
        // 9. git_diff (requires a real commit hash)
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_diff', { commitHash: 'HEAD~1' });
            console.log('✅ git_diff:', result?.success, 'Diff:', !!result?.data);
        } catch (e) { console.log('⚠️  git_diff failed:', e.message); }
        // 10. git_status
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_status', {});
            console.log('✅ git_status:', result?.success, 'Status:', result?.data);
        } catch (e) { console.log('⚠️  git_status failed:', e.message); }
        // 11. git_clone (requires a real repo URL)
        try {
            const result = await codebolt.tools.executeTool('codebolt.git', 'git_clone', { url: 'https://github.com/user/repo.git' });
            console.log('✅ git_clone:', result?.success);
        } catch (e) { console.log('⚠️  git_clone failed:', e.message); }
        console.log('🎉 Git MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Git MCP tools test error:', e.message);
    }
}

testGitMCPTools(); 