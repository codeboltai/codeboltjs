import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import codebolt from '@codebolt/codeboltjs';
import * as path from 'path';

export interface FolderProps extends BaseComponentProps {
  /** Folder name */
  name?: string;
  /** Folder path */
  path?: string;
  /** Maximum number of items to show (default: 200) */
  itemLimit?: number;
  /** Maximum depth to traverse (default: 3) */
  maxDepth?: number;
  /** Whether to respect .gitignore files (default: true) */
  respectGitignore?: boolean;
}

interface FileEntry {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  level: number;
}

interface FolderResult {
  content: string;
  itemCount: number;
  hasMore: boolean;
}

export async function Folder(props: FolderProps): Promise<Component> {
  const {
    name,
    path: folderPath,
    itemLimit = 200,
    maxDepth = 3,
    respectGitignore = true,
    syntax = 'text',
    className,
    speaker,
    children = []
  } = props;

  try {
    // Get absolute path
    const absolutePath = folderPath ? path.resolve(folderPath) : process.cwd();
    const folderName = name || path.basename(absolutePath);

    // Build folder structure
    const result = await buildFolderStructure(absolutePath, itemLimit, maxDepth, respectGitignore);
    
    // Generate the component based on syntax
    switch (syntax) {
      case 'markdown':
        return generateMarkdownFolder(folderName, absolutePath, result, className, speaker, itemLimit);
      
      case 'html':
        return generateHtmlFolder(folderName, absolutePath, result, className, speaker, itemLimit);
      
      case 'json':
        return generateJsonFolder(folderName, absolutePath, result, className, speaker, itemLimit);
      
      case 'yaml':
        return generateYamlFolder(folderName, absolutePath, result, className, speaker, itemLimit);
      
      case 'xml':
        return generateXmlFolder(folderName, absolutePath, result, className, speaker, itemLimit);
      
      case 'text':
      default:
        return generateTextFolder(folderName, absolutePath, result, className, speaker, itemLimit);
    }
  } catch (error) {
    const errorMessage = `Error reading folder: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return createElement('div', { className, 'data-speaker': speaker }, errorMessage);
  }
}

async function buildFolderStructure(
  rootPath: string, 
  itemLimit: number, 
  maxDepth: number, 
  respectGitignore: boolean
): Promise<FolderResult> {
  let allEntries: FileEntry[] = [];
  let gitignorePatterns: string[] = [];
  
  // Check for .gitignore file in root
  if (respectGitignore) {
    gitignorePatterns = await loadGitignorePatterns(rootPath);
  }

  // Collect entries level by level
  let currentLevel = 0;
  let currentPaths = [{ path: rootPath, level: 0 }];
  
  while (currentLevel <= maxDepth && currentPaths.length > 0 && allEntries.length < itemLimit) {
    const nextPaths: { path: string; level: number }[] = [];
    
    for (const { path: currentPath, level } of currentPaths) {
      if (allEntries.length >= itemLimit) break;
      
      try {
        const listResult = await codebolt.fs.listFile(currentPath, false);
        
        if (listResult && listResult.success && listResult.result) {
          const files = listResult.result.split('\n').filter((file: string) => file.trim());
          
          for (const file of files) {
            if (allEntries.length >= itemLimit) break;
            
            const fullPath = path.join(currentPath, file);
            const relativePath = path.relative(rootPath, fullPath);
            
            // Skip if matches gitignore patterns
            if (respectGitignore && shouldIgnore(relativePath, gitignorePatterns)) {
              // If it's a directory and matches gitignore, add a placeholder
              if (await isDirectory(fullPath)) {
                allEntries.push({
                  name: file,
                  fullPath,
                  isDirectory: true,
                  level: level + 1
                });
              }
              continue;
            }
            
            const isDir = await isDirectory(fullPath);
            
            allEntries.push({
              name: file,
              fullPath,
              isDirectory: isDir,
              level: level + 1
            });
            
            // Add to next level if it's a directory and we haven't reached max depth
            if (isDir && level < maxDepth) {
              nextPaths.push({ path: fullPath, level: level + 1 });
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
        continue;
      }
    }
    
    currentPaths = nextPaths;
    currentLevel++;
  }
  
  // Generate tree structure
  const content = generateTreeStructure(rootPath, allEntries, gitignorePatterns, respectGitignore);
  
  return {
    content,
    itemCount: allEntries.length,
    hasMore: allEntries.length >= itemLimit
  };
}

async function loadGitignorePatterns(rootPath: string): Promise<string[]> {
  try {
    const gitignorePath = path.join(rootPath, '.gitignore');
    const readResult = await codebolt.fs.readFile(gitignorePath);
    
    if (readResult && readResult.success && readResult.result) {
      return readResult.result
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.startsWith('#'))
        .concat(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt']); // Common ignores
    }
  } catch (error) {
    // .gitignore doesn't exist or can't be read
  }
  
  return ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt']; // Default ignores
}

function shouldIgnore(filePath: string, patterns: string[]): boolean {
  const fileName = path.basename(filePath);
  const relativePath = filePath.replace(/\\/g, '/'); // Normalize path separators
  
  return patterns.some(pattern => {
    // Remove leading/trailing slashes
    const cleanPattern = pattern.replace(/^\/+|\/+$/g, '');
    
    if (cleanPattern.includes('*')) {
      // Handle wildcards
      const regexPattern = cleanPattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(fileName) || regex.test(relativePath);
    } else {
      // Exact match
      return fileName === cleanPattern || 
             relativePath === cleanPattern ||
             relativePath.startsWith(cleanPattern + '/') ||
             relativePath.includes('/' + cleanPattern);
    }
  });
}

async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const listResult = await codebolt.fs.listFile(filePath, false);
    return listResult && listResult.success;
  } catch (error) {
    return false;
  }
}

function generateTreeStructure(
  rootPath: string, 
  entries: FileEntry[], 
  gitignorePatterns: string[], 
  respectGitignore: boolean
): string {
  if (entries.length === 0) {
    return 'Empty directory';
  }
  
  const lines: string[] = [];
  const pathMap = new Map<string, FileEntry[]>();
  
  // Group entries by their parent directory
  for (const entry of entries) {
    const parentPath = path.dirname(entry.fullPath);
    if (!pathMap.has(parentPath)) {
      pathMap.set(parentPath, []);
    }
    pathMap.get(parentPath)!.push(entry);
  }
  
  // Sort entries
  for (const [parentPath, children] of pathMap.entries()) {
    children.sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  
  // Generate tree
  function addEntries(currentPath: string, prefix: string = '', isLast: boolean = true) {
    const children = pathMap.get(currentPath) || [];
    
    for (let i = 0; i < children.length; i++) {
      const entry = children[i];
      const isLastChild = i === children.length - 1;
      const connector = isLastChild ? '└───' : '├───';
      const childPrefix = prefix + (isLastChild ? '    ' : '│   ');
      
      const relativePath = path.relative(rootPath, entry.fullPath);
      const isIgnored = respectGitignore && shouldIgnore(relativePath, gitignorePatterns);
      
      if (entry.isDirectory) {
        const displayName = isIgnored ? `${entry.name}/...` : `${entry.name}/`;
        lines.push(`${prefix}${connector}${displayName}`);
        
        if (!isIgnored) {
          addEntries(entry.fullPath, childPrefix, isLastChild);
        }
      } else {
        lines.push(`${prefix}${connector}${entry.name}`);
      }
    }
  }
  
  // Start with root directory entries
  addEntries(rootPath);
  
  return lines.join('\n');
}

function generateMarkdownFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  let output = '';
  
  // Add item limit message if provided
  if (itemLimit) {
    output += `Showing up to ${itemLimit} items (files + folders). Folders or files indicated with ... contain more items not shown, were ignored, or the display limit (${itemLimit} items) was reached.\n\n`;
  }
  
  // Add absolute path
  output += `${absolutePath}/\n`;
  
  // Add tree structure
  if (result.content) {
    output += result.content;
  }
  
  // Add more items indicator
  if (result.hasMore) {
    output += `\n... (${result.itemCount}+ items, showing first ${itemLimit})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, output);
}

function generateHtmlFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  let html = `<div class="folder">`;
  
  // Add item limit message if provided
  if (itemLimit) {
    html += `<p><em>Showing up to ${itemLimit} items (files + folders). Folders or files indicated with ... contain more items not shown, were ignored, or the display limit (${itemLimit} items) was reached.</em></p>`;
  }
  
  // Add absolute path
  html += `<h3>${absolutePath.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}/</h3>`;
  
  // Add tree structure
  if (result.content) {
    html += `<pre class="folder-tree">${result.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
  }
  
  // Add more items indicator
  if (result.hasMore) {
    html += `<p><em>... (${result.itemCount}+ items, showing first ${itemLimit})</em></p>`;
  }
  
  html += `</div>`;
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  const obj: any = { 
    type: 'folder', 
    name, 
    path: absolutePath,
    itemCount: result.itemCount,
    hasMore: result.hasMore,
    content: result.content
  };
  
  if (itemLimit) {
    obj.itemLimit = itemLimit;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  let yaml = `type: folder\nname: ${JSON.stringify(name)}\npath: ${JSON.stringify(absolutePath)}\n`;
  yaml += `itemCount: ${result.itemCount}\nhasMore: ${result.hasMore}\n`;
  
  if (itemLimit) {
    yaml += `itemLimit: ${itemLimit}\n`;
  }
  
  yaml += `content: ${JSON.stringify(result.content)}`;
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  let xml = `<folder name="${name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  xml += ` path="${absolutePath.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  xml += ` itemCount="${result.itemCount}" hasMore="${result.hasMore}"`;
  
  if (itemLimit) {
    xml += ` itemLimit="${itemLimit}"`;
  }
  
  xml += `>${result.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</folder>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextFolder(
  name: string,
  absolutePath: string,
  result: FolderResult,
  className?: string,
  speaker?: string,
  itemLimit?: number
): Component {
  let output = '';
  
  // Add item limit message if provided
  if (itemLimit) {
    output += `Showing up to ${itemLimit} items (files + folders). Folders or files indicated with ... contain more items not shown, were ignored, or the display limit (${itemLimit} items) was reached.\n\n`;
  }
  
  // Add absolute path
  output += `${absolutePath}/\n`;
  
  // Add tree structure
  if (result.content) {
    output += result.content;
  }
  
  // Add more items indicator
  if (result.hasMore) {
    output += `\n... (${result.itemCount}+ items, showing first ${itemLimit})`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, output);
}