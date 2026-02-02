declare function require(moduleName: string): any;
export const environment = {
  version: require('../../package.json').version,
  production: false,
  apiEndpoint: 'http://localhost:1881',  // 明確指定後端地址
  apiPort: 1881,
  serverEnabled: true,
  type: null,
  dmsApiEndpoint: 'http://fms-backend.genman.work',
  dmsToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4NGFkZmU3ODBmZjc1YjIyMjgxYWU0MmEzODJhNjViNiIsImlhdCI6MTc2MzAxMjczMCwiZXhwIjoxNzk0NTQ4NzMwfQ.u3bM3ZrH-uPGCtB6vrFfbd1gkzc8Cdoa0cTMdChFVjE'
};