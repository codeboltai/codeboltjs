import { Env } from './types';

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/proxy') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const id = env.PROXY_HUB.idFromName('global');
      const stub = env.PROXY_HUB.get(id);
      return stub.fetch(request);
    }

    return new Response('Codebolt Wrangler WS Proxy', { status: 200 });
  }
};

export default worker;
