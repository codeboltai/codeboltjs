#!/usr/bin/env node

/**
 * Unified TypeDoc Markdown Generator for Docusaurus
 *
 * This script generates markdown documentation from TypeScript source files
 * for multiple packages (@codebolt/codeboltjs and @codebolt/agent) using
 * typedoc-plugin-markdown, formatted for seamless Docusaurus integration.
 *
 * Usage:
 *   node scripts/generate-type-docs.js [options]
 *
 * Options:
 *   --clean         Clean output directory before generating
 *   --watch         Watch for changes and regenerate (not recommended for multi-package)
 *   --help          Show help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths relative to this script's location (documentation/publicDocs/scripts/)
const SCRIPT_DIR = __dirname;
const PUBLIC_DOCS_DIR = path.resolve(SCRIPT_DIR, '..');
const MONOREPO_ROOT = path.resolve(PUBLIC_DOCS_DIR, '../..');

// Configuration
const CONFIG = {
    // Output directory for combined documentation
    outDir: path.resolve(PUBLIC_DOCS_DIR, 'docs/5_api/11_doc-type-ref'),

    // Package configurations
    packages: [
        {
            name: '@codebolt/codeboltjs',
            entryPoints: [
                path.resolve(MONOREPO_ROOT, 'packages/codeboltjs/src/index.ts'),
            ],
            tsconfig: path.resolve(MONOREPO_ROOT, 'packages/codeboltjs/tsconfig.json'),
            cwd: path.resolve(MONOREPO_ROOT, 'packages/codeboltjs'),
        },
        {
            name: '@codebolt/agent',
            entryPoints: [
                path.resolve(MONOREPO_ROOT, 'packages/agent/src/unified/index.ts'),
                path.resolve(MONOREPO_ROOT, 'packages/agent/src/processor-pieces/index.ts'),
            ],
            tsconfig: path.resolve(MONOREPO_ROOT, 'packages/agent/tsconfig.json'),
            cwd: path.resolve(MONOREPO_ROOT, 'packages/agent'),
        },
        {
            name: '@codebolt/provider',
            entryPoints: [
                path.resolve(MONOREPO_ROOT, 'packages/provider/src/index.ts'),
            ],
            tsconfig: path.resolve(MONOREPO_ROOT, 'packages/provider/tsconfig.json'),
            cwd: path.resolve(MONOREPO_ROOT, 'packages/provider'),
        },
        {
            name: '@codebolt/mcp',
            entryPoints: [
                path.resolve(MONOREPO_ROOT, 'packages/mcp/src/index.ts'),
            ],
            tsconfig: path.resolve(MONOREPO_ROOT, 'packages/mcp/tsconfig.json'),
            cwd: path.resolve(MONOREPO_ROOT, 'packages/mcp'),
        },
    ],

    // TypeDoc options for Docusaurus-friendly markdown
    typedocOptions: {
        plugin: ['typedoc-plugin-markdown'],
        excludePrivate: true,
        excludeProtected: false,
        excludeInternal: true,
        excludeNotDocumented: false,
        disableSources: false,
        sort: ['alphabetical'],
        kindSortOrder: [
            'Module',
            'Namespace',
            'Class',
            'Interface',
            'TypeAlias',
            'Enum',
            'Variable',
            'Function',
            'Constructor',
            'Property',
            'Method',
            'Accessor',
        ],
        hideBreadcrumbs: true,
        hidePageHeader: false,
        entryFileName: 'index',
        useCodeBlocks: true,
        expandObjects: true,
        expandParameters: true,
        outputFileStrategy: 'members',
        parametersFormat: 'table',
        propertiesFormat: 'table',
        enumMembersFormat: 'table',
        typeDeclarationFormat: 'table',
    },
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        clean: false,
        watch: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--clean':
                options.clean = true;
                break;
            case '--watch':
                options.watch = true;
                break;
            case '--help':
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp() {
    console.log(`
Unified TypeDoc Markdown Generator for Docusaurus

Generates API documentation from @codebolt/codeboltjs and @codebolt/agent packages.

Usage:
  node scripts/generate-type-docs.js [options]

Options:
  --clean         Clean output directory before generating
  --watch         Watch for changes (runs on first package only)
  --help          Show this help message

Examples:
  node scripts/generate-type-docs.js
  node scripts/generate-type-docs.js --clean

Output:
  docs/5_api/11_doc-type-ref/
`);
}

// Clean output directory
function cleanOutputDir(outDir) {
    if (fs.existsSync(outDir)) {
        console.log(`Cleaning output directory: ${outDir}`);
        fs.rmSync(outDir, { recursive: true, force: true });
    }
}

// Create Docusaurus category file
function createCategoryFile(outDir) {
    const categoryContent = {
        label: 'Type Reference',
        position: 11,
        link: {
            type: 'generated-index',
            title: 'Type Reference',
            description: 'Auto-generated TypeScript type definitions and API reference for @codebolt/codeboltjs, @codebolt/agent, @codebolt/provider, and @codebolt/mcp packages.',
            slug: '/api/type-reference',
        },
    };

    const categoryPath = path.join(outDir, '_category_.json');
    fs.writeFileSync(categoryPath, JSON.stringify(categoryContent, null, 2));
    console.log(`Created category file: ${categoryPath}`);
}

// Post-process generated markdown files for Docusaurus compatibility
function postProcessMarkdown(outDir) {
    console.log('Post-processing markdown files...');

    const processFile = (filePath) => {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Remove HTML comments that might cause MDX issues
        content = content.replace(/<!--[\s\S]*?-->/g, '');

        // Ensure proper frontmatter exists
        if (!content.startsWith('---')) {
            const fileName = path.basename(filePath, '.md');
            const frontmatter = `---
title: ${fileName}
---

`;
            content = frontmatter + content;
        }

        // Fix internal links - convert .md extensions to no extension for Docusaurus
        content = content.replace(/\]\(([^)]+)\.md\)/g, ']($1)');

        fs.writeFileSync(filePath, content);
    };

    const walkDir = (dir) => {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.md')) {
                processFile(filePath);
            }
        }
    };

    walkDir(outDir);
}

// Build TypeDoc command for a package
function buildTypedocCommand(pkg, outDir) {
    const opts = CONFIG.typedocOptions;
    const args = ['npx', 'typedoc'];

    // Add entry points
    pkg.entryPoints.forEach(entry => {
        args.push('--entryPoints', entry);
    });

    args.push('--tsconfig', pkg.tsconfig);
    args.push('--out', outDir);

    // Add plugins
    if (opts.plugin) {
        opts.plugin.forEach(p => args.push('--plugin', p));
    }

    // Boolean options
    const booleanOptions = [
        'excludePrivate',
        'excludeProtected',
        'excludeInternal',
        'excludeNotDocumented',
        'disableSources',
        'hideBreadcrumbs',
        'hidePageHeader',
        'useCodeBlocks',
        'expandObjects',
        'expandParameters',
    ];

    booleanOptions.forEach(opt => {
        if (opts[opt] === true) {
            args.push(`--${opt}`);
        }
    });

    // String options
    const stringOptions = [
        'entryFileName',
        'outputFileStrategy',
        'parametersFormat',
        'propertiesFormat',
        'enumMembersFormat',
        'typeDeclarationFormat',
    ];

    stringOptions.forEach(opt => {
        if (opts[opt]) {
            args.push(`--${opt}`, opts[opt]);
        }
    });

    // Sort options
    if (opts.sort) {
        opts.sort.forEach(s => args.push('--sort', s));
    }

    if (opts.kindSortOrder) {
        opts.kindSortOrder.forEach(k => args.push('--kindSortOrder', k));
    }

    return args.join(' ');
}

// Generate docs for a single package
function generatePackageDocs(pkg, outDir) {
    console.log(`\nGenerating docs for ${pkg.name}...`);
    console.log(`  Entry points:`);
    pkg.entryPoints.forEach(entry => console.log(`    - ${path.relative(MONOREPO_ROOT, entry)}`));

    const cmd = buildTypedocCommand(pkg, outDir);

    try {
        execSync(cmd, {
            stdio: 'inherit',
            cwd: pkg.cwd,
        });
        console.log(`  Done: ${pkg.name}`);
        return true;
    } catch (error) {
        console.error(`  Error generating docs for ${pkg.name}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    const options = parseArgs();
    const startTime = Date.now();

    console.log('='.repeat(60));
    console.log('Unified TypeDoc Generator for Docusaurus');
    console.log('='.repeat(60));
    console.log(`\nOutput: ${CONFIG.outDir}`);
    console.log(`Packages: ${CONFIG.packages.map(p => p.name).join(', ')}`);

    // Clean if requested
    if (options.clean) {
        cleanOutputDir(CONFIG.outDir);
    }

    // Ensure output directory exists
    fs.mkdirSync(CONFIG.outDir, { recursive: true });

    // Generate docs for all packages into the same output directory
    // TypeDoc will merge the outputs when using the same output directory
    let success = true;

    for (const pkg of CONFIG.packages) {
        const result = generatePackageDocs(pkg, CONFIG.outDir);
        if (!result) {
            success = false;
        }
    }

    if (success) {
        // Create category file for Docusaurus sidebar
        createCategoryFile(CONFIG.outDir);

        // Post-process markdown files
        postProcessMarkdown(CONFIG.outDir);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n' + '='.repeat(60));
        console.log(`Documentation generated successfully in ${elapsed}s`);
        console.log(`Output: ${CONFIG.outDir}`);
        console.log('='.repeat(60));
    } else {
        console.error('\nDocumentation generation completed with errors.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
