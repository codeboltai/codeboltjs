const fs = require('fs');

// Read the mapping file
const content = fs.readFileSync('mapping.ts', 'utf8');

// Split into lines for processing
const lines = content.split('\n');
const result = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  result.push(line);
  
  // Check if this line contains websocketReceiveSchema and next line doesn't contain notificationSchemas
  if (line.includes('"websocketReceiveSchema":') && i + 1 < lines.length) {
    const nextLine = lines[i + 1];
    if (!nextLine.includes('"notificationSchemas":')) {
      // Add comma to current line if it doesn't have one
      if (!line.includes(',')) {
        result[result.length - 1] = line + ',';
      }
      // Add notification properties
      result.push('    "notificationSchemas": [],');
      result.push('    "notificationTypes": []');
    }
  }
  
  i++;
}

// Write back to file
fs.writeFileSync('mapping.ts', result.join('\n'));
console.log('Added notification properties to all APIs');
