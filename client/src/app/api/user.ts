import { provider, requester } from '.';

// 使用者項目
export interface UserItem {
  id: string;
  username: string;
  roleId: string;
  roleName: string;
  phone: string;
  email: string;
  createTime: string;
  status?: number;
}

// 使用者列表查詢參數
export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
}

// 使用者列表回應格式
export interface UserListResponse {
  data: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 使用者詳細資訊回應格式
export interface UserDetailResponse {
  detailInfo: UserItem;
  code: number;
  status: string;
}

// 新增使用者請求參數
export interface AddUserRequest {
  username: string;
  password: string;
  roleId: string;
  phone?: string;
  email?: string;
}

// 編輯使用者請求參數
export interface EditUserRequest {
  username?: string;
  roleId?: string;
  phone?: string;
  email?: string;
}

// 重設密碼請求參數
export interface ResetPasswordRequest {
  defaultPassword: string;
}

// 通用 API 回應格式
export interface ApiResponse {
  code: number;
  status: string;
  message?: string;
}

// 使用者選項 (用於下拉選單)
export interface UserSelectOption {
  id: string;
  user_name: string;
  org_id?: number;
}

/**
 * 取得使用者列表
 * @param params 查詢參數
 * @returns Promise<UserListResponse>
 */
export const getUserList = async (params?: UserListParams) => {
  return provider.get('/schideron/openApi/user/list', {
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      username: params?.username || '',
      requester
    }
  });
};

/**
 * 取得目前登入使用者資訊
 * @returns Promise<UserDetailResponse>
 */
export const getCurrentUser = async () => {
  return provider.get('/schideron/openApi/user/me', {
    params: { requester }
  });
};

/**
 * 取得使用者詳細資訊
 * @param userId 使用者 ID
 * @returns Promise<UserDetailResponse>
 */
export const getUserDetail = async (userId: string) => {
  return provider.get(`/schideron/openApi/user/detail/${userId}`, {
    params: { requester }
  });
};

/**
 * 新增使用者
 * @param data 使用者資料
 * @returns Promise<ApiResponse>
 */
export const addUser = async (data: AddUserRequest) => {
  return provider.post('/schideron/openApi/user/add', {
    ...data,
    requester
  });
};

/**
 * 編輯使用者
 * @param userId 使用者 ID
 * @param data 使用者資料
 * @returns Promise<ApiResponse>
 */
export const editUser = async (userId: string, data: EditUserRequest) => {
  return provider.put(`/schideron/openApi/user/edit/${userId}`, {
    ...data,
    requester
  });
};

/**
 * 刪除使用者
 * @param userId 使用者 ID
 * @returns Promise<ApiResponse>
 */
export const deleteUser = async (userId: string) => {
  return provider.delete(`/schideron/openApi/user/delete/${userId}`, {
    data: { requester }
  });
};

/**
 * 重設使用者密碼
 * @param userId 使用者 ID
 * @param defaultPassword 新密碼 (已加密)
 * @returns Promise<ApiResponse>
 */
export const resetPassword = async (userId: string, defaultPassword: string) => {
  return provider.post(`/schideron/openApi/user/resetPassword/${userId}`, {
    defaultPassword,
    requester
  });
};

/**
 * 取得使用者選項列表 (用於下拉選單)
 * @param params 查詢參數
 * @returns Promise<UserSelectOption[]>
 */
export const getUserSelectOptions = async (params?: {
  opR?: number;
  rIds?: string;
  opO?: number;
  oIds?: string;
}) => {
  return provider.get('/api/users/getUserSelectOptions', {
    params: {
      ...params,
      requester
    }
  });
};
