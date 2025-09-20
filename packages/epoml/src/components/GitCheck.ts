import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import codebolt from '@codebolt/codeboltjs';
import * as path from 'path';

export interface GitCheckProps extends BaseComponentProps {
  /** Whether to check if current directory is a git repository (default: true) */
  isARepo?: boolean;
  /** Directory path to check (defaults to current working directory) */
  path?: string;
  /** Whether to check for git status as well (default: false) */
  checkStatus?: boolean;
  /** Whether to show git information when repo is found (default: false) */
  showGitInfo?: boolean;
}

export async function GitCheck(props: GitCheckProps): Promise<Component> {
  const {
    isARepo = true,
    path: checkPath,
    checkStatus = false,
    showGitInfo = false,
    syntax = 'text',
    className,
    speaker,
    children = []
  } = props;

  try {
    // Get the directory to check
    const targetPath = checkPath ? path.resolve(checkPath) : process.cwd();
    
    // Check if it's a git repository
    const isGitRepo = await checkIsGitRepository(targetPath);
    
    // Determine if content should be shown
    const shouldShowContent = isARepo ? isGitRepo : !isGitRepo;
    
    if (!shouldShowContent) {
      // Don't render anything if condition is not met
      return createElement('span', { className, 'data-speaker': speaker }, '');
    }
    
    // Process children content
    let content = children.map(child => typeof child === 'string' ? child : '').join('');
    
    // Optionally add git information
    if (showGitInfo && isGitRepo) {
      const gitInfo = await getGitInformation(targetPath);
      if (gitInfo) {
        content = gitInfo + (content ? '\n' + content : '');
      }
    }
    
    // Generate the component based on syntax
    switch (syntax) {
      case 'markdown':
        return generateMarkdownGitCheck(content, isGitRepo, className, speaker);
      
      case 'html':
        return generateHtmlGitCheck(content, isGitRepo, className, speaker);
      
      case 'json':
        return generateJsonGitCheck(content, isGitRepo, targetPath, className, speaker);
      
      case 'yaml':
        return generateYamlGitCheck(content, isGitRepo, targetPath, className, speaker);
      
      case 'xml':
        return generateXmlGitCheck(content, isGitRepo, targetPath, className, speaker);
      
      case 'text':
      default:
        return generateTextGitCheck(content, className, speaker);
    }
  } catch (error) {
    const errorMessage = `Error checking git repository: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return createElement('span', { className, 'data-speaker': speaker }, errorMessage);
  }
}

async function checkIsGitRepository(directoryPath: string): Promise<boolean> {
  try {
    // Check if .git directory exists by trying to list it
    const gitPath = path.join(directoryPath, '.git');
    const listResult = await codebolt.fs.listFile(gitPath, false);
    
    if (listResult && listResult.success) {
      return true;
    }
    
    // If .git directory doesn't exist, check parent directories (up to root)
    const parentPath = path.dirname(directoryPath);
    
    // Stop if we've reached the root directory
    if (parentPath === directoryPath) {
      return false;
    }
    
    // Recursively check parent directory
    return await checkIsGitRepository(parentPath);
  } catch (error) {
    return false;
  }
}

async function getGitInformation(directoryPath: string): Promise<string | null> {
  try {
    // Try to read git config to get basic repository information
    const gitConfigPath = path.join(directoryPath, '.git', 'config');
    const configResult = await codebolt.fs.readFile(gitConfigPath);
    
    if (configResult && configResult.success && configResult.result) {
      // Extract remote origin URL if available
      const configContent = configResult.result;
      const urlMatch = configContent.match(/url\s*=\s*(.+)/);
      const branchMatch = configContent.match(/\[branch\s+"([^"]+)"\]/);
      
      let info = 'Git Repository';
      
      if (urlMatch && urlMatch[1]) {
        const remoteUrl = urlMatch[1].trim();
        info += `\nRemote: ${remoteUrl}`;
      }
      
      if (branchMatch && branchMatch[1]) {
        info += `\nBranch: ${branchMatch[1]}`;
      }
      
      return info;
    }
    
    return 'Git Repository';
  } catch (error) {
    return 'Git Repository';
  }
}

function generateMarkdownGitCheck(
  content: string,
  isGitRepo: boolean,
  className?: string,
  speaker?: string
): Component {
  return createElement('div', { className, 'data-speaker': speaker }, content);
}

function generateHtmlGitCheck(
  content: string,
  isGitRepo: boolean,
  className?: string,
  speaker?: string
): Component {
  const escapedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return createElement('div', { className, 'data-speaker': speaker }, escapedContent);
}

function generateJsonGitCheck(
  content: string,
  isGitRepo: boolean,
  targetPath: string,
  className?: string,
  speaker?: string
): Component {
  const obj = {
    type: 'git_check',
    isGitRepository: isGitRepo,
    path: targetPath,
    content: content,
    timestamp: new Date().toISOString()
  };
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlGitCheck(
  content: string,
  isGitRepo: boolean,
  targetPath: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: git_check
isGitRepository: ${isGitRepo}
path: ${JSON.stringify(targetPath)}
content: ${JSON.stringify(content)}
timestamp: ${new Date().toISOString()}`;
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlGitCheck(
  content: string,
  isGitRepo: boolean,
  targetPath: string,
  className?: string,
  speaker?: string
): Component {
  const escapedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedPath = targetPath.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  
  const xml = `<git_check isGitRepository="${isGitRepo}" path="${escapedPath}" timestamp="${new Date().toISOString()}">${escapedContent}</git_check>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextGitCheck(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('div', { className, 'data-speaker': speaker }, content);
}
