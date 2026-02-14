import { provider } from '.';
const requester = 'admin';
// 通訊協定清單查詢參數
export interface ProtocolListParams {
  type?: string;
  keyword?: string;
  pageNum?: string;
  limit?: string;
}

/**
 * {
                "id": "8751cd88-7d70-11f0-a291-5254008c2c02",
                "name": "testMqtt",
                "type": "MQTT",
                "gatewayId": "schideron_9cf3d171-75e4-3970-bce6-aebd1e7a21c7",
                "gatewayIp": "192.168.15.243",
                "subscribeType": "Gateway equipment",
                "mqttUser": "user",
                "mqttPW": "Sdr123",
                "mqttServerAddr": "175.178.239.216:1883",
                "pushStatus": "1",
                "enabled": false,
                "createTime": "2025-08-20 10:51:11",
                "pushTopic": "Dev/Report/23ny2phw34rw07tnczp5dme4m3677012",
                "receiveTopic": "Dev/Control/23ny2phw34rw07tnczp5dme4m3677012",
                "alarmTopic": "Dev/Alarm/23ny2phw34rw07tnczp5dme4m3677012",
                "topicList": [
                    "Dev/Report/23ny2phw34rw07tnczp5dme4m3677012",
                    "Dev/Control/23ny2phw34rw07tnczp5dme4m3677012",
                    "Dev/Alarm/23ny2phw34rw07tnczp5dme4m3677012"
                ]
            }
 */
// 通訊協定項目
export interface ProtocolItem {
  id: string;
  name: string;
  type: string;
  gatewayId: string;
  gatewayIp: string;
  enabled: boolean;
  createTime: string;
  subscribeType?: string;
  mqttUser?: string;
  mqttPW?: string;
  mqttServerAddr?: string;
  pushStatus?: string;
  pushTopic?: string;
  receiveTopic?: string;
  alarmTopic?: string;
  topicList?: string[];
}

// 分頁資訊
export interface PageInfo {
  total: number;
  pages: number;
  pageNum: number;
  pageSize: number;
  list: ProtocolItem[];
}

// 添加協定請求參數
export interface AddProtocolRequest {
  name: string;
  type: string;
  gatewayId: string;
  gatewayIp: string;
}

// 更新協定請求參數
export interface UpdateProtocolRequest {
  name: string;
  type: string;
  gatewayId: string;
  gatewayIp: string;
  subscribeType?: string;
  mqttUser?: string;
  mqttPW?: string;
  mqttServerAddr?: string;
  pushStatus?: string;
}

// API 回應格式
export interface ProtocolListResponse {
  pageInfo: PageInfo;
  code: number;
  status: string;
}

// 子設備項目
export interface DeviceItem {
  id: string;
  name: string;
  sn: string;
  alias: string;
  status: string | null;
}

// 子設備清單查詢參數
export interface DeviceListParams {
  protocolId?: string;
}

// 子設備清單回應格式
export interface DeviceListResponse {
  data: DeviceItem[];
  code: number;
  status: string;
}

// 通用 API 回應格式
export interface ApiResponse {
  code: number;
  status: string;
  message?: string;
}

/**
 * 取得通訊協定清單
 * @param params 查詢參數
 * @returns Promise<ProtocolListResponse>
 */
export const getProtocolList = async (params?: ProtocolListParams) =>
  provider.get('/schideron/openApi/protocol/list', {
    params: {
      ...params,
      requester: requester
    }
  });

/**
 * 添加通訊協定
 * @param data 協定資料
 * @returns Promise<ApiResponse>
 */
export const addProtocol = async (data: AddProtocolRequest) =>
  provider.post('/schideron/openApi/protocol/add', {
    ...data,
    requester: requester
  });

/**
 * 更新通訊協定
 * @param id 協定 ID
 * @param data 協定資料
 * @returns Promise<ApiResponse>
 */
export const updateProtocol = async (id: string, data: UpdateProtocolRequest) =>
  provider.put(`/schideron/openApi/protocol/edit/${id}`, {
    ...data,
    requester: requester
  });

/**
 * 取得子設備清單
 * @param params 查詢參數
 * @returns Promise<DeviceListResponse>
 */
export const getDeviceList = async (params?: DeviceListParams) =>
  provider.get('/schideron/openApi/protocol/device/list', {
    params: {
      protocolId: params?.protocolId || '8751cd88-7d70-11f0-a291-5254008c2c02',
      requester: requester
    }
  });
