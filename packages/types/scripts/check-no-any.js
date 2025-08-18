#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to check for usage of 'any' type in TypeScript files
 * This provides a custom implementation to catch any usage of 'any' types
 */

function checkFileForAny(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, index) => {
    // Check for explicit 'any' usage
    const anyMatches = line.match(/\b(:\s*any|<any>|any\[\]|Record<[^,>]*,\s*any>|Promise<any>|\bany\b(?!\w))/g);
    if (anyMatches) {
      // Skip comments and strings
      const withoutComments = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      const withoutStrings = withoutComments.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '').replace(/`[^`]*`/g, '');
      
      if (withoutStrings.match(/\b(:\s*any|<any>|any\[\]|Record<[^,>]*,\s*any>|Promise<any>|\bany\b(?!\w))/)) {
        errors.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          message: 'Usage of "any" type detected'
        });
      }
    }
  });

  return errors;
}

function findTypeScriptFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip ignored directories
        if (item === 'node_modules' || item === 'dist' || item === '.turbo' || item === 'llmhelper') {
          continue;
        }
        walkDir(fullPath);
      } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

function main() {
  const srcDir = path.join(__dirname, '../src');
  const files = findTypeScriptFiles(srcDir);
  let totalErrors = 0;

  console.log('🔍 Checking for "any" type usage...\n');

  files.forEach(file => {
    const errors = checkFileForAny(file);
    if (errors.length > 0) {
      console.log(`❌ ${path.relative(process.cwd(), file)}:`);
      errors.forEach(error => {
        console.log(`   Line ${error.line}: ${error.message}`);
        console.log(`   ${error.content}`);
        console.log('');
      });
      totalErrors += errors.length;
    }
  });

  if (totalErrors === 0) {
    console.log('✅ No usage of "any" type found!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalErrors} usage(s) of "any" type across ${files.length} files.`);
    console.log('\nPlease replace "any" types with more specific types for better type safety.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFileForAny, findTypeScriptFiles };
