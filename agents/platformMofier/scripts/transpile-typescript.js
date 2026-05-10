const fs = require('fs');
const path = require('path');

function loadTypescript() {
  return require('typescript');
}

const ts = loadTypescript();

const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  sourceMap: false,
};

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function transpileFile(sourceFile, targetFile) {
  const sourceText = fs.readFileSync(sourceFile, 'utf8');
  const output = ts.transpileModule(sourceText, {
    compilerOptions,
    fileName: sourceFile,
  });

  ensureDirectory(path.dirname(targetFile));
  fs.writeFileSync(targetFile, output.outputText);
}

function buildTargetPath(sourceDir, targetDir, sourceFile) {
  const relativePath = path.relative(sourceDir, sourceFile);
  const parsedPath = path.parse(relativePath);
  return path.join(targetDir, parsedPath.dir, `${parsedPath.name}.js`);
}

function transpileDirectory(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      transpileDirectory(sourcePath, path.join(targetDir, entry.name));
      continue;
    }

    if (entry.name.endsWith('.d.ts')) {
      continue;
    }

    if (entry.name.endsWith('.ts')) {
      transpileFile(sourcePath, buildTargetPath(sourceDir, targetDir, sourcePath));
      continue;
    }

    const targetPath = path.join(targetDir, entry.name);
    ensureDirectory(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
  }
}

module.exports = {
  transpileDirectory,
  transpileFile,
};
