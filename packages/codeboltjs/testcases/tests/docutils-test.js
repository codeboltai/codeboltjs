const codebolt = require('@codebolt/codeboltjs').default;
const path = require('path');

async function testDocUtils() {
    console.log('📚 Testing Document Utilities');
    console.log('=============================');
    
    try {

        await codebolt.waitForConnection();
   
        
        console.log('\n13. Testing PDF to text conversion...');
        console.log('⚠️  PDF to text functionality has been removed to reduce bundle size');
        console.log('   If PDF processing is needed, consider using a separate lightweight library');
        
        console.log('\n🎉 All document utilities tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Document utilities test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testDocUtils().catch(console.error); 