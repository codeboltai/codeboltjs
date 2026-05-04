import { wsManager } from './WebSocketManager';
import { chatSocket } from './chatSocket';
import { tasksSocket } from './tasksSocket';
import { swarmSocket } from './swarmSocket';
import { eventSocket } from './eventSocket';

export { wsManager, chatSocket, tasksSocket, swarmSocket, eventSocket };

export const initializeSockets = () => {
  chatSocket.connect();
  tasksSocket.connect();
  swarmSocket.connect();
  eventSocket.connect();
};

export const disconnectSockets = () => {
  chatSocket.disconnect();
  tasksSocket.disconnect();
  swarmSocket.disconnect();
  eventSocket.disconnect();
  wsManager.disconnectAll();
};
