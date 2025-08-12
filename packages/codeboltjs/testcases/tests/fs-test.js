const codebolt = require('@codebolt/codeboltjs').default;
async function testFileSystemOperations() {
    console.log('🗂️  Testing File System Operations');
    console.log('==================================');
    
    try {


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
        
        console.log('\n3. Testing file update...');
        const updateResult = await codebolt.fs.updateFile(
            'fs-test-file.txt',
            '.',
            'This is updated content for the test file'
        );
        console.log('✅ File updated:', updateResult);
        
        console.log('\n4. Testing writeToFile...');
        const writeResult = await codebolt.fs.writeToFile(
            './fs-test-file.txt',
            'This is content written using writeToFile method'
        );
        console.log('✅ Write to file:', writeResult);
        
        console.log('\n5. Testing directory listing with listFile...');
        const listResult = await codebolt.fs.listFile('.', false);
        console.log('✅ Directory listing (listFile):', listResult);
        
        console.log('\n6. Testing directory listing with listFiles...');
        const listFilesResult = await codebolt.fs.listFile('.', false, true);
        console.log('✅ Directory listing (listFiles):', listFilesResult);
        
        console.log('\n7. Testing recursive directory listing...');
        const recursiveListResult = await codebolt.fs.listFile('.', true);
        console.log('✅ Recursive listing:', recursiveListResult);
        
        console.log('\n8. Testing folder creation...');
        const folderResult = await codebolt.fs.createFolder('test-folder', '.');
        console.log('✅ Folder created:', folderResult);
        
        console.log('\n9. Testing file search with searchFiles...');
        const searchResult = await codebolt.fs.searchFiles('.', '.*\\.txt', '*.txt');
        console.log('✅ File search result:', searchResult);
        
        console.log('\n10. Testing fileSearch (fuzzy search)...');
        const fuzzySearchResult = await codebolt.fs.fileSearch('test');
        console.log('✅ Fuzzy file search result:', fuzzySearchResult);
        
        console.log('\n11. Testing grepSearch...');
        const grepResult = await codebolt.fs.grepSearch('.', 'test', '*.txt', null, true);
        console.log('✅ Grep search result:', grepResult);
        
        console.log('\n12. Testing code definition names...');
        const codeDefResult = await codebolt.fs.listCodeDefinitionNames('.');
        console.log('✅ Code definitions:', codeDefResult);
        
        console.log('\n13. Testing editFileWithDiff...');
        const editResult = await codebolt.fs.editFileWithDiff(
            './fs-test-file.txt',
            'Updated content with diff',
            'test-diff',
            'Test file edit',
            'default'
        );
        console.log('✅ Edit file with diff:', editResult);
        
        console.log('\n14. Testing file deletion...');
        const deleteResult = await codebolt.fs.deleteFile('fs-test-file.txt', '.');
        console.log('✅ File deleted:', deleteResult);
        
        console.log('\n15. Testing folder deletion...');
        const deleteFolderResult = await codebolt.fs.deleteFolder('test-folder', '.');
        console.log('✅ Folder deleted:', deleteFolderResult);
        
        console.log('\n🎉 All file system tests completed successfully!');
        
    } catch (error) {
        console.error('❌ File system test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testFileSystemOperations().catch(console.error); 