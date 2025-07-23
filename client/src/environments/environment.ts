declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: false,
  apiEndpoint: 'http://localhost:1881',  // 明確指定後端地址
  apiPort: 1881,
  serverEnabled: true,
  type: null
};