import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';

interface UploadSandbox {
  files: { write(path: string, data: ArrayBuffer, options: { requestTimeoutMs: number }): Promise<unknown> };
  commands: {
    run(command: string, options: { timeoutMs: number; requestTimeoutMs: number }): Promise<{ stdout?: string }>;
  };
}

interface UploadOptions {
  /** Deadline for each chunk request, rather than for the entire archive. */
  requestTimeoutMs?: number;
  chunkBytes?: number;
  onProgress?: (uploadedBytes: number, totalBytes: number) => void;
}

const quote = (value: string): string => `'${value.replace(/'/g, `'\\''`)}'`;

/** Upload bounded binary chunks, then publish the verified file atomically. */
export async function uploadFileToSandbox(
  sandbox: UploadSandbox,
  localPath: string,
  remotePath: string,
  options: UploadOptions = {},
): Promise<string> {
  const chunkBytes = options.chunkBytes ?? 4 * 1024 * 1024;
  if (!Number.isSafeInteger(chunkBytes) || chunkBytes <= 0) throw new Error('Invalid upload chunk size');
  const configuredTimeout = Number(options.requestTimeoutMs);
  const requestTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 120_000;
  const commandOptions = { timeoutMs: requestTimeoutMs, requestTimeoutMs };
  const partial = `${remotePath}.${randomUUID()}.upload`;
  const part = `${partial}.part`;
  const file = await fs.open(localPath, 'r');
  let uploaded = 0;
  let total = 0;
  try {
    total = (await file.stat()).size;
    const buffer = Buffer.allocUnsafe(Math.min(chunkBytes, Math.max(total, 1)));
    options.onProgress?.(0, total);
    await sandbox.commands.run(`: > ${quote(partial)}`, commandOptions);
    while (uploaded < total) {
      const { bytesRead } = await file.read(buffer, 0, Math.min(buffer.length, total - uploaded), uploaded);
      if (!bytesRead) throw new Error('Local archive was truncated during upload');
      // The SDK accepts ArrayBuffer. Copy only this chunk, never base64-encode
      // or load the full archive into memory.
      const data = new Uint8Array(buffer.subarray(0, bytesRead)).buffer;
      await sandbox.files.write(part, data, { requestTimeoutMs });
      await sandbox.commands.run(`cat -- ${quote(part)} >> ${quote(partial)}`, commandOptions);
      uploaded += bytesRead;
      options.onProgress?.(uploaded, total);
    }
    const result = await sandbox.commands.run(`wc -c < ${quote(partial)}`, commandOptions);
    const remoteSize = String(result.stdout || '').trim();
    if (!/^\d+$/.test(remoteSize) || Number(remoteSize) !== total) {
      throw new Error(`Uploaded size mismatch: expected ${total} bytes, received ${remoteSize || 'unknown'}`);
    }
    await sandbox.commands.run(`mv -- ${quote(partial)} ${quote(remotePath)}`, commandOptions);
    return remotePath;
  } catch (error: any) {
    throw new Error(`File upload failed after ${uploaded}/${total} bytes: ${error?.message || error}`, { cause: error });
  } finally {
    await file.close();
    // Only remove this attempt's temporary files; preserve an existing target
    // if a transfer fails before the atomic rename.
    try {
      await sandbox.commands.run(`rm -f -- ${quote(part)} ${quote(partial)}`, commandOptions);
    } catch { /* Cleanup must not mask the transfer result. */ }
  }
}
