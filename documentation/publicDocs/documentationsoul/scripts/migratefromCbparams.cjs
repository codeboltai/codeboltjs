#!/usr/bin/env node
/**
 * Migration Script: Convert CBBaseInfo/CBParameters to Static Content
 *
 * This script migrates markdown files in ApiAccess folder from using
 * <CBBaseInfo/> and <CBParameters/> components to static rendered content.
 *
 * Changes:
 * - Keeps frontmatter as is
 * - Replaces <CBBaseInfo/> with function signature and description
 * - Replaces <CBParameters/> with parameters in bullet-point format (like Response Structure)
 *
 * Usage: node migratefromCbparams.js [options]
 *
 * Options:
 *   --dry-run          Show what would be changed without modifying files
 *   --file=PATH        Process only a specific file
 *   --module=NAME      Process only files in a specific module folder
 *   --backup           Create .bak backup files before modifying
 *   --verbose          Show detailed output for each file
 *
 * Examples:
 *   node migratefromCbparams.js --dry-run
 *   node migratefromCbparams.js --module=browser --dry-run
 *   node migratefromCbparams.js --backup
 *   node migratefromCbparams.js --file=agent/startAgent.md
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  apiAccessPath: path.resolve(__dirname, '../../docs/5_api/ApiAccess'),
  typeRefBasePath: '/docs/api/11_doc-type-ref/codeboltjs'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    file: null,
    module: null,
    backup: false,
    verbose: false
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--module=')) {
      options.module = arg.split('=')[1];
    } else if (arg === '--backup') {
      options.backup = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  return options;
}

/**
 * Find all markdown files in ApiAccess folder
 */
function findMarkdownFiles(basePath, moduleFilter = null) {
  const files = [];

  function scanDir(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // If module filter is set, only scan that module
        if (moduleFilter && relativePath === '' && entry.name !== moduleFilter) {
          continue;
        }
        scanDir(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push({
          fullPath,
          relativePath: relPath,
          module: relativePath || 'root',
          fileName: entry.name
        });
      }
    }
  }

  scanDir(basePath);
  return files;
}

/**
 * Parse markdown file and extract frontmatter
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    return { frontmatter: null, body: content, raw: content };
  }

  // Find end of frontmatter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontmatter: null, body: content, raw: content };
  }

  const frontmatterStr = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  try {
    const frontmatter = yaml.load(frontmatterStr);
    return { frontmatter, body, raw: content, frontmatterStr };
  } catch (e) {
    console.warn(`  Warning: Could not parse frontmatter in ${filePath}: ${e.message}`);
    return { frontmatter: null, body: content, raw: content };
  }
}

/**
 * Generate function signature from frontmatter
 */
function generateFunctionSignature(frontmatter) {
  if (!frontmatter.data || !frontmatter.cbparameters) {
    return null;
  }

  const { data, cbparameters } = frontmatter;
  const category = data.category || 'unknown';
  const funcName = data.name || 'unknown';

  // Build parameters string
  const params = (cbparameters.parameters || [])
    .map(p => `${p.name}: ${p.typeName}`)
    .join(', ');

  // Build return type
  let returnType = cbparameters.returns?.signatureTypeName || 'void';
  if (cbparameters.returns?.typeArgs && cbparameters.returns.typeArgs.length > 0) {
    const typeArg = cbparameters.returns.typeArgs[0];
    if (typeArg.name) {
      returnType = `${returnType}<${typeArg.name}>`;
    }
  }

  return `codebolt.${category}.${funcName}(${params}): ${returnType}`;
}

/**
 * Generate CBBaseInfo content (name heading + signature + description)
 */
function generateBaseInfoContent(frontmatter) {
  const signature = generateFunctionSignature(frontmatter);
  const description = frontmatter.cbbaseinfo?.description || '';
  const name = frontmatter.name || '';

  let content = '';

  // Add name as heading
  if (name) {
    content += `# ${name}\n\n`;
  }

  if (signature) {
    content += '```typescript\n';
    content += signature + '\n';
    content += '```\n\n';
  }

  if (description) {
    content += description + '\n';
  }

  return content.trim();
}

/**
 * Generate CBParameters content in bullet-point format
 */
function generateParametersContent(frontmatter) {
  if (!frontmatter.cbparameters) {
    return '';
  }

  const { cbparameters } = frontmatter;
  let content = '';

  // Parameters section
  const params = cbparameters.parameters || [];
  if (params.length > 0) {
    content += '### Parameters\n\n';

    for (const param of params) {
      const typeName = param.typeName || 'unknown';
      const description = param.description || '';
      const isOptional = param.isOptional ? ', optional' : '';

      content += `- **\`${param.name}\`** (${typeName}${isOptional}): ${description}\n`;
    }
    content += '\n';
  }

  // Returns section
  const returns = cbparameters.returns;
  if (returns && returns.signatureTypeName) {
    content += '### Returns\n\n';

    let returnType = returns.signatureTypeName;
    if (returns.typeArgs && returns.typeArgs.length > 0 && returns.typeArgs[0].name) {
      returnType = `${returnType}<${returns.typeArgs[0].name}>`;
    }

    const description = returns.description || '';
    content += `- **\`${returnType}\`**: ${description}\n`;
  }

  return content.trim();
}

