import { provider, requester } from '.';

// 角色資訊
export interface RoleInfo {
  id: string;
  roleName: string;
  description: string;
  permissionCount: number;
  userCount: number;
  createTime: string;
}

// 搜尋條件
export interface SearchCriteria {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 角色列表回應格式
export interface RoleListResponse {
  data: RoleInfo[];
  total: number;
  page: number;
  pageSize: number;
  code: number;
  status: string;
}

// 新增角色請求參數
export interface AddRolePayload {
  roleName: string;
  description: string;
}

// 更新角色請求參數
export interface UpdateRolePayload {
  id: string;
  roleName: string;
  description: string;
}

// 通用 API 回應格式
export interface ApiResponse {
  code: number;
  status: string;
  message?: string;
}

/**
 * 取得角色列表
 * @param payload 搜尋條件
 * @returns Promise<RoleListResponse>
 */
export const getRoles = async (payload?: SearchCriteria) =>
  provider.get('/schideron/openApi/role/list', {
    params: { ...payload, requester }
  });

/**
 * 新增角色
 * @param data 角色資料
 * @returns Promise<ApiResponse>
 */
export const addRole = async (data: AddRolePayload) =>
  provider.post('/schideron/openApi/role/add', {
    requester,
    ...data
  });

/**
 * 更新角色
 * @param data 角色資料
 * @returns Promise<ApiResponse>
 */
export const updateRole = async (data: UpdateRolePayload) =>
  provider.put('/schideron/openApi/role/edit', {
    requester,
    ...data
  });

/**
 * 刪除角色
 * @param id 角色 ID
 * @returns Promise<ApiResponse>
 */
export const deleteRole = async (id: string) =>
  provider.delete(`/schideron/openApi/role/delete/${id}`, {
    data: { requester }
  });
