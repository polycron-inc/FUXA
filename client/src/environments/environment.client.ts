declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: true,
  apiEndpoint: null,
  apiPort: null,
  serverEnabled: false,
  type: 'client',
  dmsApiEndpoint: 'http://fms-backend.genman.work',
  dmsToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4NGFkZmU3ODBmZjc1YjIyMjgxYWU0MmEzODJhNjViNiIsImlhdCI6MTc2MzAxMjczMCwiZXhwIjoxNzk0NTQ4NzMwfQ.u3bM3ZrH-uPGCtB6vrFfbd1gkzc8Cdoa0cTMdChFVjE'
};
