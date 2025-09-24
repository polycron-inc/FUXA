declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: true,
  apiEndpoint: null,
  apiPort: null,
  serverEnabled: false,
  type: 'client',
  dmsApiEndpoint: 'http://101.35.85.65:8082',
  dmsToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YzQyOGQ4ODc1ZDI5NDg2MDdmM2UzZmUxMzRkNzFiNCIsImlhdCI6MTc1NzUwMDAzNCwiZXhwIjoxNzg5MDM2MDM0fQ.7oWfJpkum4eU3SrM9hJRNgbxT6LSnoPgZerBRHxQhbg'
};
