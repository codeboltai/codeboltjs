const codebolt = require('@codebolt/codeboltjs');

async function testProblemMatcherMCPTools() {
    console.log('🔍 Testing Problem Matcher MCP Tools');
    console.log('====================================');
    
    try {
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing problem_matcher_analyze tool...');
        try {
            const analyzeResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', {
                content: 'Error: Cannot find module "express"\n    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)',
                language: 'javascript',
                filePath: './src/app.js'
            });
            console.log('✅ Problem matcher analyze result:', analyzeResult);
            console.log('   - Success:', analyzeResult?.success);
            console.log('   - Language:', 'javascript');
            console.log('   - Problems found:', analyzeResult?.problems?.length || 0);
        } catch (error) {
            console.log('⚠️  Problem matcher analyze failed:', error.message);
        }
        
        console.log('\n2. Testing problem_matcher_get_patterns tool...');
        try {
            const getPatternsResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_get_patterns', {
                language: 'javascript'
            });
            console.log('✅ Problem matcher get patterns result:', getPatternsResult);
            console.log('   - Success:', getPatternsResult?.success);
            console.log('   - Language:', 'javascript');
            console.log('   - Patterns count:', getPatternsResult?.patterns?.length || 0);
        } catch (error) {
            console.log('⚠️  Problem matcher get patterns failed:', error.message);
        }
        
        console.log('\n3. Testing problem_matcher_add_pattern tool...');
        try {
            const addPatternResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_add_pattern', {
                name: 'custom-error-pattern',
                language: 'javascript',
                pattern: {
                    regexp: '^(.*?):(\\d+):(\\d+):\\s+(error|warning):\\s+(.*)$',
                    file: 1,
                    line: 2,
                    column: 3,
                    severity: 4,
                    message: 5
                }
            });
            console.log('✅ Problem matcher add pattern result:', addPatternResult);
            console.log('   - Success:', addPatternResult?.success);
            console.log('   - Pattern name:', 'custom-error-pattern');
            console.log('   - Language:', 'javascript');
        } catch (error) {
            console.log('⚠️  Problem matcher add pattern failed:', error.message);
        }
        
        console.log('\n4. Testing problem_matcher_remove_pattern tool...');
        try {
            const removePatternResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_remove_pattern', {
                name: 'custom-error-pattern',
                language: 'javascript'
            });
            console.log('✅ Problem matcher remove pattern result:', removePatternResult);
            console.log('   - Success:', removePatternResult?.success);
            console.log('   - Removed pattern:', 'custom-error-pattern');
        } catch (error) {
            console.log('⚠️  Problem matcher remove pattern failed:', error.message);
        }
        
        console.log('\n5. Testing problem_matcher_list_problems tool...');
        try {
            const listProblemsResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_list_problems', {
                filePath: './src',
                severity: 'error'
            });
            console.log('✅ Problem matcher list problems result:', listProblemsResult);
            console.log('   - Success:', listProblemsResult?.success);
            console.log('   - File path:', './src');
            console.log('   - Severity filter:', 'error');
            console.log('   - Problems found:', listProblemsResult?.problems?.length || 0);
        } catch (error) {
            console.log('⚠️  Problem matcher list problems failed:', error.message);
        }
        
        console.log('\n6. Testing problem matching workflow...');
        try {
            // Add custom patterns for different languages
            const patterns = [
                {
                    name: 'typescript-error',
                    language: 'typescript',
                    pattern: {
                        regexp: '^(.+)\\((\\d+),(\\d+)\\):\\s+(error|warning)\\s+TS\\d+:\\s+(.*)$',
                        file: 1,
                        line: 2,
                        column: 3,
                        severity: 4,
                        message: 5
                    }
                },
                {
                    name: 'python-error',
                    language: 'python',
                    pattern: {
                        regexp: '^\\s*File "(.+)", line (\\d+).*$',
                        file: 1,
                        line: 2,
                        message: 0
                    }
                }
            ];
            
            for (const pattern of patterns) {
                const addResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_add_pattern', pattern);
                console.log(`   - Add pattern (${pattern.language}):`, addResult?.success ? 'Success' : 'Failed');
            }
            
            // Test different error formats
            const testCases = [
                {
                    language: 'javascript',
                    content: 'ReferenceError: myVariable is not defined\n    at Object.<anonymous> (/path/to/file.js:10:5)',
                    filePath: './test.js'
                },
                {
                    language: 'typescript',
                    content: 'src/app.ts(25,10): error TS2304: Cannot find name "unknownVariable".',
                    filePath: './src/app.ts'
                },
                {
                    language: 'python',
                    content: '  File "/path/to/script.py", line 15, in <module>\n    print(undefined_var)\nNameError: name "undefined_var" is not defined',
                    filePath: './script.py'
                }
            ];
            
            for (const testCase of testCases) {
                const analyzeResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', testCase);
                console.log(`   - Analyze (${testCase.language}):`, analyzeResult?.success ? 'Success' : 'Failed');
                console.log(`   - Problems found: ${analyzeResult?.problems?.length || 0}`);
            }
            
        } catch (error) {
            console.log('⚠️  Problem matching workflow failed:', error.message);
        }
        
        console.log('\n7. Testing problem_matcher_analyze with different severities...');
        const severityTests = [
            { severity: 'error', content: 'Error: Syntax error in file' },
            { severity: 'warning', content: 'Warning: Deprecated function used' },
            { severity: 'info', content: 'Info: Consider using const instead of var' },
            { severity: 'hint', content: 'Hint: This variable could be optimized' }
        ];
        
        for (const test of severityTests) {
            try {
                const severityResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', {
                    content: test.content,
                    language: 'javascript',
                    filePath: './test.js',
                    expectedSeverity: test.severity
                });
                console.log(`✅ Severity (${test.severity}) result:`, severityResult?.success ? 'Success' : 'Failed');
                console.log(`   - Content: ${test.content}`);
                console.log(`   - Expected severity: ${test.severity}`);
            } catch (error) {
                console.log(`⚠️  Severity (${test.severity}) failed:`, error.message);
            }
        }
        
        console.log('\n8. Testing problem_matcher_get_patterns for different languages...');
        const languages = ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp'];
        
        for (const language of languages) {
            try {
                const langResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_get_patterns', {
                    language: language
                });
                console.log(`✅ Patterns (${language}) result:`, langResult?.success ? 'Success' : 'Failed');
                console.log(`   - Language: ${language}`);
                console.log(`   - Patterns available: ${langResult?.patterns?.length || 0}`);
            } catch (error) {
                console.log(`⚠️  Patterns (${language}) failed:`, error.message);
            }
        }
        
        console.log('\n9. Testing problem_matcher_list_problems with filters...');
        const filterTests = [
            { severity: 'error', limit: 10 },
            { severity: 'warning', limit: 5 },
            { filePath: './src', severity: 'all' },
            { language: 'javascript', severity: 'error' }
        ];
        
        for (const filter of filterTests) {
            try {
                const filterResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_list_problems', filter);
                console.log(`✅ Filter problems result:`, filterResult?.success ? 'Success' : 'Failed');
                console.log(`   - Filter: ${JSON.stringify(filter)}`);
                console.log(`   - Problems found: ${filterResult?.problems?.length || 0}`);
            } catch (error) {
                console.log(`⚠️  Filter problems failed:`, error.message);
            }
        }
        
        console.log('\n10. Testing problem_matcher_analyze with complex error messages...');
        const complexErrors = [
            {
                name: 'Stack trace error',
                content: `TypeError: Cannot read property 'length' of undefined
    at processArray (/app/utils.js:15:23)
    at main (/app/index.js:8:5)
    at Object.<anonymous> (/app/index.js:12:1)`,
                language: 'javascript'
            },
            {
                name: 'Compilation error',
                content: `src/components/App.tsx:45:12 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
45     setValue("invalid");
              ~~~~~~~~~`,
                language: 'typescript'
            },
            {
                name: 'Import error',
                content: `ModuleNotFoundError: No module named 'requests'
Did you mean: 'request'?`,
                language: 'python'
            }
        ];
        
        for (const errorTest of complexErrors) {
            try {
                const complexResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', {
                    content: errorTest.content,
                    language: errorTest.language,
                    filePath: './test-file'
                });
                console.log(`✅ Complex error (${errorTest.name}) result:`, complexResult?.success ? 'Success' : 'Failed');
                console.log(`   - Error type: ${errorTest.name}`);
                console.log(`   - Language: ${errorTest.language}`);
                console.log(`   - Problems extracted: ${complexResult?.problems?.length || 0}`);
            } catch (error) {
                console.log(`⚠️  Complex error (${errorTest.name}) failed:`, error.message);
            }
        }
        
        console.log('\n11. Testing problem matcher performance...');
        try {
            const startTime = Date.now();
            
            // Analyze multiple files with different error types
            const performanceTests = Array.from({ length: 5 }, (_, i) => ({
                content: `Error ${i}: Sample error message for performance testing`,
                language: 'javascript',
                filePath: `./perf-test-${i}.js`
            }));
            
            for (const test of performanceTests) {
                await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', test);
            }
            
            // Get patterns for multiple languages
            const perfLanguages = ['javascript', 'typescript', 'python'];
            for (const lang of perfLanguages) {
                await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_get_patterns', {
                    language: lang
                });
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log('✅ Performance test completed:');
            console.log(`   - Total time: ${duration}ms`);
            console.log(`   - Files analyzed: ${performanceTests.length}`);
            console.log(`   - Languages queried: ${perfLanguages.length}`);
            console.log(`   - Average time per operation: ${(duration / (performanceTests.length + perfLanguages.length)).toFixed(2)}ms`);
            
        } catch (error) {
            console.log('⚠️  Performance test failed:', error.message);
        }
        
        console.log('\n12. Testing error handling with invalid parameters...');
        try {
            const invalidResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_analyze', {
                // Missing required content parameter
                language: 'javascript',
                filePath: './test.js'
            });
            console.log('✅ Invalid parameters result:', invalidResult);
        } catch (error) {
            console.log('✅ Expected error caught for invalid parameters:', error.message);
        }
        
        console.log('\n13. Testing problem_matcher_get_patterns with unsupported language...');
        try {
            const unsupportedResult = await codebolt.tools.executeTool('codebolt-problem', 'problem_matcher_get_patterns', {
                language: 'unsupported-language-12345'
            });
            console.log('✅ Unsupported language result:', unsupportedResult);
            console.log('   - Success:', unsupportedResult?.success);
        } catch (error) {
            console.log('✅ Expected error caught for unsupported language:', error.message);
        }
        
        console.log('\n🎉 All Problem Matcher MCP tools tests completed!');
        
    } catch (error) {
        console.error('❌ Problem Matcher MCP tools test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testProblemMatcherMCPTools().catch(console.error); 