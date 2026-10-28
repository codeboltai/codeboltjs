const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const ts = require('typescript');

async function load() {
  const filename = process.env.E2B_UPLOAD_SOURCE_PATH || path.join(__dirname, '../src/utils/uploadFile.ts');
  const output = ts.transpileModule(await fs.readFile(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  mod._compile(output, filename);
  return mod.exports.uploadFileToSandbox;
}

async function fixture(t, bytes) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'e2b-upload-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const local = path.join(directory, 'source.tar.gz');
  const remote = path.join(directory, "target with 'quotes'.tar.gz");
  await fs.writeFile(local, bytes);
  const writes = [];
  const commands = [];
  const sandbox = {
    files: { write: async (filename, data, options) => {
      assert.ok(data instanceof ArrayBuffer);
      writes.push({ bytes: data.byteLength, options });
      await fs.writeFile(filename, Buffer.from(data));
    } },
    commands: { run: async (command, options) => {
      commands.push(command);
      assert.ok(options.timeoutMs > 0 && options.requestTimeoutMs > 0);
      return run('/bin/sh', ['-c', command]);
    } },
  };
  return { directory, local, remote, writes, commands, sandbox };
}

test('uploads exact binary bytes in bounded chunks and reports acknowledged progress', async t => {
  const bytes = Buffer.from(Array.from({ length: 515 }, (_, index) => index % 256));
  const f = await fixture(t, bytes);
  const upload = await load();
  const progress = [];
  const result = await upload(f.sandbox, f.local, f.remote, {
    chunkBytes: 64, requestTimeoutMs: 3210, onProgress: (done, total) => progress.push([done, total]),
  });
  assert.equal(result, f.remote);
  assert.deepEqual(await fs.readFile(f.remote), bytes);
  assert.equal(f.writes.length, 9);
  assert.ok(f.writes.every(write => write.bytes <= 64 && write.options.requestTimeoutMs === 3210));
  assert.deepEqual(progress.at(-1), [bytes.length, bytes.length]);
  assert.ok(!f.commands.some(command => command.includes('base64')));
  assert.deepEqual((await fs.readdir(f.directory)).sort(), [path.basename(f.local), path.basename(f.remote)].sort());
});

test('keeps the original destination and cleans up when a chunk fails', async t => {
  const f = await fixture(t, Buffer.alloc(200, 17));
  await fs.writeFile(f.remote, 'previous target');
  const write = f.sandbox.files.write;
  let calls = 0;
  f.sandbox.files.write = async (...args) => {
    if (++calls === 2) throw new Error('The operation was aborted due to timeout');
    return write(...args);
  };
  const upload = await load();
  await assert.rejects(upload(f.sandbox, f.local, f.remote, { chunkBytes: 64 }), /File upload failed after 64\/200 bytes.*timeout/);
  assert.equal(await fs.readFile(f.remote, 'utf8'), 'previous target');
  assert.ok(!(await fs.readdir(f.directory)).some(name => name.endsWith('.upload') || name.endsWith('.part')));
});

test('refuses to publish a transfer whose remote size is wrong', async t => {
  const f = await fixture(t, Buffer.from('archive'));
  const command = f.sandbox.commands.run;
  f.sandbox.commands.run = async (...args) => args[0].startsWith('wc -c') ? { stdout: '1' } : command(...args);
  const upload = await load();
  await assert.rejects(upload(f.sandbox, f.local, f.remote), /Uploaded size mismatch/);
  await assert.rejects(fs.access(f.remote));
});

test('publishes empty files and does not mask success if temporary cleanup fails', async t => {
  const f = await fixture(t, Buffer.alloc(0));
  const command = f.sandbox.commands.run;
  f.sandbox.commands.run = async (...args) => {
    if (args[0].startsWith('rm -f')) throw new Error('cleanup unavailable');
    return command(...args);
  };
  const upload = await load();
  assert.equal(await upload(f.sandbox, f.local, f.remote), f.remote);
  assert.equal((await fs.stat(f.remote)).size, 0);
  assert.equal(f.writes.length, 0);
});
