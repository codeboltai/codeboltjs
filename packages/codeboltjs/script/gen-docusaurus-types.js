#!/usr/bin/env node

/**
 * Generate TypeDoc markdown documentation for Docusaurus integration
 *
 * This script generates markdown documentation from TypeScript source files
 * using typedoc-plugin-markdown, formatted for seamless Docusaurus integration.
 *
 * Usage:
 *   node gen-docusaurus-types.js [options]
 *
 * Options:
 *   --out <dir>     Output directory (default: ../../documentation/publicDocs/docs/5_api/10_type-reference)
 *   --clean         Clean output directory before generating
 *   --watch         Watch for changes and regenerate
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Source entry point
    entryPoint: path.resolve(__dirname, '../src/index.ts'),

    // Default output directory (inside publicDocs for Docusaurus)
    defaultOutDir: path.resolve(__dirname, '../doc-type-ref'),

    // TypeScript config
    tsconfig: path.resolve(__dirname, '../tsconfig.json'),

    // TypeDoc options for Docusaurus-friendly markdown (v4.x)
    typedocOptions: {
        // Plugin configuration
        plugin: ['typedoc-plugin-markdown'],

        // Content options
        excludePrivate: true,
        excludeProtected: false,
        excludeInternal: true,
        excludeNotDocumented: false,
        disableSources: false,

        // Sort members
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

        // v4 markdown plugin options
        hideBreadcrumbs: true,
        hidePageHeader: false,
        entryFileName: 'index',
        useCodeBlocks: true,
        expandObjects: true,
        expandParameters: true,
        // 'members' creates separate files per class/interface/type
        // 'modules' puts everything from one entry point in one file
        outputFileStrategy: 'members',

        // Table formats for better readability
        parametersFormat: 'table',
        propertiesFormat: 'table',
        enumMembersFormat: 'table',
        typeDeclarationFormat: 'table',
    }
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        outDir: CONFIG.defaultOutDir,
        clean: false,
        watch: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--out':
                options.outDir = path.resolve(args[++i]);
                break;
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
Generate TypeDoc markdown documentation for Docusaurus

Usage:
  node gen-docusaurus-types.js [options]

Options:
  --out <dir>     Output directory
                  (default: documentation/publicDocs/docs/5_api/10_type-reference)
  --clean         Clean output directory before generating
  --watch         Watch for changes and regenerate
  --help          Show this help message

Examples:
  node gen-docusaurus-types.js
  node gen-docusaurus-types.js --clean
  node gen-docusaurus-types.js --out ../custom-docs --clean
`);
}

// Clean output directory
function cleanOutputDir(outDir) {
    if (fs.existsSync(outDir)) {
        console.log(`🧹 Cleaning output directory: ${outDir}`);
        fs.rmSync(outDir, { recursive: true, force: true });
    }
}

// Create Docusaurus category file for proper sidebar organization
function createCategoryFile(outDir) {
    const categoryContent = {
        label: 'Type Reference',
        position: 10,
        link: {
            type: 'generated-index',
            title: 'Type Reference',
            description: 'Auto-generated TypeScript type definitions and API reference from source code.',
            slug: '/api/type-reference',
        },
    };

    const categoryPath = path.join(outDir, '_category_.json');
    fs.writeFileSync(categoryPath, JSON.stringify(categoryContent, null, 2));
    console.log(`📁 Created category file: ${categoryPath}`);
}

// Post-process generated markdown files for better Docusaurus compatibility
function postProcessMarkdown(outDir) {
    console.log('📝 Post-processing markdown files...');

    const processFile = (filePath) => {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Fix any MDX compatibility issues
        // Replace HTML comments that might cause issues
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

        // Fix internal links to use Docusaurus format
        // Convert .md extensions to no extension for Docusaurus
        content = content.replace(/\]\(([^)]+)\.md\)/g, ']($1)');

        fs.writeFileSync(filePath, content);
    };

    const walkDir = (dir) => {
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

    if (fs.existsSync(outDir)) {
        walkDir(outDir);
    }
}

// Build TypeDoc command
function buildTypedocCommand(outDir, watch = false) {
    const opts = CONFIG.typedocOptions;

    const args = [
        'npx', 'typedoc',
        '--entryPoints', CONFIG.entryPoint,
        '--tsconfig', CONFIG.tsconfig,
        '--out', outDir,
    ];

    // Add plugins
    if (opts.plugin) {
        opts.plugin.forEach(p => {
            args.push('--plugin', p);
        });
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

    // Add sort
    if (opts.sort) {
        opts.sort.forEach(s => args.push('--sort', s));
    }

    // Add kind sort order
    if (opts.kindSortOrder) {
        opts.kindSortOrder.forEach(k => args.push('--kindSortOrder', k));
    }

    // Watch mode
    if (watch) {
        args.push('--watch');
    }

    return args.join(' ');
}

// Main execution
async function main() {
    const options = parseArgs();

    console.log('🚀 Generating TypeDoc markdown for Docusaurus...');
    console.log(`   Entry: ${CONFIG.entryPoint}`);
    console.log(`   Output: ${options.outDir}`);

    // Clean if requested
    if (options.clean) {
        cleanOutputDir(options.outDir);
    }

    // Ensure output directory exists
    fs.mkdirSync(options.outDir, { recursive: true });

    // Build and run TypeDoc command
    const cmd = buildTypedocCommand(options.outDir, options.watch);
    console.log(`\n📦 Running: ${cmd}\n`);

    try {
        if (options.watch) {
            // For watch mode, spawn a child process
            const child = spawn('npx', cmd.split(' ').slice(1), {
                stdio: 'inherit',
                shell: true,
                cwd: path.resolve(__dirname, '..'),
            });

            child.on('error', (err) => {
                console.error('❌ Error:', err.message);
                process.exit(1);
            });
        } else {
            // Run synchronously for one-time generation
            execSync(cmd, {
                stdio: 'inherit',
                cwd: path.resolve(__dirname, '..'),
            });

            // Create category file for Docusaurus sidebar
            createCategoryFile(options.outDir);

            // Post-process markdown files
            postProcessMarkdown(options.outDir);

            console.log('\n✅ Documentation generated successfully!');
            console.log(`   Output: ${options.outDir}`);
            console.log('\n💡 To integrate with Docusaurus:');
            console.log('   1. The docs are already in the publicDocs/docs/5_api/ folder');
            console.log('   2. They will be auto-included in the jsapiSidebar');
            console.log('   3. Run "npm run build" in publicDocs to build the site');
        }
    } catch (error) {
        console.error('❌ Error generating documentation:', error.message);
        process.exit(1);
    }
}

main();
