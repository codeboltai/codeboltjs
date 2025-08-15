/*
 * Generates a string describing the current workspace directories and their structures.
*/

interface FileTreeNode {
  name: string;
  path: string;
  isFile: boolean;
  children: Map<string, FileTreeNode>;
}

/**
 * Generates a context string from a list of file paths with tree structure formatting.
 * Similar to getFolderStructure but works with a predefined list of files.
 * @param files Array of file paths to include in the context
 * @param workspaceDirectories Optional array of workspace directories for context
 * @returns A formatted string describing the workspace and file structure
 */
export function generateWorkspaceContextString(
  files: string[],
  workspaceDirectories?: string[]
): string {
  let workingDirPreamble: string;
  
  if (workspaceDirectories && workspaceDirectories.length > 0) {
    if (workspaceDirectories.length === 1) {
      workingDirPreamble = `I'm currently working in the directory: ${workspaceDirectories[0]}`;
    } else {
      const dirList = workspaceDirectories.map((dir) => `  - ${dir}`).join('\n');
      workingDirPreamble = `I'm currently working in the following directories:\n${dirList}`;
    }
  } else {
    workingDirPreamble = `I'm currently working with the following files`;
  }

  if (files.length === 0) {
    return `${workingDirPreamble}

(No files specified)`;
  }

  // Build tree structure from file paths
  const tree = buildFileTree(files);
  
  // Format tree structure
  const structureLines: string[] = [];
  
  if (tree.size === 1) {
    // Single root directory
    const firstEntry = tree.entries().next().value;
    if (firstEntry) {
      const [rootPath, rootNode] = firstEntry;
      structureLines.push(`${rootPath}/`);
      formatFileTree(rootNode, '', true, structureLines);
    }
  } else {
    // Multiple roots or files at top level
    const entries = Array.from(tree.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (let i = 0; i < entries.length; i++) {
      const [path, node] = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? '└───' : '├───';
      
      if (node.isFile) {
        structureLines.push(`${connector}${node.name}`);
      } else {
        structureLines.push(`${connector}${node.name}/`);
        const childIndent = isLast ? '    ' : '│   ';
        formatFileTree(node, childIndent, true, structureLines);
      }
    }
  }

  const fileStructure = structureLines.join('\n');
  
  return `${workingDirPreamble}
Here is the file structure of the current workspace context:

${fileStructure}`;
}

/**
 * Builds a tree structure from an array of file paths
 */
function buildFileTree(files: string[]): Map<string, FileTreeNode> {
  const root = new Map<string, FileTreeNode>();
  
  for (const filePath of files) {
    const parts = filePath.split('/').filter(part => part.length > 0);
    let currentLevel = root;
    let currentPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = i === parts.length - 1;
      
      if (!currentLevel.has(part)) {
        currentLevel.set(part, {
          name: part,
          path: currentPath,
          isFile,
          children: new Map()
        });
      }
      
      const node = currentLevel.get(part)!;
      currentLevel = node.children;
    }
  }
  
  return root;
}

/**
 * Formats the tree structure with proper connectors and indentation
 */
function formatFileTree(
  node: FileTreeNode,
  currentIndent: string,
  isRoot: boolean,
  builder: string[]
): void {
  const children = Array.from(node.children.entries()).sort(([a], [b]) => {
    // Sort directories first, then files
    const aNode = node.children.get(a)!;
    const bNode = node.children.get(b)!;
    if (aNode.isFile !== bNode.isFile) {
      return aNode.isFile ? 1 : -1;
    }
    return a.localeCompare(b);
  });
  
  for (let i = 0; i < children.length; i++) {
    const [name, childNode] = children[i];
    const isLast = i === children.length - 1;
    const connector = isLast ? '└───' : '├───';
    const childIndent = currentIndent + (isLast ? '    ' : '│   ');
    
    if (childNode.isFile) {
      builder.push(`${currentIndent}${connector}${name}`);
    } else {
      builder.push(`${currentIndent}${connector}${name}/`);
      formatFileTree(childNode, childIndent, false, builder);
    }
  }
}

