const fs = require('fs');
const path = require('path');
const { transpileDirectory } = require('./transpile-typescript');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
transpileDirectory(srcDir, distDir);
fs.copyFileSync(path.join(rootDir, 'codeboltagent.yaml'), path.join(distDir, 'codeboltagent.yaml'));

console.log('[platformMofier] built agent dist/index.js');
