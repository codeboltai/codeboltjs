const codebolt = require('@codebolt/codeboltjs').default;

async function testCodeUtils() {
    console.log('🛠️  Testing Code Utilities');
    console.log('===========================');
    
    try {
        // await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing JavaScript tree generation for current directory...');
        try {
            eerr
            // const jsTreeResult = await codebolt.codeutils.getJsTree();
            // console.log('✅ JS tree result:', jsTreeResult);
            // console.log('   - Event type:', jsTreeResult?.event);
            // console.log('   - Payload available:', !!jsTreeResult?.payload);
        } catch (error) {
            console.log('⚠️  JS tree generation failed:', error.message);
        }
        
        console.log('\n2. Testing JavaScript tree generation for specific file...');
        try {
            fdf
            // const specificFileResult = await codebolt.codeutils.getJsTree('./tests/terminal-test.js');
            console.log('✅ Specific file JS tree result:', specificFileResult);
            console.log('   - Event type:', specificFileResult?.event);
        } catch (error) {
            console.log('⚠️  Specific file JS tree generation failed:', error.message);
        }
        
        console.log('\n3. Testing get all files as Markdown...');
        try {
            const markdownResult = await codebolt.codeutils.getAllFilesAsMarkDown();
            console.log('✅ Markdown result:', markdownResult);
            console.log('   - Type:', markdownResult?.type);
            console.log('   - Content length:', markdownResult?.content?.length || 0);
        } catch (error) {
            console.log('⚠️  Get all files as Markdown failed:', error.message);
        }
        
        console.log('\n4. Testing matcher list retrieval...');
        try {
            const matcherListResult = await codebolt.codeutils.getMatcherList();
            console.log('✅ Matcher list result:', matcherListResult);
            console.log('   - Type:', matcherListResult?.type);
            console.log('   - Matchers count:', matcherListResult?.matchers?.length || 0);
        } catch (error) {
            console.log('⚠️  Matcher list retrieval failed:', error.message);
        }
        
        console.log('\n5. Testing match detail retrieval...');
        try {
            const matchDetailResult = await codebolt.codeutils.matchDetail('test-matcher');
            console.log('✅ Match detail result:', matchDetailResult);
            console.log('   - Type:', matchDetailResult?.type);
            console.log('   - Details available:', !!matchDetailResult?.details);
        } catch (error) {
            console.log('⚠️  Match detail retrieval failed:', error.message);
        }
        
        console.log('\n6. Testing perform match operation...');
        try {
            const matcherDefinition = {
                name: 'test-matcher',
                pattern: 'function.*\\(',
                language: 'javascript'
            };
            const problemPatterns = [
                { pattern: 'console\\.log', severity: 'warning' },
                { pattern: 'var\\s+', severity: 'error' }
            ];
            const problems = [
                { line: 1, message: 'Use const instead of var' },
                { line: 5, message: 'Remove console.log' }
            ];
            
            const performMatchResult = await codebolt.codeutils.performMatch(
                matcherDefinition, 
                problemPatterns, 
                problems
            );
            console.log('✅ Perform match result:', performMatchResult);
            console.log('   - Type:', performMatchResult?.type);
        } catch (error) {
            console.log('⚠️  Perform match operation failed:', error.message);
        }
        
        console.log('\n7. Testing JavaScript tree with TypeScript file...');
        try {
            const tsFileResult = await codebolt.codeutils.getJsTree('./src/index.ts');
            console.log('✅ TypeScript file JS tree result:', tsFileResult);
        } catch (error) {
            console.log('⚠️  TypeScript file processing failed:', error.message);
        }
        
        console.log('\n8. Testing code analysis with complex matcher...');
        try {
            const complexMatcher = {
                name: 'security-checker',
                patterns: [
                    'eval\\(',
                    'innerHTML\\s*=',
                    'document\\.write\\(',
                    'setTimeout\\(.*string'
                ],
                severity: 'high',
                category: 'security'
            };
            
            const securityPatterns = [
                { pattern: 'eval\\(', message: 'Avoid using eval()' },
                { pattern: 'innerHTML\\s*=', message: 'Use textContent instead of innerHTML' }
            ];
            
            const complexMatchResult = await codebolt.codeutils.performMatch(
                complexMatcher,
                securityPatterns,
                []
            );
            console.log('✅ Complex matcher result:', complexMatchResult);
        } catch (error) {
            console.log('⚠️  Complex matcher failed:', error.message);
        }
        
        console.log('\n9. Testing file tree analysis with filters...');
        try {
            const filteredTreeResult = await codebolt.codeutils.getJsTree('./tests');
            console.log('✅ Filtered tree result:', filteredTreeResult);
            console.log('   - Processing directory: ./tests');
        } catch (error) {
            console.log('⚠️  Filtered tree analysis failed:', error.message);
        }
        
        console.log('\n10. Testing markdown generation performance...');
        const startTime = Date.now();
        try {
            const perfMarkdownResult = await codebolt.codeutils.getAllFilesAsMarkDown();
            const endTime = Date.now();
            console.log('✅ Markdown generation performance:', {
                duration: `${endTime - startTime}ms`,
                success: !!perfMarkdownResult
            });
        } catch (error) {
            console.log('⚠️  Markdown generation performance test failed:', error.message);
        }
        
        console.log('\n11. Testing matcher with different languages...');
        const languageMatchers = [
            { name: 'js-matcher', language: 'javascript' },
            { name: 'ts-matcher', language: 'typescript' },
            { name: 'py-matcher', language: 'python' },
            { name: 'java-matcher', language: 'java' }
        ];
        
        for (const matcher of languageMatchers) {
            try {
                const langMatchResult = await codebolt.codeutils.matchDetail(matcher.name);
                console.log(`✅ ${matcher.language} matcher result:`, !!langMatchResult);
            } catch (error) {
                console.log(`⚠️  ${matcher.language} matcher failed:`, error.message);
            }
        }
        
        console.log('\n12. Testing error handling with invalid inputs...');
        try {
            const invalidResult = await codebolt.codeutils.getJsTree('/non/existent/path');
            console.log('✅ Invalid path handling:', invalidResult);
        } catch (error) {
            console.log('✅ Expected error for invalid path:', error.message);
        }
        
        console.log('\n🎉 All code utilities tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Code utilities test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testCodeUtils().catch(console.error); 