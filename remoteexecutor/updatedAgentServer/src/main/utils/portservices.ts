import { logger } from "@/main/utils/logger";
import { createServer as createNetServer, AddressInfo } from 'net';
import { SAFE_PORT_MIN, SAFE_PORT_MAX, MAX_PORT_ATTEMPTS } from '@/const';

export async function isPortAvailable(port: number, host: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const tester = createNetServer()
            .once('error', (error: NodeJS.ErrnoException) => {
                if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
                    resolve(false);
                } else {
                    reject(error);
                }
            })
            .once('listening', () => {
                tester.close(() => resolve(true));
            });

        tester.listen(port, host);
    });
}

export async function findAvailablePort(host?: string): Promise<number> {
    const bindHost = host ?? '127.0.0.1';

    for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
        const candidate = Math.floor(Math.random() * (SAFE_PORT_MAX - SAFE_PORT_MIN + 1)) + SAFE_PORT_MIN;

        try {
            const available = await isPortAvailable(candidate, bindHost);
            if (available) {
                return candidate;
            }
        } catch (error) {
            logger.debug('Port availability check failed', {
                error: error instanceof Error ? error.message : error,
                port: candidate
            });
        }
    }

    return new Promise((resolve, reject) => {
        const fallbackServer = createNetServer();

        fallbackServer.once('error', reject);
        fallbackServer.listen(0, bindHost, () => {
            const address = fallbackServer.address() as AddressInfo;
            fallbackServer.close(() => resolve(address.port));
        });
    });
}