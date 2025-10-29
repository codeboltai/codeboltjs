const process = require('process/browser');

// Add the versions property that's missing in the browser polyfill
process.versions = process.versions || {};
process.versions.node = process.versions.node || '18.16.1'; // Default Node.js version

module.exports = process; 