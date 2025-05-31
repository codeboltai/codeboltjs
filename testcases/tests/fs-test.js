const codebolt = require('@codebolt/codeboltjs').default;
async function testFileSystemOperations() {
    console.log('🗂️  Testing File System Operations');
    console.log('==================================');
    
    try {

        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing file creation...');
        const createResult = await codebolt.fs.createFile(
            'fs-test-file.txt', 
            'This is a test file created by CodeboltJS FS test', 
            '.'
        );
        console.log('✅ File created:', createResult);
        
        console.log('\n2. Testing file reading...');
        const readResult = await codebolt.fs.readFile('./fs-test-file.txt');
        console.log('✅ File read:', readResult);
        
       
        
        console.log('\n3. Testing directory listing...');
        const listResult = await codebolt.fs.listFile('.', false);
        console.log('✅ Directory listing:', listResult);
        
        console.log('\n4. Testing recursive directory listing...');
        const recursiveListResult = await codebolt.fs.listFile('.', true);
        console.log('✅ Recursive listing:', recursiveListResult);
        
        console.log('\n5. Testing folder creation...');
        const folderResult = await codebolt.fs.createFolder('test-folder', '.');
        console.log('✅ Folder created:', folderResult);
        
        console.log('\n6. Testing file search...');
        const searchResult = await codebolt.fs.searchFiles('.', '.*\\.txt', '*.txt');
        console.log('✅ File search result:', searchResult);
        
        console.log('\n7. Testing code definition names...');
        const codeDefResult = await codebolt.fs.listCodeDefinitionNames('.');
        console.log('✅ Code definitions:', codeDefResult);
        
        console.log('\n8. Testing file deletion...');
        const deleteResult = await codebolt.fs.deleteFile('fs-test-file.txt', '.');
        console.log('✅ File deleted:', deleteResult);
        
        console.log('\n9. Testing folder deletion...');
        const deleteFolderResult = await codebolt.fs.deleteFolder('test-folder', '.');
        console.log('✅ Folder deleted:', deleteFolderResult);
        
        console.log('\n🎉 All file system tests completed successfully!');
        
    } catch (error) {
        console.error('❌ File system test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testFileSystemOperations().catch(console.error); 