/**
 * Check if file needs migration
 */
function needsMigration(body) {
  return body.includes('<CBBaseInfo') || body.includes('<CBParameters');
}

/**
 * Migrate file content
 */
function migrateContent(frontmatter, body) {
  if (!frontmatter) {
    return body;
  }

  let newBody = body;

  // Generate replacement content
  const baseInfoContent = generateBaseInfoContent(frontmatter);
  const parametersContent = generateParametersContent(frontmatter);

  // Replace <CBBaseInfo/> or <CBBaseInfo /> with actual content
  newBody = newBody.replace(/<CBBaseInfo\s*\/>/gi, baseInfoContent);

  // Replace <CBParameters/> or <CBParameters /> with actual content
  newBody = newBody.replace(/<CBParameters\s*\/>/gi, parametersContent);

  return newBody;
}

/**
 * Rebuild full file content
 */
function rebuildFileContent(frontmatterStr, newBody) {
  return `---\n${frontmatterStr}\n---\n${newBody}`;
}

/**
 * Process a single file
 */
function processFile(fileInfo, options) {
  const { fullPath, relativePath } = fileInfo;

  if (options.verbose) {
    console.log(`\nProcessing: ${relativePath}`);
  }

  // Parse file
  const { frontmatter, body, frontmatterStr } = parseMarkdownFile(fullPath);

  // Check if migration is needed
  if (!needsMigration(body)) {
    if (options.verbose) {
      console.log(`  Skipped: No CBBaseInfo/CBParameters found`);
    }
    return { status: 'skipped', reason: 'no-components' };
  }

  if (!frontmatter) {
    if (options.verbose) {
      console.log(`  Skipped: No valid frontmatter`);
    }
    return { status: 'skipped', reason: 'no-frontmatter' };
  }

  // Migrate content
  const newBody = migrateContent(frontmatter, body);

  // Check if content actually changed
  if (newBody === body) {
    if (options.verbose) {
      console.log(`  Skipped: No changes needed`);
    }
    return { status: 'skipped', reason: 'no-changes' };
  }

  // Rebuild file
  const newContent = rebuildFileContent(frontmatterStr, newBody);

  if (options.dryRun) {
    console.log(`  [DRY RUN] Would migrate: ${relativePath}`);
    if (options.verbose) {
      console.log('  --- New content preview (first 500 chars) ---');
      console.log(newContent.substring(0, 500));
      console.log('  --- End preview ---');
    }
    return { status: 'would-migrate', newContent };
  }

  // Create backup if requested
  if (options.backup) {
    const backupPath = fullPath + '.bak';
    fs.copyFileSync(fullPath, backupPath);
    if (options.verbose) {
      console.log(`  Backup created: ${backupPath}`);
    }
  }

  // Write new content
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`  Migrated: ${relativePath}`);

  return { status: 'migrated', newContent };
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();

  console.log('=== CBParams Migration Script ===\n');
  console.log('Options:', {
    dryRun: options.dryRun,
    module: options.module || 'all',
    file: options.file || 'all',
    backup: options.backup,
    verbose: options.verbose
  });

  // Handle single file processing
  if (options.file) {
    const fullPath = path.join(CONFIG.apiAccessPath, options.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found: ${fullPath}`);
      process.exit(1);
    }

    const fileInfo = {
      fullPath,
      relativePath: options.file,
      module: path.dirname(options.file) || 'root',
      fileName: path.basename(options.file)
    };

    console.log(`\nProcessing single file: ${options.file}`);
    const result = processFile(fileInfo, options);
    console.log(`\nResult: ${result.status}`);
    return;
  }

  // Find all markdown files
  console.log(`\nScanning: ${CONFIG.apiAccessPath}`);
  const files = findMarkdownFiles(CONFIG.apiAccessPath, options.module);
  console.log(`Found ${files.length} markdown files`);

  // Process files
  const stats = {
    total: files.length,
    migrated: 0,
    skipped: 0,
    wouldMigrate: 0,
    errors: 0
  };

  console.log('\n=== Processing Files ===');

  for (const fileInfo of files) {
    try {
      const result = processFile(fileInfo, options);

      switch (result.status) {
        case 'migrated':
          stats.migrated++;
          break;
        case 'would-migrate':
          stats.wouldMigrate++;
          break;
        case 'skipped':
          stats.skipped++;
          break;
      }
    } catch (error) {
      console.error(`  Error processing ${fileInfo.relativePath}: ${error.message}`);
      stats.errors++;
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total files: ${stats.total}`);
  if (options.dryRun) {
    console.log(`Would migrate: ${stats.wouldMigrate}`);
  } else {
    console.log(`Migrated: ${stats.migrated}`);
  }
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  if (options.dryRun) {
    console.log('\n[DRY RUN] No files were modified. Remove --dry-run to apply changes.');
  }
}

// Export for testing
module.exports = {
  parseMarkdownFile,
  generateFunctionSignature,
  generateBaseInfoContent,
  generateParametersContent,
  migrateContent,
  needsMigration
};

// Run if executed directly
if (require.main === module) {
  main();
}
