import { parseFile, loadRequiredLanguageParsers } from "@codebolt/codeparser";
import type { ASTNode } from "../types/commonTypes";
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * A collection of code parser functions.
 */
const cbcodeparsers = {
    /**
     * Retrieves the classes in a given file.
     * @param file The file to parse for classes.
     */
    getClassesInFile: async (file: string) => {
        // Check if file exists
        try {
            await fs.access(file);
        } catch (error) {
            return { error: `File does not exist or is not accessible: ${file}` };
        }
        
        // Get file extension and determine if we support it
        const ext = path.extname(file).toLowerCase().slice(1);
        const supportedExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'c', 'h', 'cpp', 'hpp', 'cs', 'rb', 'java', 'php', 'swift'];
        
        if (!supportedExtensions.includes(ext)) {
            return { error: `Unsupported file type: ${ext}` };
        }
        
        // Load language parser for this file
        const languageParsers = await loadRequiredLanguageParsers([file]);
        
        // Parse the file
        const result = await parseFile(file, languageParsers);
        
        // Filter for class definitions only
        const lines = result?.split('\n') || [];
        
        const classes = [];
        
        let currentClass = null;
        for (const line of lines) {
            // Match line patterns from the parseFile result format
            if (line.includes('@definition.class')) {
                // Extract the class name from the line
                const className = line.split('@')[0].trim();
                currentClass = { name: className, location: file };
                classes.push(currentClass);
            }
        }
        
        // If no classes found, try to use AST approach
        if (classes.length === 0) {
            try {
                // Get the file extension
                const ext = path.extname(file).toLowerCase().slice(1);
                
                // Load language parser
                const languageParsers = await loadRequiredLanguageParsers([file]);
                
                // Get the parser for this file type
                const { parser } = languageParsers[ext] || {};
                
                if (parser) {
                    // Read the file content
                    const fileContent = await fs.readFile(file, 'utf8');
                    
                    // Parse the file to get AST
                    const tree = parser.parse(fileContent);
                    
                    // Function to find class nodes in the AST
                    const findClassNodes = (node: any): any[] => {
                        const classNodes: any[] = [];
                        
                        if (node.type === 'class_declaration' || 
                            node.type === 'class' || 
                            node.type === 'class_definition') {
                            classNodes.push(node);
                        }
                        
                        // Recursively search children
                        for (let i = 0; i < node.childCount; i++) {
                            const childResults: any[] = findClassNodes(node.child(i));
                            classNodes.push(...childResults);
                        }
                        
                        return classNodes;
                    };
                    
                    const classNodes = findClassNodes(tree.rootNode);
                    
                    // Extract class names from the nodes
                    for (const node of classNodes) {
                        // For most languages, the class name is in a child node
                        // Let's attempt to extract it from the text
                        const text = node.text;
                        const classMatch = text.match(/class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/);
                        
                        if (classMatch && classMatch[1]) {
                            classes.push({
                                name: classMatch[1],
                                location: file
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error trying AST approach:', error);
            }
        }
        
        return classes;
    },
    /**
     * Retrieves the functions in a given class within a file.
     * @param file The file containing the class.
     * @param className The name of the class to parse for functions.
     */
    getFunctionsinClass: async (file: string, className: string) => {
        // Check if file exists
        try {
            await fs.access(file);
        } catch (error) {
            return { error: `File does not exist or is not accessible: ${file}` };
        }
        
        // Load language parser for this file
        const languageParsers = await loadRequiredLanguageParsers([file]);
        
        // Parse the file
        const result = await parseFile(file, languageParsers);
        
        // Extract content
        const fileContent = await fs.readFile(file, 'utf8');
        
        // Parse the file content to find the class and its methods
        const lines = result?.split('\n') || [];
        
        const functions = [];
        
        // Use AST approach to find methods within the class
        try {
            // Get the file extension
            const ext = path.extname(file).toLowerCase().slice(1);
            
            // Get the parser for this file type
            const { parser } = languageParsers[ext] || {};
            
            if (parser) {
                // Parse the file to get AST
                const tree = parser.parse(fileContent);
                
                // Find the class node
                const findClassNode = (node: any): any => {
                    if (
                        (node.type === 'class_declaration' || 
                         node.type === 'class' || 
                         node.type === 'class_definition') && 
                        node.text.includes(className)
                    ) {
                        return node;
                    }
                    
                    // Recursively search children
                    for (let i = 0; i < node.childCount; i++) {
                        const child = node.child(i);
                        const result = findClassNode(child);
                        if (result) return result;
                    }
                    
                    return null;
                };
                
                const classNode = findClassNode(tree.rootNode);
                
                if (classNode) {
                    // Function to find method nodes within the class
                    const findMethodNodes = (node: any): any[] => {
                        const methodNodes: any[] = [];
                        
                        // Different languages use different node types for methods
                        if (node.type === 'method_definition' || 
                            node.type === 'method' || 
                            node.type === 'method_declaration' ||
                            node.type === 'function' ||
                            node.type === 'function_definition') {
                            methodNodes.push(node);
                        }
                        
                        // Recursively search children
                        for (let i = 0; i < node.childCount; i++) {
                            const childResults = findMethodNodes(node.child(i));
                            methodNodes.push(...childResults);
                        }
                        
                        return methodNodes;
                    };
                    
                    const methodNodes = findMethodNodes(classNode);
                    
                    // Extract method names from the nodes
                    for (const node of methodNodes) {
                        // Try to find method name from node text
                        let methodName = '';
                        
                        // Different pattern matching based on language type
                        if (ext === 'py') {
                            // Python methods: def method_name(
                            const methodMatch = node.text.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
                            if (methodMatch && methodMatch[1]) {
                                methodName = methodMatch[1];
                            }
                        } else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
                            // JavaScript/TypeScript methods: methodName( or methodName =
                            const methodMatch = node.text.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[\(=]/);
                            if (methodMatch && methodMatch[1]) {
                                methodName = methodMatch[1];
                            }
                        } else {
                            // Generic approach for other languages
                            // Look for identifiers followed by parentheses
                            const methodMatch = node.text.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
                            if (methodMatch && methodMatch[1]) {
                                methodName = methodMatch[1];
                            }
                        }
                        
                        if (methodName && !['constructor', '__init__'].includes(methodName)) {
                            functions.push({
                                name: methodName,
                                class: className,
                                location: file
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing methods:', error);
        }
        
        return functions;
    },
    /**
     * Generates an Abstract Syntax Tree (AST) for a given file.
     * @param file The file to generate an AST for.
     * @param className The name of the class to focus the AST generation on.
     */
    getAstTreeInFile: async (file: string, className?: string) => {
    
        try {
            await fs.access(file);
        } catch (error) {
            return { error: `File does not exist or is not accessible: ${file}` };
        }
        
        // Get file extension and determine if we support it
        const ext = path.extname(file).toLowerCase().slice(1);
        const supportedExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'c', 'h', 'cpp', 'hpp', 'cs', 'rb', 'java', 'php', 'swift'];
        
        if (!supportedExtensions.includes(ext)) {
            return { error: `Unsupported file type: ${ext}` };
        }
        
        // Load language parser for this file
        const languageParsers = await loadRequiredLanguageParsers([file]);
        
        // Get the parser for this file type
        const { parser } = languageParsers[ext] || {};
        if (!parser) {
            return { error: `No parser available for file type: ${ext}` };
        }
        
        // Read the file content
        const fileContent = await fs.readFile(file, 'utf8');
        
        // Parse the file to get AST
        const tree = parser.parse(fileContent);
        
        // If className is provided, find and return only that class's AST
        if (className) {
            // Function to recursively search for the class node
            const findClassNode = (node: any): any => {
                if (
                    (node.type === 'class_declaration' || 
                     node.type === 'abstract_class_declaration' || 
                     node.type === 'class_definition') && 
                    node.text.includes(className)
                ) {
                    return node;
                }
                
                // Recursively search children
                for (let i = 0; i < node.childCount; i++) {
                    const child = node.child(i);
                    const result = findClassNode(child);
                    if (result) return result;
                }
                
                return null;
            };
            
            const classNode = findClassNode(tree.rootNode);
            
            if (classNode) {
                // Convert the class node to a JSON-serializable object
                const serializeNode = (node: any): ASTNode => {
                    const result: ASTNode = {
                        type: node.type,
                        text: node.text,
                        startPosition: { row: node.startPosition.row, column: node.startPosition.column },
                        endPosition: { row: node.endPosition.row, column: node.endPosition.column },
                        children: []
                    };
                    
                    for (let i = 0; i < node.childCount; i++) {
                        result.children.push(serializeNode(node.child(i)));
                    }
                    
                    return result;
                };
                
                return serializeNode(classNode);
            } else {
                return { error: `Class '${className}' not found in file: ${file}` };
            }
        }
        
        // Otherwise return the full AST
        // Convert the full tree to a JSON-serializable object
        const serializeNode = (node: any): ASTNode => {
            const result: ASTNode = {
                type: node.type,
                text: node.text,
                startPosition: { row: node.startPosition.row, column: node.startPosition.column },
                endPosition: { row: node.endPosition.row, column: node.endPosition.column },
                children: []
            };
            
            for (let i = 0; i < node.childCount; i++) {
                result.children.push(serializeNode(node.child(i)));
            }
            
            return result;
        };
        
        return serializeNode(tree.rootNode);
    }
};

export default cbcodeparsers;
