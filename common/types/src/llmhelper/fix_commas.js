const fs = require('fs');

// Read the mapping file
const content = fs.readFileSync('mapping.ts', 'utf8');

// Split into lines for processing
const lines = content.split('\n');
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
  
  // If this line contains "notificationTypes": [] and next line starts with }, add comma
  if (line.includes('"notificationTypes": []') && nextLine.trim().startsWith('}')) {
    result.push('    "notificationTypes": []');
  } else if (line.includes('"notificationSchemas": []') && nextLine.includes('"notificationTypes":')) {
    result.push('    "notificationSchemas": [],');
  } else {
    result.push(line);
  }
}

// Write back to file
fs.writeFileSync('mapping.ts', result.join('\n'));
console.log('Fixed comma issues');
