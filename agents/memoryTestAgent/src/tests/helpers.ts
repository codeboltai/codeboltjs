import codebolt from '@codebolt/codeboltjs';
import * as fs from 'fs';
import * as path from 'path';

export let passed = 0;
export let failed = 0;
export let skipped = 0;

const logBuffer: string[] = [];

export function resetCounters() {
    passed = 0;
    failed = 0;
    skipped = 0;
    logBuffer.length = 0;
}

export async function log(msg: string) {
    logBuffer.push(msg);
    await codebolt.chat.sendMessage(msg);
}

export function ok(val: boolean | undefined | null): boolean {
    return val === true;
}

export async function assert(condition: boolean | undefined | null, label: string, detail?: string) {
    if (condition) {
        passed++;
        await log(`  ✅ ${label}`);
    } else {
        failed++;
        await log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    }
}

export function skip() {
    skipped++;
}

export function saveLogsToFile() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logDir = path.resolve(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const summary = [
            '',
            '══════════════════════════════════════',
            `  SUMMARY`,
            `  Passed:   ${passed}`,
            `  Failed:   ${failed}`,
            `  Skipped:  ${skipped}`,
            `  Total:    ${passed + failed + skipped}`,
            `  Time:     ${timestamp}`,
            '══════════════════════════════════════',
        ];

        const content = [...logBuffer, ...summary].join('\n');

        const latestPath = path.join(logDir, 'test-results-latest.log');
        const archivePath = path.join(logDir, `test-results-${timestamp}.log`);

        fs.writeFileSync(latestPath, content, 'utf-8');
        fs.writeFileSync(archivePath, content, 'utf-8');

        return { latestPath, archivePath };
    } catch (err) {
        return { error: String(err) };
    }
}
