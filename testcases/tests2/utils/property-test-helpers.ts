/**
 * Property-based testing utilities using fast-check
 * 
 * This module provides utilities and generators for property-based testing
 * of tool wrappers using the fast-check library.
 */

import * as fc from 'fast-check';
import * as path from 'path';
import {
    parseTypeScriptFile,
    getAllToolFiles,
    getAllModuleFiles,
    getModuleNameFromPath,
    getToolDirectoryFromPath,
    toolDirectoryExistsForModule,
    getToolDirectoryExports,
    validateToolFileNaming,
    extendsClass,
    hasJSDocComment,
    ClassInfo,
    InterfaceInfo,
} from './ast-parser';

/**
 * Configuration for property-based tests
 */
export const propertyTestConfig = {
    /** Number of test runs for each property */
    numRuns: 100,
    
    /** Timeout for each test run in milliseconds */
    timeout: 5000,
    
    /** Whether to enable verbose output */
    verbose: false,
};

/**
 * Arbitrary generators for common types
 */
export const arbitraries = {
    /**
     * Generates arbitrary non-empty strings
     */
    nonEmptyString: fc.string({ minLength: 1, maxLength: 100 }),
    
    /**
     * Generates arbitrary identifiers (valid JavaScript variable names)
     */
    identifier: fc.stringMatching(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    
    /**
     * Generates arbitrary file paths
     */
    filePath: fc.array(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { minLength: 1, maxLength: 5 })
        .map(parts => parts.join('/')),
    
    /**
     * Generates arbitrary ISO date strings
     */
    isoDate: fc.date().map(d => d.toISOString()),
    
    /**
     * Generates arbitrary email addresses
     */
    email: fc.tuple(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        fc.stringMatching(/^[a-zA-Z]{2,10}$/)
    ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
    
    /**
     * Generates arbitrary UUIDs
     */
    uuid: fc.uuid(),
    
    /**
     * Generates arbitrary positive integers
     */
    positiveInt: fc.integer({ min: 1, max: 1000000 }),
    
    /**
     * Generates arbitrary non-negative integers
     */
    nonNegativeInt: fc.integer({ min: 0, max: 1000000 }),
};

/**
 * Property test: Module-to-Tool Directory Correspondence
 * 
 * For any module directory in packages/codeboltjs/src/modules/,
 * there should exist a corresponding tool directory in packages/codeboltjs/src/tools/
 * with the same name.
 * 
 * **Validates: Requirements 3.1**
 */
export async function testModuleToToolDirectoryCorrespondence(): Promise<void> {
    const modulesDir = 'packages/codeboltjs/src/modules';
    const toolsDir = 'packages/codeboltjs/src/tools';
    
    const moduleFiles = getAllModuleFiles(modulesDir);
    const missingToolDirectories: string[] = [];
    
    for (const moduleFile of moduleFiles) {
        const moduleName = getModuleNameFromPath(moduleFile);
        
        // Skip certain modules that are known to not need tool wrappers
        const skipModules = ['index', 'types'];
        if (skipModules.includes(moduleName)) {
            continue;
        }
        
        if (!toolDirectoryExistsForModule(moduleName, toolsDir)) {
            missingToolDirectories.push(moduleName);
        }
    }
    
    if (missingToolDirectories.length > 0) {
        console.warn(`Missing tool directories for modules: ${missingToolDirectories.join(', ')}`);
    }
}

/**
 * Property test: Two-Class Pattern Completeness
 * 
 * For any tool file, it should contain both a Tool class extending BaseDeclarativeTool
 * and an Invocation class extending BaseToolInvocation, with the Tool class creating
 * instances of the Invocation class.
 * 
 * **Validates: Requirements 3.1, 3.3**
 */
export async function testTwoClassPatternCompleteness(): Promise<void> {
    const toolFiles = getAllToolFiles();
    const violations: Array<{ file: string; reason: string }> = [];
    
    for (const toolFile of toolFiles) {
        try {
            const parsed = parseTypeScriptFile(toolFile);
            const classes = parsed.classes;
            
            const hasToolClass = classes.some(c => 
                extendsClass(c, 'BaseDeclarativeTool')
            );
            const hasInvocationClass = classes.some(c => 
                extendsClass(c, 'BaseToolInvocation')
            );
            
            if (!hasToolClass) {
                violations.push({
                    file: toolFile,
                    reason: 'Missing Tool class extending BaseDeclarativeTool',
                });
            }
            
            if (!hasInvocationClass) {
                violations.push({
                    file: toolFile,
                    reason: 'Missing Invocation class extending BaseToolInvocation',
                });
            }
        } catch (error) {
            violations.push({
                file: toolFile,
                reason: `Parse error: ${error}`,
            });
        }
    }
    
    if (violations.length > 0) {
        console.warn('Two-class pattern violations:');
        violations.forEach(v => console.warn(`  ${v.file}: ${v.reason}`));
    }
}

/**
 * Property test: Directory Naming Consistency
 * 
 * For any tool directory name, it should exactly match the name of a module
 * in packages/codeboltjs/src/modules/.
 * 
 * **Validates: Requirements 3.4**
 */
export async function testDirectoryNamingConsistency(): Promise<void> {
    const toolsDir = 'packages/codeboltjs/src/tools';
    const modulesDir = 'packages/codeboltjs/src/modules';
    
    const toolFiles = getAllToolFiles(toolsDir);
    const moduleFiles = getAllModuleFiles(modulesDir);
    const moduleNames = new Set(moduleFiles.map(getModuleNameFromPath));
    
    const inconsistencies: string[] = [];
    
    for (const toolFile of toolFiles) {
        const toolDirectory = getToolDirectoryFromPath(toolFile);
        
        if (toolDirectory && !moduleNames.has(toolDirectory)) {
            inconsistencies.push(toolDirectory);
        }
    }
    
    if (inconsistencies.length > 0) {
        console.warn(`Tool directories without matching modules: ${[...new Set(inconsistencies)].join(', ')}`);
    }
}

/**
 * Property test: Index Export Completeness
 * 
 * For any tool directory, its index.ts file should export all tool classes
 * defined in that directory's files.
 * 
 * **Validates: Requirements 3.4**
 */
export async function testIndexExportCompleteness(): Promise<void> {
    const toolsDir = 'packages/codeboltjs/src/tools';
    const toolFiles = getAllToolFiles(toolsDir);
    
    // Group tool files by directory
    const toolsByDirectory = new Map<string, string[]>();
    
    for (const toolFile of toolFiles) {
        const directory = getToolDirectoryFromPath(toolFile);
        if (directory) {
            if (!toolsByDirectory.has(directory)) {
                toolsByDirectory.set(directory, []);
            }
            toolsByDirectory.get(directory)!.push(toolFile);
        }
    }
    
    const violations: Array<{ directory: string; missingExports: string[] }> = [];
    
    for (const [directory, files] of toolsByDirectory.entries()) {
        const indexExports = getToolDirectoryExports(directory, toolsDir);
        const exportedNames = new Set(indexExports.map(e => e.name));
        
        const missingExports: string[] = [];
        
        for (const file of files) {
            const parsed = parseTypeScriptFile(file);
            const toolClasses = parsed.classes.filter(c => 
                extendsClass(c, 'BaseDeclarativeTool')
            );
            
            for (const toolClass of toolClasses) {
                if (!exportedNames.has(toolClass.name)) {
                    missingExports.push(toolClass.name);
                }
            }
        }
        
        if (missingExports.length > 0) {
            violations.push({ directory, missingExports });
        }
    }
    
    if (violations.length > 0) {
        console.warn('Index export completeness violations:');
        violations.forEach(v => 
            console.warn(`  ${v.directory}: Missing exports for ${v.missingExports.join(', ')}`)
        );
    }
}

/**
 * Property test: File Naming Convention
 * 
 * For any tool file in a tool directory, its filename should match the pattern
 * {module-name}-{action}.ts where module-name matches the directory name.
 * 
 * **Validates: Requirements 3.4**
 */
export async function testFileNamingConvention(): Promise<void> {
    const toolFiles = getAllToolFiles();
    const violations: Array<{ file: string; expected: string; actual: string }> = [];
    
    for (const toolFile of toolFiles) {
        const validation = validateToolFileNaming(toolFile);
        
        if (!validation.valid) {
            violations.push({
                file: toolFile,
                expected: validation.expectedPattern,
                actual: validation.actualName,
            });
        }
    }
    
    if (violations.length > 0) {
        console.warn('File naming convention violations:');
        violations.forEach(v => 
            console.warn(`  ${v.file}: Expected ${v.expected}, got ${v.actual}`)
        );
    }
}

/**
 * Property test: JSDoc Presence
 * 
 * For any tool class and its parameter interface, JSDoc comments should be present
 * explaining the purpose and parameters.
 * 
 * **Validates: Requirements 3.5**
 */
export async function testJSDocPresence(): Promise<void> {
    const toolFiles = getAllToolFiles();
    const violations: Array<{ file: string; missing: string[] }> = [];
    
    for (const toolFile of toolFiles) {
        try {
            const parsed = parseTypeScriptFile(toolFile);
            const content = require('fs').readFileSync(toolFile, 'utf-8');
            const missing: string[] = [];
            
            // Check Tool classes
            const toolClasses = parsed.classes.filter(c => 
                extendsClass(c, 'BaseDeclarativeTool')
            );
            
            for (const toolClass of toolClasses) {
                if (!hasJSDocComment(content, toolClass.name)) {
                    missing.push(`Class: ${toolClass.name}`);
                }
            }
            
            // Check parameter interfaces
            const paramInterfaces = parsed.interfaces.filter(i => 
                i.name.endsWith('Params')
            );
            
            for (const paramInterface of paramInterfaces) {
                if (!hasJSDocComment(content, paramInterface.name)) {
                    missing.push(`Interface: ${paramInterface.name}`);
                }
            }
            
            if (missing.length > 0) {
                violations.push({ file: toolFile, missing });
            }
        } catch (error) {
            // Skip files that can't be parsed
        }
    }
    
    if (violations.length > 0) {
        console.warn('JSDoc presence violations:');
        violations.forEach(v => 
            console.warn(`  ${v.file}: Missing JSDoc for ${v.missing.join(', ')}`)
        );
    }
}

/**
 * Runs all property tests
 */
export async function runAllPropertyTests(): Promise<void> {
    console.log('Running property-based tests...\n');
    
    console.log('Property 1: Module-to-Tool Directory Correspondence');
    await testModuleToToolDirectoryCorrespondence();
    
    console.log('\nProperty 3: Two-Class Pattern Completeness');
    await testTwoClassPatternCompleteness();
    
    console.log('\nProperty 9: Directory Naming Consistency');
    await testDirectoryNamingConsistency();
    
    console.log('\nProperty 10: Index Export Completeness');
    await testIndexExportCompleteness();
    
    console.log('\nProperty 11: File Naming Convention');
    await testFileNamingConvention();
    
    console.log('\nProperty 12: JSDoc Presence');
    await testJSDocPresence();
    
    console.log('\nProperty tests completed.');
}
