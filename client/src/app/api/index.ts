import axios from 'axios';
import { environment } from '../../environments/environment';
// 取得環境變數
const secretKey = 'da6e6728-b51c-11ea-ac59-00ff7ae2c9c8'
export const requester = 'admin'
let userToken = environment.dmsToken;
export const baseUrl = environment.dmsApiEndpoint;

export const provider = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    secretKey
  }
});

// 建立一個方法來呼叫簽名 API
async function getSignData({ url, method, params, data }) {
  try {
    const _header = {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json;charset=utf-8',
      secretKey: secretKey
    };
    const response = await axios.post(
      `${baseUrl}/schideron/openApi/auth/sign`,
      {
        requester,
        url,
        method,
        params
      },
      {
        headers: _header
      }
    );
    // console.log('sign api response.data', response.data);
    if ([1005,1006].includes(response.data.code)) {
      console.log('sign api response.data.code === 1005');
      // 重新取得token
      throw new Error(response.data.message);
    }
    return response.data; // 預期返回 { sign, t }
  } catch (error) {
    console.error('Sign API error:', error);
    throw error;
  }
}
provider.interceptors.request.use(
  async (config) => {
    // token = await getAdminToken();
    // Query stringt 須排除
    const relativeUrl = config.url?.startsWith('http')
      ? new URL(config.url).pathname.split('?')[0]
      : config.url?.split('?')[0];

    // 收集目前 API 的參數
    const method = (config.method || 'GET').toUpperCase();
    let currentParams = { ...config.params };

    // 如果是 POST/PUT/PATCH，合併 body 的 JSON
    if (['POST', 'PUT', 'PATCH'].includes(method) && config.data) {
      try {
        const bodyData =
          typeof config.data === 'string'
            ? JSON.parse(config.data)
            : config.data;

        currentParams = {
          ...currentParams,
          ...bodyData
        };
      } catch (e) {
        console.warn('Failed to parse request body:', e);
      }
    }

    
    if(relativeUrl !== '/schideron/openApi/auth/login'){
      // 呼叫簽名 API
      const signData = await getSignData({
        url: relativeUrl,
        method,
        params: { ...currentParams, requester },
        data: config.data
      });

      // 將 sign 和 t 加入 header
      config.headers['sign'] = signData.sign;
      config.headers['t'] = signData.t;

      // console.log('relativeUrl', relativeUrl, userToken)
      config.headers['authorization'] = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          console.log('The page does not exist.');
          break;
        case 500:
          console.log('Server error.');
          break;
        case 401:
          console.log('Unauthorized');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        default:
          console.log(error.message);
      }
    }
    if (!window.navigator.onLine) {
      alert('The network error, please reload the page.');
      return;
    }
    return Promise.reject(error);
  }
);

provider.interceptors.response.use(
  (response) => {
    // const res = response.data;
    console.log('res', response.data.status);
    if (response.data.status !== 'SUCCESS') {
      return Promise.reject(new Error(response.data.message || 'Error'));
    } else {
      return response;
    }
  },
  (error) => {
    console.log('err' + error);
    if (error.response) {
      console.log(error.response.status);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);

    return Promise.reject(error);
  }
);
