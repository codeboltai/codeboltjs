const fs = require('fs');
const path = require('path');

// Copy WASM files from src to dist
const sourceDir = path.join(__dirname, '..', 'src', 'parse-source-code');
const targetDir = path.join(__dirname, '..', 'dist', 'parse-source-code');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Get all .wasm files
const wasmFiles = fs.readdirSync(sourceDir).filter(file => file.endsWith('.wasm'));

console.log(`Copying ${wasmFiles.length} WASM files...`);

wasmFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${file}`);
  } catch (error) {
    console.error(`Failed to copy ${file}:`, error.message);
  }
});

console.log('WASM files copied successfully!');
