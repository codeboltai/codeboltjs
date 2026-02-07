
import codebolt from '@codebolt/codeboltjs';
const tools = codebolt.tools.getAllTools();
console.log("Available tools:", tools.map(t => t.name));
