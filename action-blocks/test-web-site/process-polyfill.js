const process = require('process');

if (!process.env) {
  process.env = {};
}

if (!process.versions) {
  process.versions = { node: '18.0.0' };
}

module.exports = process;
