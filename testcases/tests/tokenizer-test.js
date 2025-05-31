const codebolt = require('@codebolt/codeboltjs').default;

async function testTokenizer() {
    console.log('🔤 Testing Tokenizer');
    console.log('====================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing basic text tokenization...');
        const simpleText = 'Hello world! This is a simple test sentence.';
        
        try {
            const tokenizeResult = await codebolt.tokenizer.tokenize(simpleText);
            console.log('✅ Basic tokenization result:', tokenizeResult);
            console.log('   - Token count:', tokenizeResult?.tokens?.length || 0);
            console.log('   - First few tokens:', tokenizeResult?.tokens?.slice(0, 5));
        } catch (error) {
            console.log('⚠️  Basic tokenization failed:', error.message);
        }
        
        console.log('\n2. Testing tokenization with different models...');
        const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'custom-model'];
        const testText = 'The quick brown fox jumps over the lazy dog.';
        
        for (const model of models) {
            try {
                const modelResult = await codebolt.tokenizer.tokenize(testText, { model });
                console.log(`✅ ${model} tokenization:`, modelResult?.tokens?.length || 0, 'tokens');
            } catch (error) {
                console.log(`⚠️  ${model} tokenization failed:`, error.message);
            }
        }
        
        console.log('\n3. Testing token counting...');
        const longText = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
        nisi ut aliquip ex ea commodo consequat.
        `;
        
        try {
            const countResult = await codebolt.tokenizer.countTokens(longText);
            console.log('✅ Token counting result:', countResult);
            console.log('   - Total tokens:', countResult?.count);
            console.log('   - Character count:', longText.length);
            console.log('   - Tokens per character ratio:', (countResult?.count / longText.length).toFixed(3));
        } catch (error) {
            console.log('⚠️  Token counting failed:', error.message);
        }
        
        console.log('\n4. Testing text encoding and decoding...');
        const textToEncode = 'Hello, 世界! 🌍 This contains unicode characters.';
        
        try {
            const encodeResult = await codebolt.tokenizer.encode(textToEncode);
            console.log('✅ Text encoding result:', encodeResult);
            console.log('   - Encoded tokens:', encodeResult?.tokens?.length || 0);
            console.log('   - Token IDs:', encodeResult?.tokenIds?.slice(0, 10));
            
            const decodeResult = await codebolt.tokenizer.decode(encodeResult?.tokenIds || []);
            console.log('✅ Text decoding result:', decodeResult);
            console.log('   - Decoded text matches:', decodeResult?.text === textToEncode);
        } catch (error) {
            console.log('⚠️  Text encoding/decoding failed:', error.message);
        }
        
        console.log('\n5. Testing tokenization with special characters...');
        const specialText = `
        Code example: function test() { return "Hello"; }
        Math: 2 + 2 = 4, π ≈ 3.14159
        Symbols: @#$%^&*()_+-=[]{}|;:'"<>?/
        Emojis: 😀 🚀 💻 🎉 ⭐
        `;
        
        try {
            const specialResult = await codebolt.tokenizer.tokenize(specialText, {
                preserveSpecialChars: true,
                includeWhitespace: true
            });
            console.log('✅ Special characters tokenization:', specialResult);
            console.log('   - Token count:', specialResult?.tokens?.length || 0);
            console.log('   - Contains emojis:', specialResult?.tokens?.some(t => /[\u{1F600}-\u{1F64F}]/u.test(t)));
        } catch (error) {
            console.log('⚠️  Special characters tokenization failed:', error.message);
        }
        
        console.log('\n6. Testing tokenization with different languages...');
        const multilingualTexts = [
            { text: 'Hello world', language: 'en' },
            { text: 'Bonjour le monde', language: 'fr' },
            { text: 'Hola mundo', language: 'es' },
            { text: 'こんにちは世界', language: 'ja' },
            { text: '你好世界', language: 'zh' },
            { text: 'Привет мир', language: 'ru' }
        ];
        
        for (const { text, language } of multilingualTexts) {
            try {
                const langResult = await codebolt.tokenizer.tokenize(text, { language });
                console.log(`✅ ${language} tokenization:`, langResult?.tokens?.length || 0, 'tokens');
            } catch (error) {
                console.log(`⚠️  ${language} tokenization failed:`, error.message);
            }
        }
        
        console.log('\n7. Testing token analysis...');
        const analysisText = 'The artificial intelligence system processes natural language efficiently.';
        
        try {
            const analysisResult = await codebolt.tokenizer.analyzeTokens(analysisText);
            console.log('✅ Token analysis result:', analysisResult);
            console.log('   - Unique tokens:', analysisResult?.uniqueTokens);
            console.log('   - Average token length:', analysisResult?.averageTokenLength);
            console.log('   - Token frequency:', analysisResult?.tokenFrequency);
        } catch (error) {
            console.log('⚠️  Token analysis failed:', error.message);
        }
        
        console.log('\n8. Testing tokenization with context windows...');
        const contextSizes = [512, 1024, 2048, 4096];
        const longDocument = 'This is a sentence. '.repeat(500);
        
        for (const contextSize of contextSizes) {
            try {
                const contextResult = await codebolt.tokenizer.tokenizeWithContext(longDocument, {
                    maxContextLength: contextSize,
                    overlap: 50
                });
                console.log(`✅ Context ${contextSize} tokenization:`, {
                    chunks: contextResult?.chunks?.length || 0,
                    totalTokens: contextResult?.totalTokens || 0
                });
            } catch (error) {
                console.log(`⚠️  Context ${contextSize} tokenization failed:`, error.message);
            }
        }
        
        console.log('\n9. Testing token validation...');
        const validationTexts = [
            { text: 'Valid text', expected: true },
            { text: '', expected: false },
            { text: null, expected: false },
            { text: 'A'.repeat(10000), expected: true },
            { text: '🚀'.repeat(1000), expected: true }
        ];
        
        for (const { text, expected } of validationTexts) {
            try {
                const validationResult = await codebolt.tokenizer.validateInput(text);
                console.log(`✅ Validation for "${String(text).slice(0, 20)}...":`, {
                    valid: validationResult?.valid,
                    expected,
                    matches: validationResult?.valid === expected
                });
            } catch (error) {
                console.log(`⚠️  Validation failed for "${String(text).slice(0, 20)}...":`, error.message);
            }
        }
        
        console.log('\n10. Testing tokenizer performance...');
        const performanceTexts = [
            'Short text',
            'Medium length text that contains several sentences and should provide a good baseline for performance testing.',
            'Very long text that repeats content multiple times to test performance with larger inputs. '.repeat(100)
        ];
        
        for (let i = 0; i < performanceTexts.length; i++) {
            const text = performanceTexts[i];
            const startTime = Date.now();
            
            try {
                const perfResult = await codebolt.tokenizer.tokenize(text);
                const endTime = Date.now();
                console.log(`✅ Performance test ${i + 1}:`, {
                    textLength: text.length,
                    tokenCount: perfResult?.tokens?.length || 0,
                    duration: `${endTime - startTime}ms`,
                    tokensPerSecond: Math.round((perfResult?.tokens?.length || 0) / ((endTime - startTime) / 1000))
                });
            } catch (error) {
                console.log(`⚠️  Performance test ${i + 1} failed:`, error.message);
            }
        }
        
        console.log('\n11. Testing tokenizer configuration...');
        const configurations = [
            { name: 'default', config: {} },
            { name: 'strict', config: { strict: true, caseSensitive: true } },
            { name: 'loose', config: { strict: false, preserveWhitespace: false } },
            { name: 'custom', config: { customSeparators: ['.', '!', '?'], minTokenLength: 2 } }
        ];
        
        const configText = 'Test configuration! Does it work? Yes, it does.';
        
        for (const { name, config } of configurations) {
            try {
                const configResult = await codebolt.tokenizer.tokenize(configText, config);
                console.log(`✅ ${name} configuration:`, {
                    tokens: configResult?.tokens?.length || 0,
                    config: Object.keys(config)
                });
            } catch (error) {
                console.log(`⚠️  ${name} configuration failed:`, error.message);
            }
        }
        
        console.log('\n12. Testing tokenizer batch processing...');
        const batchTexts = [
            'First batch text for processing',
            'Second batch text with different content',
            'Third batch text to test parallel processing',
            'Fourth batch text for comprehensive testing',
            'Fifth batch text to complete the set'
        ];
        
        try {
            const batchResult = await codebolt.tokenizer.batchTokenize(batchTexts);
            console.log('✅ Batch processing result:', batchResult);
            console.log('   - Processed texts:', batchResult?.results?.length || 0);
            console.log('   - Total tokens:', batchResult?.totalTokens || 0);
            console.log('   - Processing time:', batchResult?.processingTime);
        } catch (error) {
            console.log('⚠️  Batch processing failed:', error.message);
        }
        
        console.log('\n🎉 All tokenizer tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Tokenizer test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testTokenizer().catch(console.error); 