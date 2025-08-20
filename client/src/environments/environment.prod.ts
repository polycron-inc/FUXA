declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: true,
  apiEndpoint: '/api',
  apiPort: null,
  serverEnabled: true,
  type: null
};
