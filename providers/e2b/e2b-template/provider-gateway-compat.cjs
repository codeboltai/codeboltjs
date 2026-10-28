// Keep providerId connections on the provider transport when the published CLI
// mounts the generic external SDK on /direct-execution-gateway.
const fs = require('node:fs');

function patchProviderGateway(source) {
  const map = 'directExecutionGateway: externalGatewayLib_1.externalSocket,';
  const route = "if (url.includes('/direct-execution-gateway'))\n        return 'directExecutionGateway';";
  const patchedMap = `${map}\n    providerExecutionGateway: pluginLib_1.legacyDirectProviderGateway,`;
  const patchedRoute = "if (url.includes('/direct-execution-gateway'))\n        return new URL(url, 'http://localhost').searchParams.get('providerId') ? 'providerExecutionGateway' : 'directExecutionGateway';";
  if (source.includes(patchedMap) && source.includes(patchedRoute)) return source;
  for (const marker of [map, route]) {
    if (source.split(marker).length !== 2) throw new Error('CLI gateway layout changed; review provider compatibility before building');
  }
  if (!source.includes('legacyDirectProviderGateway')) throw new Error('CLI has no provider gateway implementation');
  return source.replace(map, patchedMap).replace(route, patchedRoute);
}

if (require.main === module) {
  const filename = process.argv[2];
  if (!filename) throw new Error('Expected CLI bundle path');
  const original = fs.readFileSync(filename, 'utf8');
  const patched = patchProviderGateway(original);
  if (patched !== original) fs.writeFileSync(filename, patched);
  console.log('Verified provider gateway compatibility');
}

module.exports = { patchProviderGateway };
