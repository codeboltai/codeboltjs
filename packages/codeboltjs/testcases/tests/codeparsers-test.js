const codebolt = require('@codebolt/codeboltjs').default;
const fs = require('fs').promises;
const path = require('path');

async function testCodeParsers() {
    console.log('🔍 Testing Code Parsers');
    console.log('=======================');
    
    try {
        await codebolt.waitForConnection();
        
        // Create temporary test files
        const tempDir = path.join(__dirname, '../temp');
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
        
        // TypeScript test file
        const tsFilePath = path.join(tempDir, 'test.ts');
        const tsCode = `
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    addUser(user: User): void {
        this.users.push(user);
    }
    
    getUser(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }
}
        `;
        await fs.writeFile(tsFilePath, tsCode);
        
        // Python test file
        const pyFilePath = path.join(tempDir, 'test.py');
        const pythonCode = `
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def get_history(self):
        return self.history

def greet(name):
    return f"Hello, {name}!"
        `;
        await fs.writeFile(pyFilePath, pythonCode);
        

        
        console.log('\n1. Testing getClassesInFile with JavaScript...');
        const jsClassResult = await codebolt.codeparsers.getClassesInFile(jsFilePath);
        console.log('✅ JavaScript classes result:', jsClassResult);
        
        console.log('\n2. Testing getClassesInFile with TypeScript...');
        const tsClassResult = await codebolt.codeparsers.getClassesInFile(tsFilePath);
        console.log('✅ TypeScript classes result:', tsClassResult);
        
        console.log('\n3. Testing getClassesInFile with Python...');
        const pyClassResult = await codebolt.codeparsers.getClassesInFile(pyFilePath);
        console.log('✅ Python classes result:', pyClassResult);
        
        console.log('\n4. Testing getFunctionsinClass with JavaScript...');
        const jsFunctionsResult = await codebolt.codeparsers.getFunctionsinClass(jsFilePath, 'Calculator');
        console.log('✅ JavaScript functions result:', jsFunctionsResult);
        
        console.log('\n5. Testing getFunctionsinClass with TypeScript...');
        const tsFunctionsResult = await codebolt.codeparsers.getFunctionsinClass(tsFilePath, 'UserService');
        console.log('✅ TypeScript functions result:', tsFunctionsResult);
        
        console.log('\n6. Testing getFunctionsinClass with Python...');
        const pyFunctionsResult = await codebolt.codeparsers.getFunctionsinClass(pyFilePath, 'Calculator');
        console.log('✅ Python functions result:', pyFunctionsResult);
        
        console.log('\n7. Testing getAstTreeInFile with JavaScript...');
        const jsAstResult = await codebolt.codeparsers.getAstTreeInFile(jsFilePath, 'Calculator');
        console.log('✅ JavaScript AST tree result (structure):', 
            jsAstResult ? {
                type: jsAstResult.type,
                children: jsAstResult.children ? jsAstResult.children.length : 0
            } : jsAstResult);
        
        console.log('\n8. Testing getAstTreeInFile with TypeScript...');
        const tsAstResult = await codebolt.codeparsers.getAstTreeInFile(tsFilePath, 'UserService');
        console.log('✅ TypeScript AST tree result (structure):', 
            tsAstResult ? {
                type: tsAstResult.type,
                children: tsAstResult.children ? tsAstResult.children.length : 0
            } : tsAstResult);
        
        console.log('\n9. Testing getAstTreeInFile with Python...');
        const pyAstResult = await codebolt.codeparsers.getAstTreeInFile(pyFilePath, 'Calculator');
        console.log('✅ Python AST tree result (structure):', 
            pyAstResult ? {
                type: pyAstResult.type,
                children: pyAstResult.children ? pyAstResult.children.length : 0
            } : pyAstResult);
        
        console.log('\n10. Testing getAstTreeInFile with full file (no class specified)...');
        const fullAstResult = await codebolt.codeparsers.getAstTreeInFile(jsFilePath);
        console.log('✅ Full AST tree result (structure):', 
            fullAstResult ? {
                type: fullAstResult.type,
                children: fullAstResult.children ? fullAstResult.children.length : 0
            } : fullAstResult);
        
        console.log('\n11. Testing error handling for non-existent file...');
        const nonExistentResult = await codebolt.codeparsers.getClassesInFile('non-existent-file.js');
        console.log('✅ Non-existent file result:', nonExistentResult);
        
        console.log('\n12. Testing error handling for unsupported file type...');
        const unsupportedFilePath = path.join(tempDir, 'test.unsupported');
        await fs.writeFile(unsupportedFilePath, 'Test content');
        const unsupportedResult = await codebolt.codeparsers.getClassesInFile(unsupportedFilePath);
        console.log('✅ Unsupported file type result:', unsupportedResult);
        
        // Clean up temp files
        await fs.rm(tempDir, { recursive: true, force: true });
        
        console.log('\n🎉 All code parser tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Code parser test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testCodeParsers().catch(console.error); 