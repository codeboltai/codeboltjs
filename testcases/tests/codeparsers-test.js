const codebolt = require('@codebolt/codeboltjs').default;

async function testCodeParsers() {
    console.log('🔍 Testing Code Parsers');
    console.log('=======================');
    
    try {
    
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing JavaScript parsing...');
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
        const jsResult = await codebolt.codeparsers.parseJavaScript(jsCode);
        console.log('✅ JavaScript parse result:', jsResult);
        console.log('   - Language:', jsResult.language);
        
        console.log('\n2. Testing TypeScript parsing...');
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
        const tsResult = await codebolt.codeparsers.parseTypeScript(tsCode);
        console.log('✅ TypeScript parse result:', tsResult);
        console.log('   - Language:', tsResult.language);
        
        console.log('\n3. Testing Python parsing...');
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
        const pythonResult = await codebolt.codeparsers.parsePython(pythonCode);
        console.log('✅ Python parse result:', pythonResult);
        console.log('   - Language:', pythonResult.language);
        
        console.log('\n4. Testing generic parsing with Java...');
        const javaCode = `
public class HelloWorld {
    private String message;
    
    public HelloWorld(String message) {
        this.message = message;
    }
    
    public void printMessage() {
        System.out.println(this.message);
    }
    
    public static void main(String[] args) {
        HelloWorld hw = new HelloWorld("Hello, World!");
        hw.printMessage();
    }
}
        `;
        const javaResult = await codebolt.codeparsers.parseGeneric(javaCode, 'java');
        console.log('✅ Java parse result:', javaResult);
        console.log('   - Language:', javaResult.language);
        
        console.log('\n5. Testing generic parsing with C++...');
        const cppCode = `
#include <iostream>
#include <string>

class Greeter {
private:
    std::string name;
    
public:
    Greeter(const std::string& n) : name(n) {}
    
    void greet() {
        std::cout << "Hello, " << name << "!" << std::endl;
    }
};

int main() {
    Greeter g("World");
    g.greet();
    return 0;
}
        `;
        const cppResult = await codebolt.codeparsers.parseGeneric(cppCode, 'cpp');
        console.log('✅ C++ parse result:', cppResult);
        console.log('   - Language:', cppResult.language);
        
        console.log('\n6. Testing classes in file...');
        const classResult = await codebolt.codeparsers.getClassesInFile(jsCode);
        console.log('✅ Classes in file result:', classResult);
        
        console.log('\n7. Testing functions in class...');
        const functionsResult = await codebolt.codeparsers.getFunctionsinClass(jsCode, 'Calculator');
        console.log('✅ Functions in class result:', functionsResult);
        
        console.log('\n8. Testing AST tree generation...');
        const astResult = await codebolt.codeparsers.getAstTreeInFile(jsCode, 'Calculator');
        console.log('✅ AST tree result:', astResult);
        
        console.log('\n9. Testing empty code parsing...');
        const emptyResult = await codebolt.codeparsers.parseJavaScript('');
        console.log('✅ Empty code parse result:', emptyResult);
        
        console.log('\n🎉 All code parser tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Code parser test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testCodeParsers().catch(console.error); 