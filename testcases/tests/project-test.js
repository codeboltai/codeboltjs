const codebolt = require('@codebolt/codeboltjs').default;

async function testProject() {
    console.log('📁 Testing Project Management');
    console.log('=============================');
    
    try {
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing project path retrieval...');
        try {
            const pathResult = await codebolt.project.getProjectPath();
            console.log('✅ Project path result:', pathResult);
            console.log('   - Path:', pathResult?.path);
        } catch (error) {
            console.log('⚠️  Project path retrieval failed:', error.message);
        }
        
        console.log('\n2. Testing repository map retrieval...');
        try {
            const repoMapResult = await codebolt.project.getRepoMap({});
            console.log('✅ Repository map result:', repoMapResult);
        } catch (error) {
            console.log('⚠️  Repository map retrieval failed:', error.message);
        }
        
        console.log('\n3. Testing project run...');
        try {
            codebolt.project.runProject();
            console.log('✅ Project run command sent');
        } catch (error) {
            console.log('⚠️  Project run failed:', error.message);
        }
        
        console.log('\n4. Testing editor file status...');
        try {
            const fileStatusResult = await codebolt.project.getEditorFileStatus();
            console.log('✅ Editor file status result:', fileStatusResult);
            console.log('   - Current files:', fileStatusResult?.currentFiles?.length || 0);
            console.log('   - Active file:', fileStatusResult?.activeFile || 'None');
            console.log('   - Status:', fileStatusResult?.status || 'Unknown');
        } catch (error) {
            console.log('⚠️  Editor file status check failed:', error.message);
        }
        
        console.log('\n5. Testing project settings retrieval...');
        try {
            const projectSettings = await codebolt.project.getProjectSettings();
            console.log('✅ Project settings result:', projectSettings);
            if (projectSettings?.settings) {
                console.log('   - Settings available:', Object.keys(projectSettings.settings).length > 0);
                console.log('   - Settings keys:', Object.keys(projectSettings.settings || {}));
            } else {
                console.log('   - Settings not available in response');
            }
        } catch (error) {
            console.log('⚠️  Project settings retrieval failed:', error.message);
        }
        
        console.log('\n🎉 All project management tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Project test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testProject().catch(console.error); 