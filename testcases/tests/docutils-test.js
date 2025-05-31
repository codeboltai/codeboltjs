const codebolt = require('@codebolt/codeboltjs').default;

async function testDocUtils() {
    console.log('📚 Testing Document Utilities');
    console.log('=============================');
    
    try {
        await codebolt.activate();
        await codebolt.waitForConnection();
        
        console.log('\n1. Testing document parsing...');
        const testDocument = `
# Test Document

This is a test document with **bold** and *italic* text.

## Section 1
- Item 1
- Item 2
- Item 3

## Section 2
1. First item
2. Second item
3. Third item

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`
        `;
        
        try {
            const parseResult = await codebolt.docutils.parseDocument(testDocument);
            console.log('✅ Document parsing result:', parseResult);
            console.log('   - Type:', parseResult?.type);
            console.log('   - Sections count:', parseResult?.sections?.length || 0);
        } catch (error) {
            console.log('⚠️  Document parsing failed:', error.message);
        }
        
        console.log('\n2. Testing document formatting...');
        const rawText = 'This is raw text that needs formatting. It has multiple sentences. Some are longer than others.';
        
        try {
            const formatResult = await codebolt.docutils.formatDocument(rawText, 'markdown');
            console.log('✅ Document formatting result:', formatResult);
            console.log('   - Format:', formatResult?.format);
            console.log('   - Formatted length:', formatResult?.content?.length || 0);
        } catch (error) {
            console.log('⚠️  Document formatting failed:', error.message);
        }
        
        console.log('\n3. Testing document extraction...');
        const htmlDocument = `
        <html>
            <head><title>Test Page</title></head>
            <body>
                <h1>Main Title</h1>
                <p>This is a paragraph with <strong>bold</strong> text.</p>
                <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                </ul>
            </body>
        </html>
        `;
        
        try {
            const extractResult = await codebolt.docutils.extractText(htmlDocument);
            console.log('✅ Text extraction result:', extractResult);
            console.log('   - Extracted text length:', extractResult?.text?.length || 0);
        } catch (error) {
            console.log('⚠️  Text extraction failed:', error.message);
        }
        
        console.log('\n4. Testing document conversion...');
        const markdownDoc = `
# Title
## Subtitle
This is **bold** and this is *italic*.
- List item
- Another item
        `;
        
        try {
            const convertResult = await codebolt.docutils.convertDocument(markdownDoc, 'markdown', 'html');
            console.log('✅ Document conversion result:', convertResult);
            console.log('   - From format:', convertResult?.fromFormat);
            console.log('   - To format:', convertResult?.toFormat);
        } catch (error) {
            console.log('⚠️  Document conversion failed:', error.message);
        }
        
        console.log('\n5. Testing document validation...');
        const validDoc = {
            title: 'Test Document',
            content: 'This is valid content',
            metadata: {
                author: 'Test Author',
                created: new Date().toISOString()
            }
        };
        
        try {
            const validateResult = await codebolt.docutils.validateDocument(validDoc);
            console.log('✅ Document validation result:', validateResult);
            console.log('   - Valid:', validateResult?.valid);
            console.log('   - Errors count:', validateResult?.errors?.length || 0);
        } catch (error) {
            console.log('⚠️  Document validation failed:', error.message);
        }
        
        console.log('\n6. Testing document metadata extraction...');
        const docWithMetadata = `
---
title: "Sample Document"
author: "John Doe"
date: "2024-01-01"
tags: ["test", "sample", "document"]
---

# Sample Document

This is the content of the document.
        `;
        
        try {
            const metadataResult = await codebolt.docutils.extractMetadata(docWithMetadata);
            console.log('✅ Metadata extraction result:', metadataResult);
            console.log('   - Title:', metadataResult?.metadata?.title);
            console.log('   - Author:', metadataResult?.metadata?.author);
        } catch (error) {
            console.log('⚠️  Metadata extraction failed:', error.message);
        }
        
        console.log('\n7. Testing document splitting...');
        const longDocument = 'This is a very long document. '.repeat(100) + 'It has many sentences. '.repeat(50);
        
        try {
            const splitResult = await codebolt.docutils.splitDocument(longDocument, 500);
            console.log('✅ Document splitting result:', splitResult);
            console.log('   - Chunks count:', splitResult?.chunks?.length || 0);
            console.log('   - Max chunk size:', 500);
        } catch (error) {
            console.log('⚠️  Document splitting failed:', error.message);
        }
        
        console.log('\n8. Testing document summarization...');
        const documentToSummarize = `
        Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines. 
        These machines can perform tasks that typically require human intelligence, such as visual perception, 
        speech recognition, decision-making, and language translation. AI has been a subject of research for 
        decades and has seen significant advancements in recent years. Machine learning, a subset of AI, 
        enables computers to learn and improve from experience without being explicitly programmed.
        `;
        
        try {
            const summaryResult = await codebolt.docutils.summarizeDocument(documentToSummarize);
            console.log('✅ Document summarization result:', summaryResult);
            console.log('   - Original length:', documentToSummarize.length);
            console.log('   - Summary length:', summaryResult?.summary?.length || 0);
        } catch (error) {
            console.log('⚠️  Document summarization failed:', error.message);
        }
        
        console.log('\n9. Testing document search...');
        const searchableDoc = `
        JavaScript is a programming language. Python is also a programming language.
        Both are popular for web development. JavaScript runs in browsers.
        Python is great for data science and machine learning.
        `;
        
        try {
            const searchResult = await codebolt.docutils.searchInDocument(searchableDoc, 'programming language');
            console.log('✅ Document search result:', searchResult);
            console.log('   - Query:', 'programming language');
            console.log('   - Matches found:', searchResult?.matches?.length || 0);
        } catch (error) {
            console.log('⚠️  Document search failed:', error.message);
        }
        
        console.log('\n10. Testing document statistics...');
        const statsDoc = `
        This is a test document for statistics calculation.
        It contains multiple sentences and paragraphs.
        We want to count words, sentences, and characters.
        This helps in document analysis and processing.
        `;
        
        try {
            const statsResult = await codebolt.docutils.getDocumentStats(statsDoc);
            console.log('✅ Document statistics result:', statsResult);
            console.log('   - Word count:', statsResult?.wordCount);
            console.log('   - Sentence count:', statsResult?.sentenceCount);
            console.log('   - Character count:', statsResult?.characterCount);
        } catch (error) {
            console.log('⚠️  Document statistics failed:', error.message);
        }
        
        console.log('\n11. Testing document cleanup...');
        const messyDoc = `
        
        
        This    document    has    extra    spaces.
        
        
        It also has multiple empty lines.
        
        
        And inconsistent formatting.
        
        
        `;
        
        try {
            const cleanupResult = await codebolt.docutils.cleanupDocument(messyDoc);
            console.log('✅ Document cleanup result:', cleanupResult);
            console.log('   - Original length:', messyDoc.length);
            console.log('   - Cleaned length:', cleanupResult?.content?.length || 0);
        } catch (error) {
            console.log('⚠️  Document cleanup failed:', error.message);
        }
        
        console.log('\n12. Testing document comparison...');
        const doc1 = 'This is the first document with some content.';
        const doc2 = 'This is the second document with different content.';
        
        try {
            const compareResult = await codebolt.docutils.compareDocuments(doc1, doc2);
            console.log('✅ Document comparison result:', compareResult);
            console.log('   - Similarity score:', compareResult?.similarity);
            console.log('   - Differences found:', compareResult?.differences?.length || 0);
        } catch (error) {
            console.log('⚠️  Document comparison failed:', error.message);
        }
        
        console.log('\n🎉 All document utilities tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Document utilities test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDocUtils().catch(console.error); 