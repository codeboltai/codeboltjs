const fs = require('fs');

// Read the mapping file
let content = fs.readFileSync('mapping.ts', 'utf8');

// Fix missing commas after websocketReceiveSchema when followed by notificationSchemas
content = content.replace(
  /(websocketReceiveSchema":\s*[^,\n]+)(\n\s*"notificationSchemas")/g,
  '$1,$2'
);

// Write back to file
fs.writeFileSync('mapping.ts', content);
console.log('Fixed all comma issues');
