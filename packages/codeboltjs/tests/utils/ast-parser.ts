/**
 * AST parsing utilities for structural validation
 * 
 * This module provides utilities for parsing TypeScript files and extracting
 * structural information for property-based testing of tool wrappers.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a class found in a TypeScript file
 */
export interface ClassInfo {
    name: string;
    extendsClass?: string;
    properties: PropertyInfo[];
    methods: MethodInfo[];
    constructorParams: ParameterInfo[];
}

/**
 * Represents a property in a class
 */
export interface PropertyInfo {
    name: string;
    type?: string;
    isOptional: boolean;
    isReadonly: boolean;
}

/**
 * Represents a method in a class
 */
export interface MethodInfo {
    name: string;
    parameters: ParameterInfo[];
    returnType?: string;
    isAsync: boolean;
}

/**
 * Represents a parameter in a method or constructor
 */
export interface ParameterInfo {
    name: string;
    type?: string;
    isOptional: boolean;
}

/**
 * Represents an interface found in a TypeScript file
 */
export interface InterfaceInfo {
    name: string;
    properties: PropertyInfo[];
    extendsInterfaces: string[];
}

/**
 * Represents an export statement
 */
export interface ExportInfo {
    name: string;
    isDefault: boolean;
    isNamed: boolean;
}

/**
 * Parses a TypeScript file and extracts class information
 * 
 * Note: This is a simplified parser that uses regex patterns.
 * For production use, consider using TypeScript Compiler API.
 */
export function parseTypeScriptFile(filePath: string): {
    classes: ClassInfo[];
    interfaces: InterfaceInfo[];
    exports: ExportInfo[];
} {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    return {
        classes: extractClasses(content),
        interfaces: extractInterfaces(content),
        exports: extractExports(content),
    };
}

/**
 * Extracts class information from TypeScript content
 */
export function extractClasses(content: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    
    // Match class declarations
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:<[^>]+>)?))?/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        const extendsClass = match[2];
        
        classes.push({
            name: className,
            extendsClass,
            properties: [],
            methods: [],
            constructorParams: [],
        });
    }
    
    return classes;
}

/**
 * Extracts interface information from TypeScript content
 */
export function extractInterfaces(content: string): InterfaceInfo[] {
    const interfaces: InterfaceInfo[] = [];
    
    // Match interface declarations
    const interfaceRegex = /interface\s+(\w+)(?:\s+extends\s+([^{]+))?\s*{([^}]*)}/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
        const interfaceName = match[1];
        const extendsClause = match[2];
        const body = match[3];
        
        const extendsInterfaces = extendsClause
            ? extendsClause.split(',').map(s => s.trim())
            : [];
        
        const properties = extractPropertiesFromBody(body);
        
        interfaces.push({
            name: interfaceName,
            properties,
            extendsInterfaces,
        });
    }
    
    return interfaces;
}

/**
 * Extracts properties from an interface or class body
 */
function extractPropertiesFromBody(body: string): PropertyInfo[] {
    const properties: PropertyInfo[] = [];
    
    // Match property declarations
    const propertyRegex = /(readonly\s+)?(\w+)(\?)?:\s*([^;]+);/g;
    let match;
    
    while ((match = propertyRegex.exec(body)) !== null) {
        const isReadonly = !!match[1];
        const name = match[2];
        const isOptional = !!match[3];
        const type = match[4]?.trim();
        
        properties.push({
            name,
            type,
            isOptional,
            isReadonly,
        });
    }
    
    return properties;
}

/**
 * Extracts export statements from TypeScript content
 */
export function extractExports(content: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    // Match named exports
    const namedExportRegex = /export\s+(?:class|interface|function|const|let|var)\s+(\w+)/g;
    let match;
    
    while ((match = namedExportRegex.exec(content)) !== null) {
        exports.push({
            name: match[1],
            isDefault: false,
            isNamed: true,
        });
    }
    
    // Match default exports
    const defaultExportRegex = /export\s+default\s+(\w+)/g;
    while ((match = defaultExportRegex.exec(content)) !== null) {
        exports.push({
            name: match[1],
            isDefault: true,
            isNamed: false,
        });
    }
    
    // Match export { ... } statements
    const exportBlockRegex = /export\s*{\s*([^}]+)\s*}/g;
    while ((match = exportBlockRegex.exec(content)) !== null) {
        const exportList = match[1].split(',').map(s => s.trim());
        exportList.forEach(exportName => {
            const name = exportName.split(' as ')[0].trim();
            exports.push({
                name,
                isDefault: false,
                isNamed: true,
            });
        });
    }
    
    return exports;
}

