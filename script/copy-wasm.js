const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the source and destination directories
const srcDir = './src';
const distDir = './dist';

// Function to find all .wasm files
function findWasmFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((files, dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      return [...files, ...findWasmFiles(fullPath)];
    } else if (dirent.isFile() && dirent.name.endsWith('.wasm')) {
      return [...files, fullPath];
    }
    return files;
  }, []);
}

// Function to copy files while preserving directory structure
function copyFiles(files) {
  for (const file of files) {
    // Calculate the relative path from srcDir
    const relativePath = path.relative(srcDir, file);
    const destPath = path.join(distDir, relativePath);
    
    // Create directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(file, destPath);
    console.log(`Copied: ${file} -> ${destPath}`);
  }
}

console.log('Finding .wasm files...');
const wasmFiles = findWasmFiles(srcDir);
console.log(`Found ${wasmFiles.length} .wasm files`);

console.log('Copying files to dist directory...');
copyFiles(wasmFiles);
console.log('Done copying .wasm files'); 