import path from "path";
export function detectLanguage(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const extensionMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.tsx': 'typescript',
      '.jsx': 'javascript',
    };
  
    return extension in extensionMap ? extensionMap[extension] : 'plaintext';
  }