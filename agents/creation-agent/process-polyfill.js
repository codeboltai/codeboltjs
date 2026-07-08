const process = require('process/browser');

const originalEnv = typeof global !== 'undefined' && global.process && global.process.env
  ? global.process.env
  : (typeof window !== 'undefined' && window.process && window.process.env
    ? window.process.env
    : {});

process.env = { ...originalEnv, ...process.env };
process.versions = process.versions || {};
process.versions.node = process.versions.node || '20.18.3';

module.exports = process;
