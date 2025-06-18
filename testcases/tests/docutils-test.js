const codebolt = require('@codebolt/codeboltjs').default;
const path = require('path');

async function testDocUtils() {
    console.log('📚 Testing Document Utilities');
    console.log('=============================');
    
    try {

        await codebolt.waitForConnection();
   
        
        console.log('\n13. Testing PDF to text conversion...');
        const pdfPath = path.join(__dirname, 'dummy.pdf');
        
        try {
            const pdfText = await codebolt.docutils.pdf_to_text(pdfPath);
            console.log('✅ PDF to text conversion result:');
            console.log('   - Converted text length:', pdfText?.length || 0);
            console.log('   - First 100 characters:', pdfText?.substring(0, 100) + '...');
        } catch (error) {
            console.log('⚠️  PDF to text conversion failed:', error.message);
        }
        
        console.log('\n🎉 All document utilities tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Document utilities test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDocUtils().catch(console.error); 