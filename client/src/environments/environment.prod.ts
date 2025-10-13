declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: true,
  apiEndpoint: null,
  apiPort: null,
  serverEnabled: true,
  type: null,
  dmsApiEndpoint: 'https://fms-go.winshare.app',
  dmsToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YzQyOGQ4ODc1ZDI5NDg2MDdmM2UzZmUxMzRkNzFiNCIsImlhdCI6MTc1NzUyOTkyNiwiZXhwIjoxNzk0NzgyOTI2fQ.vfUgBPgsu2gW7NlVFZ-MzAdQuhTXoHZjd-IvZm1vvAM'
};
