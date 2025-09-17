import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import * as os from 'os';

export interface OSInformationProps extends BaseComponentProps {
  /** Show operating system name (e.g., "Windows", "Darwin", "Linux") */
  os?: boolean;
  /** Show operating system version */
  osVersion?: boolean;
  /** Show operating system release */
  osRelease?: boolean;
  /** Show system architecture (e.g., "x64", "arm64") */
  arch?: boolean;
  /** Show system platform (e.g., "win32", "darwin", "linux") */
  platform?: boolean;
  /** Show hostname */
  hostname?: boolean;
  /** Show CPU information */
  cpu?: boolean;
  /** Show total memory */
  memory?: boolean;
  /** Show uptime */
  uptime?: boolean;
  /** Show home directory */
  homeDir?: boolean;
  /** Show temporary directory */
  tmpDir?: boolean;
  /** Show network interfaces */
  network?: boolean;
  /** Custom separator between information items */
  separator?: string;
  /** Format style */
  format?: 'simple' | 'detailed' | 'json' | 'list';
  /** Show all available information */
  all?: boolean;
}

export function OSInformation(props: OSInformationProps): Component {
  const {
    os: showOS = false,
    osVersion = false,
    osRelease = false,
    arch = false,
    platform = false,
    hostname = false,
    cpu = false,
    memory = false,
    uptime = false,
    homeDir = false,
    tmpDir = false,
    network = false,
    separator = ', ',
    format = 'markdown',
    all = false,
    syntax = 'text',
    className,
    speaker,
    children = []
  } = props;

  try {
    // Collect system information
    const systemInfo = collectSystemInformation({
      showOS: all || showOS,
      osVersion: all || osVersion,
      osRelease: all || osRelease,
      arch: all || arch,
      platform: all || platform,
      hostname: all || hostname,
      cpu: all || cpu,
      memory: all || memory,
      uptime: all || uptime,
      homeDir: all || homeDir,
      tmpDir: all || tmpDir,
      network: all || network
    });

    // Format the output
    const formattedOutput = formatSystemInfo(systemInfo, format, separator);

    // Generate the component based on syntax
    switch (syntax) {
      case 'markdown':
        return generateMarkdownOS(formattedOutput, className, speaker);
      
      case 'html':
        return generateHtmlOS(formattedOutput, className, speaker);
      
      case 'json':
        return generateJsonOS(systemInfo, className, speaker);
      
      case 'yaml':
        return generateYamlOS(systemInfo, className, speaker);
      
      case 'xml':
        return generateXmlOS(systemInfo, className, speaker);
      
      case 'text':
      default:
        return generatePlainOS(formattedOutput, className, speaker);
    }
  } catch (error) {
    const errorMessage = `Error getting OS information: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return createElement('span', { className, 'data-speaker': speaker }, errorMessage);
  }
}

interface SystemInfoOptions {
  showOS: boolean;
  osVersion: boolean;
  osRelease: boolean;
  arch: boolean;
  platform: boolean;
  hostname: boolean;
  cpu: boolean;
  memory: boolean;
  uptime: boolean;
  homeDir: boolean;
  tmpDir: boolean;
  network: boolean;
}

interface SystemInfo {
  os?: string;
  osVersion?: string;
  osRelease?: string;
  arch?: string;
  platform?: string;
  hostname?: string;
  cpu?: string;
  memory?: string;
  uptime?: string;
  homeDir?: string;
  tmpDir?: string;
  network?: string;
}

function collectSystemInformation(options: SystemInfoOptions): SystemInfo {
  const info: SystemInfo = {};

  if (options.showOS) {
    info.os = getOSName();
  }

  if (options.osVersion) {
    info.osVersion = os.release();
  }

  if (options.osRelease) {
    info.osRelease = os.version();
  }

  if (options.arch) {
    info.arch = os.arch();
  }

  if (options.platform) {
    info.platform = os.platform();
  }

  if (options.hostname) {
    info.hostname = os.hostname();
  }

  if (options.cpu) {
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      info.cpu = `${cpus[0].model} (${cpus.length} cores)`;
    }
  }

  if (options.memory) {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    info.memory = `${formatBytes(usedMem)}/${formatBytes(totalMem)} used`;
  }

  if (options.uptime) {
    const uptimeSeconds = os.uptime();
    info.uptime = formatUptime(uptimeSeconds);
  }

  if (options.homeDir) {
    info.homeDir = os.homedir();
  }

  if (options.tmpDir) {
    info.tmpDir = os.tmpdir();
  }

  if (options.network) {
    const networkInterfaces = os.networkInterfaces();
    const interfaces = Object.keys(networkInterfaces).filter(name => 
      networkInterfaces[name]?.some(iface => !iface.internal)
    );
    info.network = interfaces.join(', ') || 'No external interfaces';
  }

  return info;
}

function getOSName(): string {
  const platform = os.platform();
  switch (platform) {
    case 'darwin':
      return 'macOS';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'freebsd':
      return 'FreeBSD';
    case 'openbsd':
      return 'OpenBSD';
    case 'sunos':
      return 'SunOS';
    case 'aix':
      return 'AIX';
    default:
      return platform;
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}

function formatSystemInfo(info: SystemInfo, format: string, separator: string): string {
  const entries = Object.entries(info).filter(([_, value]) => value !== undefined);

  switch (format) {
    case 'detailed':
      return entries.map(([key, value]) => `${formatKey(key)}: ${value}`).join('\n');
    
    case 'list':
      return entries.map(([key, value]) => `• ${formatKey(key)}: ${value}`).join('\n');
    
    case 'simple':
    default:
      return entries.map(([_, value]) => value).join(separator);
  }
}

function formatKey(key: string): string {
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Os/g, 'OS')
    .replace(/Cpu/g, 'CPU');
}

function generateMarkdownOS(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateHtmlOS(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateJsonOS(
  systemInfo: SystemInfo,
  className?: string,
  speaker?: string
): Component {
  const obj = {
    type: 'os_information',
    timestamp: new Date().toISOString(),
    system: systemInfo
  };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlOS(
  systemInfo: SystemInfo,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: os_information
timestamp: ${new Date().toISOString()}
system:
${Object.entries(systemInfo)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
  .join('\n')}`;
  
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlOS(
  systemInfo: SystemInfo,
  className?: string,
  speaker?: string
): Component {
  const systemEntries = Object.entries(systemInfo)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `<${key}>${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${key}>`)
    .join('');
    
  const xml = `<os_information timestamp="${new Date().toISOString()}">${systemEntries}</os_information>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generatePlainOS(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}
