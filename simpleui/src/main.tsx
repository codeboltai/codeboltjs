import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Get configuration from server if injected, otherwise use defaults
const serverConfig = (window as any).__SERVER_CONFIG__ || {};
const backendUrl = import.meta.env.VITE_BACKEND_URL || serverConfig.apiUrl || window.location.origin;

const socketPort = (() => {
  try {
    return new URL(backendUrl).port || '12345';
  } catch {
    return '12345';
  }
})();

(window as any).env = {
  backendUrl,
  socketPort,
  socketPaths: serverConfig.socketPaths || {
    chat: '/chat',
    tasks: '/tasks-socket',
    swarm: '/swarm',
    orchestrator: '/orchestrator-ws',
  },
};

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
