const process = require('process/browser');

// Preserve the original process.env from the Node.js environment
const originalEnv = typeof global !== 'undefined' && global.process && global.process.env
    ? global.process.env
    : (typeof window !== 'undefined' && window.process && window.process.env
        ? window.process.env
        : {});

// Merge the original env with the browser polyfill
process.env = { ...originalEnv, ...process.env };

// Add the versions property that's missing in the browser polyfill.
// Uses computed keys because webpack's DefinePlugin replaces both dot and
// bracket member expressions for `process.versions`, which corrupts
// assignment targets into invalid syntax like `{"node": "..."} = ...`.
const versionsKey = 'versions';
const nodeVersionKey = 'node';
const existingVersions = process[versionsKey] || {};
if (!existingVersions[nodeVersionKey]) {
    existingVersions[nodeVersionKey] = '18.16.1'; // Default Node.js version
}
process[versionsKey] = existingVersions;

module.exports = process;
