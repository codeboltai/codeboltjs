import Docker from 'dockerode';
import { DockerManagerConfig } from '../config';

/**
 * Container information interface
 */
export interface ContainerInfo {
  id: string;
  name: string;
  status: string;
  image: string;
  ports: { [key: string]: string };
  created: Date;
  health?: string;
}

/**
 * Simple Docker Manager for container operations
 */
export class DockerManager {
  private docker: Docker;
  private config: DockerManagerConfig;
  private container?: Docker.Container;

  constructor(config: DockerManagerConfig) {
    this.config = config;
    this.docker = new Docker({ host: 'tcp://100.90.91.1:2375' });
    console.log('[DockerManager] Initialized');
  }

  /**
   * Create and start container
   */
  public async createAndStartContainer(): Promise<ContainerInfo> {
    console.log('[DockerManager] Creating container...');
    
    try {
      // Create network if needed
      await this.ensureNetwork();
      
      // Pull image
      await this.pullImage();
      
      // Remove existing container if exists
      await this.removeExistingContainer();
      
      // Create container
      const dockerConfig = this.config.docker;
      this.container = await this.docker.createContainer({
        Image: dockerConfig.image,
        name: dockerConfig.containerName || 'codebolt-dockerserver',
        Env: Object.entries(dockerConfig.environment || {}).map(([key, value]) => `${key}=${value}`),
        ExposedPorts: { '3001/tcp': {} },
        HostConfig: {
          PortBindings: { '3001/tcp': [{ HostPort: '3001' }] },
          RestartPolicy: { Name: 'unless-stopped' },
          NetworkMode: dockerConfig.networkName || 'codebolt-network'
        },
        Healthcheck: {
          Test: ['CMD', 'curl', '-f', 'http://localhost:3001/health'],
          Interval: 30000000000, // 30 seconds in nanoseconds
          Timeout: 3000000000,   // 3 seconds in nanoseconds
          Retries: 3
        }
      });
      
      // Start container
      await this.container.start();
      console.log('[DockerManager] Container started');
      
      // Get container info
      const info = await this.getContainerInfo();
      if (!info) {
        throw new Error('Failed to get container info');
      }
      
      return info;
      
    } catch (error) {
      console.error('[DockerManager] Failed to create container:', error);
      throw error;
    }
  }

  /**
   * Get container information
   */
  public async getContainerInfo(): Promise<ContainerInfo | null> {
    if (!this.container) {
      return null;
    }
    
    try {
      const data = await this.container.inspect();
      const ports: { [key: string]: string } = {};
      
      if (data.NetworkSettings.Ports) {
        for (const [containerPort, hostPorts] of Object.entries(data.NetworkSettings.Ports)) {
          if (hostPorts && hostPorts.length > 0) {
            ports[containerPort] = hostPorts[0].HostPort || '';
          }
        }
      }
      
      return {
        id: data.Id,
        name: data.Name.replace('/', ''),
        status: data.State.Status,
        image: data.Config.Image,
        ports,
        created: new Date(data.Created),
        health: data.State.Health?.Status || 'none'
      };
      
    } catch (error) {
      console.error('[DockerManager] Failed to get container info:', error);
      return null;
    }
  }

  /**
   * Check if container is healthy
   */
  public async isContainerHealthy(): Promise<boolean> {
    const info = await this.getContainerInfo();
    return info?.status === 'running' && (info?.health === 'healthy' || info?.health === 'none');
  }

  /**
   * Stop and remove container
   */
  public async stopAndRemoveContainer(): Promise<void> {
    if (!this.container) {
      return;
    }
    
    try {
      console.log('[DockerManager] Stopping container...');
      await this.container.stop({ t: 10 });
      await this.container.remove({ force: true });
      this.container = undefined;
      console.log('[DockerManager] Container stopped and removed');
    } catch (error) {
      console.error('[DockerManager] Error stopping container:', error);
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.stopAndRemoveContainer();
  }

  /**
   * Ensure network exists
   */
  private async ensureNetwork(): Promise<void> {
    const networkName = this.config.docker.networkName || 'codebolt-network';
    
    try {
      const networks = await this.docker.listNetworks({
        filters: { name: [networkName] }
      });
      
      if (networks.length === 0) {
        console.log(`[DockerManager] Creating network: ${networkName}`);
        await this.docker.createNetwork({
          Name: networkName,
          Driver: 'bridge'
        });
      }
    } catch (error) {
      console.error('[DockerManager] Network error:', error);
    }
  }

  /**
   * Pull Docker image
   */
  private async pullImage(): Promise<void> {
    const imageName = this.config.docker.image;
    
    try {
      console.log(`[DockerManager] Pulling image: ${imageName}`);
      const stream = await this.docker.pull(imageName);
      
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
      
      console.log('[DockerManager] Image pulled successfully');
    } catch (error) {
      console.error('[DockerManager] Failed to pull image:', error);
      throw error;
    }
  }

  /**
   * Remove existing container with same name
   */
  private async removeExistingContainer(): Promise<void> {
    const containerName = this.config.docker.containerName || 'codebolt-dockerserver';
    
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: { name: [containerName] }
      });
      
      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);
        if (containerInfo.State === 'running') {
          await container.stop({ t: 5 });
        }
        await container.remove({ force: true });
        console.log(`[DockerManager] Removed existing container: ${containerName}`);
      }
    } catch (error) {
      // Ignore errors when removing non-existent containers
    }
  }
}