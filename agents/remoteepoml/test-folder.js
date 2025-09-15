const { epomlparse } = require('epoml');
const path = require('path');

async function testFolder() {
    try {
        const prompt = `<Folder path="/Users/utkarshshukla/Codebolt/aci" itemLimit={100} maxDepth={2} />`;
        
        console.log('Starting EPOML parse...');
        const result = await epomlparse(prompt);
        console.log('Parse completed!');
        console.log('Result:');
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

testFolder();
