const process = require('process/browser');

// Preserve the original process.env from the Node.js environment
const originalEnv = typeof global !== 'undefined' && global.process && global.process.env
    ? global.process.env
    : (typeof window !== 'undefined' && window.process && window.process.env
        ? window.process.env
        : {});

// Merge the original env with the browser polyfill
process.env = { ...originalEnv, ...process.env };

// Add the versions property that's missing in the browser polyfill
process.versions = process.versions || {};
process.versions.node = process.versions.node || '18.16.1';

module.exports = process;