/**
 * Checks if a class extends a specific base class
 */
export function extendsClass(classInfo: ClassInfo, baseClassName: string): boolean {
    if (!classInfo.extendsClass) {
        return false;
    }
    
    // Handle generic types like BaseDeclarativeTool<TParams, TResult>
    const baseClassPattern = new RegExp(`^${baseClassName}(?:<[^>]+>)?$`);
    return baseClassPattern.test(classInfo.extendsClass);
}

/**
 * Gets all TypeScript files in a directory recursively
 */
export function getAllTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllTypeScriptFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Gets all tool files from the tools directory
 */
export function getAllToolFiles(toolsDir: string = 'packages/codeboltjs/src/tools'): string[] {
    const toolFiles: string[] = [];
    
    try {
        const files = getAllTypeScriptFiles(toolsDir);
        
        // Filter out index.ts, base-tool.ts, types.ts, and utility files
        return files.filter(file => {
            const basename = path.basename(file);
            return basename !== 'index.ts' &&
                   basename !== 'base-tool.ts' &&
                   basename !== 'types.ts' &&
                   !file.includes('/utils/');
        });
    } catch (error) {
        console.error('Error getting tool files:', error);
        return [];
    }
}

/**
 * Gets all module files from the modules directory
 */
export function getAllModuleFiles(modulesDir: string = 'packages/codeboltjs/src/modules'): string[] {
    try {
        return getAllTypeScriptFiles(modulesDir);
    } catch (error) {
        console.error('Error getting module files:', error);
        return [];
    }
}

/**
 * Extracts module name from a module file path
 */
export function getModuleNameFromPath(filePath: string): string {
    const basename = path.basename(filePath, '.ts');
    return basename;
}

/**
 * Extracts tool directory name from a tool file path
 */
export function getToolDirectoryFromPath(filePath: string): string {
    const parts = filePath.split(path.sep);
    const toolsIndex = parts.indexOf('tools');
    
    if (toolsIndex >= 0 && toolsIndex < parts.length - 1) {
        return parts[toolsIndex + 1];
    }
    
    return '';
}

/**
 * Checks if a tool directory exists for a given module
 */
export function toolDirectoryExistsForModule(
    moduleName: string,
    toolsDir: string = 'packages/codeboltjs/src/tools'
): boolean {
    const toolDir = path.join(toolsDir, moduleName);
    return fs.existsSync(toolDir) && fs.statSync(toolDir).isDirectory();
}

/**
 * Gets the index.ts file exports for a tool directory
 */
export function getToolDirectoryExports(
    toolDirectory: string,
    toolsDir: string = 'packages/codeboltjs/src/tools'
): ExportInfo[] {
    const indexPath = path.join(toolsDir, toolDirectory, 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
        return [];
    }
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    return extractExports(content);
}

/**
 * Validates that a file follows the naming convention
 */
export function validateToolFileNaming(filePath: string): {
    valid: boolean;
    expectedPattern: string;
    actualName: string;
} {
    const basename = path.basename(filePath, '.ts');
    const directory = getToolDirectoryFromPath(filePath);
    
    // Expected pattern: {module-name}-{action}.ts
    const expectedPattern = `${directory}-*`;
    const valid = basename.startsWith(`${directory}-`);
    
    return {
        valid,
        expectedPattern,
        actualName: basename,
    };
}

/**
 * Extracts JSDoc comments from TypeScript content
 */
export function extractJSDocComments(content: string): string[] {
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(jsdocRegex);
    return matches || [];
}

/**
 * Checks if a class or interface has JSDoc comments
 */
export function hasJSDocComment(content: string, name: string): boolean {
    // Look for JSDoc comment immediately before the class/interface declaration
    const pattern = new RegExp(`/\\*\\*[\\s\\S]*?\\*/\\s*(?:export\\s+)?(?:class|interface)\\s+${name}`, 'g');
    return pattern.test(content);
}
