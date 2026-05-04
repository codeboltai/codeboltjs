import { CodeBoltClient } from '@codebolt/client-sdk';

export interface GlobalOptions {
  port: string;
  host: string;
  json?: boolean;
  debug?: boolean;
  timeout: string;
}

export function createClient(opts: GlobalOptions): CodeBoltClient {
  return new CodeBoltClient({
    host: opts.host,
    port: parseInt(opts.port, 10),
    debug: opts.debug || false,
    httpTimeout: parseInt(opts.timeout, 10),
    autoConnect: false,
  });
}
