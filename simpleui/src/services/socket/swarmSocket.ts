import { Socket } from 'socket.io-client';
import wsManager from './WebSocketManager';
import { useAgentsStore } from '@/stores';
import type { Agent } from '@/types';

type SwarmEventCallback = (data: unknown) => void;

class SwarmSocket {
  private socket: Socket | null = null;
  private eventListeners: Map<string, SwarmEventCallback[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = wsManager.connect('swarm');

    this.socket.on('connect', () => {
      console.log('[SwarmSocket] Connected');
      this.requestSwarmStatus();
    });

    this.socket.on('agent_status', (data: any) => {
      this.handleAgentStatus(data);
    });

    this.socket.on('agent_registered', (data: any) => {
      this.handleAgentRegistered(data);
    });

    this.socket.on('agent_unregistered', (data: any) => {
      this.handleAgentUnregistered(data);
    });

    this.socket.on('agent_heartbeat', (data: any) => {
      this.handleAgentHeartbeat(data);
    });

    this.socket.on('swarm_status', (data: any) => {
      this.handleSwarmStatus(data);
    });

    this.socket.on('delegation', (data: any) => {
      this.handleDelegation(data);
    });

    this.socket.on('coordination', (data: any) => {
      this.handleCoordination(data);
    });

    this.socket.on('error', (data: any) => {
      console.error('[SwarmSocket] Error:', data);
      this.emit('error', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private mapServerAgent(serverAgent: any): Agent {
    return {
      id: serverAgent.id || serverAgent.agentId,
      name: serverAgent.name || serverAgent.agentName || serverAgent.id,
      role: serverAgent.role || serverAgent.description || 'Agent',
      status: this.mapAgentStatus(serverAgent.status),
      currentTask: serverAgent.currentTask,
      model: serverAgent.model || 'claude-sonnet-4.5',
      tasksCompleted: serverAgent.tasksCompleted || serverAgent.stats?.tasksCompleted || 0,
      lastHeartbeat: serverAgent.lastHeartbeat || new Date().toISOString(),
      uptime: serverAgent.uptime || '0h',
      capabilities: serverAgent.capabilities || serverAgent.skills || [],
    };
  }

  private mapAgentStatus(status?: string): Agent['status'] {
    if (!status) return 'offline';
    const statusMap: Record<string, Agent['status']> = {
      'working': 'working',
      'running': 'working',
      'busy': 'working',
      'idle': 'idle',
      'ready': 'idle',
      'error': 'error',
      'failed': 'error',
      'offline': 'offline',
      'stopped': 'offline',
    };
    return statusMap[status.toLowerCase()] || 'offline';
  }

  private handleAgentStatus(data: any): void {
    const agent = this.mapServerAgent(data);
    useAgentsStore.getState().updateAgent(agent.id, agent);
    this.emit('agent_status', agent);
  }

  private handleAgentRegistered(data: any): void {
    const agent = this.mapServerAgent(data);
    useAgentsStore.getState().addAgent(agent);
    this.emit('agent_registered', agent);
  }

  private handleAgentUnregistered(data: any): void {
    useAgentsStore.getState().removeAgent(data.agentId || data.id);
    this.emit('agent_unregistered', data);
  }

  private handleAgentHeartbeat(data: any): void {
    const agentId = data.agentId || data.id;
    useAgentsStore.getState().updateAgent(agentId, {
      lastHeartbeat: new Date().toISOString(),
    });
    this.emit('agent_heartbeat', data);
  }

  private handleSwarmStatus(data: any): void {
    if (data.agents) {
      const agents = data.agents.map(this.mapServerAgent.bind(this));
      useAgentsStore.getState().setAgents(agents);
    }
    this.emit('swarm_status', data);
  }

  private handleDelegation(data: any): void {
    this.emit('delegation', data);
  }

  private handleCoordination(data: any): void {
    this.emit('coordination', data);
  }

  requestSwarmStatus(): void {
    if (this.socket?.connected) {
      this.socket.emit('get_status');
    }
  }

  updateAgentStatus(agentId: string, status: Agent['status']): void {
    if (this.socket?.connected) {
      this.socket.emit('update_status', { agentId, status });
    }
  }

  delegateTask(fromAgentId: string, toAgentId: string, task: string): void {
    if (this.socket?.connected) {
      this.socket.emit('delegate', {
        fromAgentId,
        toAgentId,
        task
      });
    }
  }

  broadcastMessage(message: string, excludeAgentIds?: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit('broadcast', {
        message,
        excludeAgents: excludeAgentIds
      });
    }
  }

  on(event: string, callback: SwarmEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: SwarmEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }
}

export const swarmSocket = new SwarmSocket();
export default swarmSocket;
