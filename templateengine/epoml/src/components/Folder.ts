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
  // Breadth-first traversal with normalization and level tracking
  let currentLevel = 0;
  let currentPaths: { path: string; level: number }[] = [{ path: rootPath.replace(/[\/\\]+$/, ''), level: 0 }];

  while (currentLevel < maxDepth && currentPaths.length > 0 && allEntries.length < itemLimit) {
    const nextPaths: { path: string; level: number }[] = [];

    for (const { path: currentPath, level } of currentPaths) {
      if (allEntries.length >= itemLimit) break;
      try {
        const listResult = await codebolt.fs.listFile(currentPath, false);
        if (!(listResult && listResult.success && listResult.result)) {
          continue;
        }

        const raw = String(listResult.result).trim();
        if (raw.toLowerCase().startsWith('no files found')) {
          continue;
        }

        const files = raw.split('\n').filter((file: string) => file.trim());
        for (const file of files) {
          if (allEntries.length >= itemLimit) break;

          const rawName = file.trim();
          const joinedPath = path.join(currentPath, rawName);
          const normalizedFullPath = joinedPath.replace(/[\/\\]+$/, '');
          const relativePath = path.relative(rootPath, normalizedFullPath);
          const cleanFileName = rawName.replace(/[\/\\]+$/, '');

          const isDir = await isDirectory(normalizedFullPath);

          // Skip if matches gitignore patterns
          if (respectGitignore && shouldIgnore(relativePath, gitignorePatterns)) {
            if (isDir) {
              allEntries.push({
                name: cleanFileName,
                fullPath: normalizedFullPath,
                isDirectory: true,
                level: level + 1
              });
            }
            continue;
          }

          allEntries.push({
            name: cleanFileName,
            fullPath: normalizedFullPath,
            isDirectory: isDir,
            level: level + 1
          });

          if (isDir) {
            nextPaths.push({ path: normalizedFullPath, level: level + 1 });
          }
        }
      } catch (error) {
        continue;
      }
    }

    currentPaths = nextPaths;
    currentLevel++;
  }
  
  // Debug the collected entries before tree generation
  console.log(`[FOLDER DEBUG] Collected ${allEntries.length} total entries`);
  console.log(`[FOLDER DEBUG] Entries by level:`, 
    allEntries.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  );
  console.log(`[FOLDER DEBUG] Sample entries:`, 
    allEntries.slice(0, 10).map(e => `${e.name} (level ${e.level}) at ${e.fullPath}`)
  );
  
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
  
  // Group entries by level for easier processing
  const entriesByLevel = new Map<number, FileEntry[]>();
  for (const entry of entries) {
    if (!entriesByLevel.has(entry.level)) {
      entriesByLevel.set(entry.level, []);
    }
    entriesByLevel.get(entry.level)!.push(entry);
  }
  
  // Build a hierarchical structure using a simpler approach
  interface TreeNode {
    name: string;
    fullPath: string;
    isDirectory: boolean;
    children: TreeNode[];
    level: number;
  }
  
  // Create a map to store all nodes
  const nodeMap = new Map<string, TreeNode>();
  
  // First, create nodes for all entries
  for (const entry of entries) {
    const node: TreeNode = {
      name: entry.name,
      fullPath: entry.fullPath,
      isDirectory: entry.isDirectory,
      children: [],
      level: entry.level
    };
    nodeMap.set(entry.fullPath, node);
  }
  
  // Build parent-child relationships using a simpler approach
  const rootNodes: TreeNode[] = [];
  
  console.log(`[TREE DEBUG] Building tree from ${entries.length} entries`);
  console.log(`[TREE DEBUG] Root path: ${rootPath}`);
  
  // First pass: identify root nodes (direct children of root)
  for (const entry of entries) {
    const node = nodeMap.get(entry.fullPath)!;
    const parentPath = path.dirname(entry.fullPath);
    
    // Normalize paths for comparison
    const normalizedRootPath = path.normalize(rootPath);
    const normalizedParentPath = path.normalize(parentPath);
    
    console.log(`[TREE DEBUG] Checking ${entry.name}: parentPath="${normalizedParentPath}", rootPath="${normalizedRootPath}"`);
    
    if (normalizedParentPath === normalizedRootPath) {
      console.log(`[TREE DEBUG] Adding ${entry.name} as root node`);
      rootNodes.push(node);
    }
  }
  
  // Second pass: build nested relationships
  for (const entry of entries) {
    const node = nodeMap.get(entry.fullPath)!;
    const parentPath = path.dirname(entry.fullPath);
    const normalizedRootPath = path.normalize(rootPath);
    const normalizedParentPath = path.normalize(parentPath);
    
    // Skip root nodes (already processed)
    if (normalizedParentPath === normalizedRootPath) {
      continue;
    }
    
    // Find the parent node
    const parentNode = nodeMap.get(parentPath);
    if (parentNode) {
      console.log(`[TREE DEBUG] Adding ${entry.name} as child of ${parentNode.name}`);
      parentNode.children.push(node);
    } else {
      console.log(`[TREE DEBUG] Parent not found for ${entry.name}, parent path: ${parentPath}`);
      // As fallback, add to root
      rootNodes.push(node);
    }
  }
  
  console.log(`[TREE DEBUG] Final root nodes: ${rootNodes.length}`);
  console.log(`[TREE DEBUG] Root nodes:`, rootNodes.map(n => `${n.name} (${n.children.length} children)`));
  
  // Sort function for nodes
  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    // Recursively sort children
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  }
  
  // Sort all nodes
  sortNodes(rootNodes);
  
  // Generate tree display
  function renderNode(node: TreeNode, prefix: string = '', isLast: boolean = true): void {
    const connector = isLast ? '└───' : '├───';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    
    const relativePath = path.relative(rootPath, node.fullPath);
    const isIgnored = respectGitignore && shouldIgnore(relativePath, gitignorePatterns);
    
    if (node.isDirectory) {
      const displayName = isIgnored ? `${node.name}/...` : `${node.name}/`;
      lines.push(`${prefix}${connector}${displayName}`);
      
      if (!isIgnored && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const isLastChild = i === node.children.length - 1;
          renderNode(child, childPrefix, isLastChild);
        }
      }
    } else {
      lines.push(`${prefix}${connector}${node.name}`);
    }
  }
  
  // Render all root nodes
  for (let i = 0; i < rootNodes.length; i++) {
    const node = rootNodes[i];
    const isLastChild = i === rootNodes.length - 1;
    renderNode(node, '', isLastChild);
  }
  
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
  
  // Add item count message
  if (itemLimit) {
    const actualCount = result.itemCount;
    const displayMessage = result.hasMore 
      ? `Showing ${actualCount} of ${actualCount}+ items (display limit of ${itemLimit} reached).`
      : `Showing ${actualCount} items.`;
    output += `${displayMessage} Folders or files indicated with ... contain more items not shown, were ignored, or reached the display limit.\n\n`;
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
  
  // Add item count message
  if (itemLimit) {
    const actualCount = result.itemCount;
    const displayMessage = result.hasMore 
      ? `Showing ${actualCount} of ${actualCount}+ items (display limit of ${itemLimit} reached).`
      : `Showing ${actualCount} items.`;
    output += `${displayMessage} Folders or files indicated with ... contain more items not shown, were ignored, or reached the display limit.\n\n`;
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