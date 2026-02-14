import { provider, requester } from '.';

export interface UpdatePasswordRequest {
  id: string;
  newPassword: string;
}

export interface UpdateStatusRequest {
  id: number;
  status: number;
}

export interface QuerySelectOptionRequest {
  opR: number; // role_id 判定: 1=大於, 2=小於, 3=等於, 4=in, 84=不檢查role_id, 其他=不查資料
  rIds: number[];
  opO: number; // org_id 判定: 1=大於, 2=小於, 3=等於, 4=in, 84=不檢查org_id, 其他=不查資料
  oIds: number[];
}

export interface QueryUser {
  requester: string;
  page: number;
  pageSize: number;
}

export interface UserInfo {
  id: string;
  username: string;
  roleId: string;
  phone: string;
  email: string;
}

export interface UserOptionList {
  id: number;
  user_name: string;
  org_id: number;
}

export interface UserDetailInfo {
  id: string;
  username: string;
  roleId: string;
  roleName: string;
  phone: string;
  email: string;
  createTime: string;
}

export interface FetchUserInfo {
  detailInfo: UserDetailInfo;
  code?: number;
  status?: string;
}

export interface SearchCriteria {
  keyword?: string;
  pageNum?: string;
  limit?: string;
}

interface Response<T> {
  result?: 'success';
  data: T;
}

// Mock user data
const mockUserData: FetchUserInfo = {
  detailInfo: {
    id: '6e01b808-6841-11f0-94bb-5254008c2c02',
    username: 'admin',
    roleId: 'fb509ca6-7bf0-11ea-b5b2-0a002700000e',
    roleName: '管理員',
    phone: '15862589286',
    email: '666@qq.com',
    createTime: '2025-07-24'
  }
};

/**
 * 取得用戶列表
 */
export const getUserList = async (payload?: SearchCriteria) =>
  provider.get('/schideron/openApi/user/list', {
    params: { ...payload, requester }
  });

/**
 * 取得用戶選項
 */
export const getUserSelectOptions = (payload: QuerySelectOptionRequest) =>
  provider
    .get('/api/users/getUserSelectOptions', { params: payload })
    .then((res) => res.data);

/**
 * 更新密碼
 */
export const updatePassword = async (payload: UpdatePasswordRequest) =>
  provider.post(`/schideron/openApi/user/resetPassword/${payload.id}`, {
    defaultPassword: payload.newPassword,
    requester
  });

/**
 * 更新用戶狀態
 */
export const updateUserStatus = async (payload: UpdateStatusRequest) =>
  provider.post('/api/users/updateStatus', payload);

/**
 * 重設密碼
 */
export const resetPassword = async (payload: UpdateStatusRequest) =>
  provider.post('/api/users/resetPassword', payload);

/**
 * 更新用戶資料
 */
export const updateUser = async (payload: UserInfo) =>
  provider.put(`/schideron/openApi/user/edit/${payload.id}`, {
    requester,
    username: payload.username,
    roleId: payload.roleId,
    phone: payload.phone,
    email: payload.email
  });

/**
 * 刪除用戶
 */
export const deleteUser = async (payload: UserInfo) =>
  provider.delete(`/schideron/openApi/user/delete/${payload.id}`, {
    data: { requester }
  });

/**
 * 新增用戶
 */
export const addUser = async (payload: UserInfo & { password: string }) =>
  provider.post('/schideron/openApi/user/add', {
    requester,
    ...payload
  });

/**
 * 取得用戶詳細資料
 */
export const getProfile = async (
  userId: string
): Promise<Response<FetchUserInfo>> => {
  try {
    const response = await provider.get(
      `/schideron/openApi/user/detail/${userId}?requester=${requester}`
    );
    console.log('getProfile', response);
    return response as unknown as Response<FetchUserInfo>;
  } catch (error) {
    console.warn('Backend API unavailable, using mock data:', error);
    // Return mock data
    return {
      result: 'success',
      data: mockUserData
    };
  }
};
