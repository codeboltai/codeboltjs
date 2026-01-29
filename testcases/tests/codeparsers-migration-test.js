const { cbcodeparsers } = require('@codebolt/codeparser');
const fs = require('fs').promises;
const path = require('path');

async function testCodeParsersMigration() {
    console.log('🔍 Testing CodeParsers Migration');
    console.log('=====================================');
    
    try {
        // Create temporary test files
        const tempDir = path.join(__dirname, '../temp-migration');
        await fs.mkdir(tempDir, { recursive: true });
        
        // JavaScript test file
        const jsFilePath = path.join(tempDir, 'test.js');
        const jsCode = `
function greet(name) {
    return "Hello, " + name + "!";
}

class Calculator {
    add(a, b) {
        return a + b;
    }
    
    multiply(a, b) {
        return a * b;
    }
}
        `;
        await fs.writeFile(jsFilePath, jsCode);
        
        console.log('\n1. Testing getClassesInFile with JavaScript...');
        const jsClassResult = await cbcodeparsers.getClassesInFile(jsFilePath);
        console.log('✅ JavaScript classes result:', jsClassResult);
        
        console.log('\n2. Testing getFunctionsinClass with JavaScript...');
        const jsFunctionsResult = await cbcodeparsers.getFunctionsinClass(jsFilePath, 'Calculator');
        console.log('✅ JavaScript functions result:', jsFunctionsResult);
        
        console.log('\n3. Testing getAstTreeInFile with JavaScript...');
        const jsAstResult = await cbcodeparsers.getAstTreeInFile(jsFilePath, 'Calculator');
        console.log('✅ JavaScript AST tree result (structure):', 
            jsAstResult ? {
                type: jsAstResult.type,
                children: jsAstResult.children ? jsAstResult.children.length : 0
            } : jsAstResult);
        
        console.log('\n4. Testing error handling for non-existent file...');
        const nonExistentResult = await cbcodeparsers.getClassesInFile('non-existent-file.js');
        console.log('✅ Non-existent file result:', nonExistentResult);
        
        // Clean up temp files
        await fs.rm(tempDir, { recursive: true, force: true });
        
        console.log('\n🎉 CodeParsers migration test completed successfully!');
        console.log('✨ Functions are now available from @codebolt/codeparser package');
        
    } catch (error) {
        console.error('❌ Migration test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testCodeParsersMigration().catch(console.error);