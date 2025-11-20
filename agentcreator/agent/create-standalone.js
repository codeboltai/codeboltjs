#!/usr/bin/env node

import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createStandaloneAgent() {
  console.log('🔨 Creating standalone agent with embedded dependencies...');

  try {
    // 1. Build the agent normally first
    console.log('📦 Building agent...');
    execSync('pnpm run build', { stdio: 'inherit' });

    // 2. Create a standalone package structure
    console.log('📁 Creating standalone package...');

    const standaloneDir = 'dist/standalone-agent';
    if (!existsSync(standaloneDir)) {
      mkdirSync(standaloneDir, { recursive: true });
    }

    // 3. Copy the built agent files
    execSync('cp -r dist/* ' + standaloneDir + '/', { stdio: 'inherit' });

    // 4. Create a package.json for the standalone version with all dependencies
    const originalPackage = JSON.parse(readFileSync('package.json', 'utf8'));

    // Get all dependencies from workspace packages
    const codeboltPackage = JSON.parse(readFileSync('../../packages/codeboltjs/package.json', 'utf8'));
    const typesPackage = JSON.parse(readFileSync('../../common/types/package.json', 'utf8'));

    const standalonePackage = {
      name: 'agent-standalone',
      version: '1.0.0',
      type: 'module',
      main: 'agent.js',
      scripts: {
        start: 'node agent.js'
      },
      dependencies: {
        // Include actual published versions instead of workspace
        'ws': '^8.18.3',
        'uuid': '^11.1.0',
        'js-yaml': '^4.1.0',
        'yargs': '^17.7.2',
        'execa': '^9.5.2',
        'zod': '^3.25.76'
      },
      engines: {
        'node': '>=20.0.0'
      }
    };

    writeFileSync(
      join(standaloneDir, 'package.json'),
      JSON.stringify(standalonePackage, null, 2)
    );

    // 5. Create a launcher script that handles dependencies
    const launcherContent = `#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if dependencies are installed
function checkDependencies() {
  try {
    require('ws');
    require('uuid');
    return true;
  } catch (e) {
    return false;
  }
}

// Auto-install dependencies if needed
if (!checkDependencies()) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (e) {
    console.error('❌ Failed to install dependencies:', e.message);
    process.exit(1);
  }
}

// Import and run the agent
import('./agent.js').catch(err => {
  console.error('Failed to start agent:', err);
  process.exit(1);
});
`;

    writeFileSync(join(standaloneDir, 'run-agent.js'), launcherContent);

    // 6. Make the launcher executable
    execSync('chmod +x ' + join(standaloneDir, 'run-agent.js'), { stdio: 'inherit' });

    // 7. Create installation instructions
    const instructions = `
# Standalone Agent Bundle

This is a self-contained agent bundle that handles its own dependencies.

## Usage

### Method 1: Auto-install (Recommended)
\`\`\`bash
node run-agent.js
\`\`\`
This will automatically install required dependencies on first run.

### Method 2: Manual install
\`\`\`bash
# Install dependencies
npm install

# Run the agent
node agent.js
\`\`\`

### Method 3: With custom data file
\`\`\`bash
AGENT_FLOW_PATH=your-data.json node run-agent.js
\`\`\`

## Requirements
- Node.js 20.0.0 or higher
- Internet connection for initial dependency installation

## Bundle Contents
- \`${standaloneDir}/agent.js\` - Main agent executable
- \`${standaloneDir}/run-agent.js\` - Auto-installing launcher
- \`${standaloneDir}/nodes/\` - Agent node definitions
- \`${standaloneDir}/package.json\` - Dependencies specification
`;

    writeFileSync(join(standaloneDir, 'README.md'), instructions);

    console.log(`✅ Standalone agent created: ${standaloneDir}/`);
    console.log('');
    console.log('🚀 To run the agent:');
    console.log(`  cd ${standaloneDir}`);
    console.log('  node run-agent.js');
    console.log('');
    console.log('📋 The agent will auto-install its dependencies on first run.');
    console.log('📁 See README.md for more usage instructions.');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

createStandaloneAgent();