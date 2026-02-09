/** Configuration for CodeBoltClient */
export interface CodeBoltClientConfig {
  /** Server hostname (default: 'localhost') */
  host: string;
  /** Server port (default: 12345) */
  port: number;
  /** Base path for HTTP API (default: '/api') */
  basePath: string;
  /** HTTP request timeout in ms (default: 30000) */
  httpTimeout: number;
  /** Auto-reconnect WebSocket on disconnect (default: true) */
  wsReconnect: boolean;
  /** Base interval between reconnection attempts in ms (default: 1000) */
  wsReconnectInterval: number;
  /** Max reconnection attempts (default: 10) */
  wsMaxReconnectAttempts: number;
  /** Enable debug logging (default: false) */
  debug: boolean;
}
