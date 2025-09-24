declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: false,
  apiEndpoint: 'http://localhost:1881',  // 明確指定後端地址
  apiPort: 1881,
  serverEnabled: true,
  type: null,
  dmsApiEndpoint: 'http://101.35.85.65:8082',
  dmsToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YzQyOGQ4ODc1ZDI5NDg2MDdmM2UzZmUxMzRkNzFiNCIsImlhdCI6MTc1NzUyOTkyNiwiZXhwIjoxNzk0NzgyOTI2fQ.vfUgBPgsu2gW7NlVFZ-MzAdQuhTXoHZjd-IvZm1vvAM'
};