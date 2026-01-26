const codebolt = require('@codebolt/codeboltjs');
const { join } = require('path');

async function testGitOperations() {
    console.log('🔧 Testing Git Operations');
    console.log('=========================');
    
    try {
   
       
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing git init...');
        const initResult = await codebolt.git.init();
        console.log('✅ Git init result:', initResult);
        
        console.log('\n2. Testing git status...');
        const statusResult = await codebolt.git.status();
        console.log('✅ Git status result:', statusResult);
        
        // Create a test file for git operations
        console.log('\n3. Creating a test file for git operations...');
        await codebolt.fs.createFile('README.md', '# Git Test Repository\n\nThis is a test repository created by CodeboltJS git tests.');
        console.log('✅ Test file created');
        
        console.log('\n4. Testing git status after file creation...');
        const statusAfterFileResult = await codebolt.git.status();
        console.log('✅ Git status after file creation:', statusAfterFileResult);
        
        console.log('\n5. Testing git add...');
        const addResult = await codebolt.git.addAll();
        console.log('✅ Git add result:', addResult);
        
        console.log('\n6. Testing git status after add...');
        const statusAfterAddResult = await codebolt.git.status();
        console.log('✅ Git status after add:', statusAfterAddResult);
        
        console.log('\n7. Testing git commit...');
        const commitResult = await codebolt.git.commit('Initial commit from CodeboltJS test');
        console.log('✅ Git commit result:', commitResult);
        
        console.log('\n8. Testing git logs...');
        const logsResult = await codebolt.git.logs();
        console.log('✅ Git logs result:', logsResult);
        
        console.log('\n9. Testing git branch creation...');
        const branchResult = await codebolt.git.branch('test-branch');
        console.log('✅ Git branch creation result:', branchResult);
        
        console.log('\n10. Testing git checkout...');
        const checkoutResult = await codebolt.git.checkout('test-branch');
        console.log('✅ Git checkout result:', checkoutResult);
        
        // Create another file in the new branch
        console.log('\n11. Creating another file in test branch...');
        await codebolt.fs.createFile('test-file.txt', 'This file was created in the test branch.');
        console.log('✅ Test file created in branch');
        
        console.log('\n12. Testing git add and commit in new branch...');
        await codebolt.git.addAll();
        const branchCommitResult = await codebolt.git.commit('Add test file in test branch');
        console.log('✅ Branch commit result:', branchCommitResult);
        
        console.log('\n13. Testing git checkout back to main...');
        const checkoutMainResult = await codebolt.git.checkout('main');
        console.log('✅ Checkout main result:', checkoutMainResult);
        
        console.log('\n14. Testing git logs on main branch...');
        const mainLogsResult = await codebolt.git.logs();
        console.log('✅ Main branch logs:', mainLogsResult);
        
        // Note: Clone, pull, and push tests are commented out as they require remote repositories
        /*
        console.log('\n15. Testing git clone (requires remote URL)...');
        const cloneResult = await codebolt.git.clone('https://github.com/example/repo.git', './cloned-repo');
        console.log('✅ Git clone result:', cloneResult);
        
        console.log('\n16. Testing git pull (requires remote)...');
        const pullResult = await codebolt.git.pull();
        console.log('✅ Git pull result:', pullResult);
        
        console.log('\n17. Testing git push (requires remote)...');
        const pushResult = await codebolt.git.push();
        console.log('✅ Git push result:', pushResult);
        */
        
        // Test diff if we have commits
        if (logsResult && logsResult.success && logsResult.logs && logsResult.logs.length > 0) {
            console.log('\n15. Testing git diff...');
            const firstCommitHash = logsResult.logs[0].hash || logsResult.logs[0].commit;
            if (firstCommitHash) {
                const diffResult = await codebolt.git.diff(firstCommitHash);
                console.log('✅ Git diff result:', diffResult);
            } else {
                console.log('⚠️  No commit hash found for diff test');
            }
        }
        
        console.log('\n🎉 All git tests completed successfully!');
        console.log('Note: Clone, pull, and push tests are commented out as they require remote repositories');
        
    } catch (error) {
        console.error('❌ Git test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testGitOperations().catch(console.error); 