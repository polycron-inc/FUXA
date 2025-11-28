import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EndPointApi } from '../_helpers/endpointapi';
import { environment } from '../../environments/environment';
import { UserItem } from '../api/user';

// 可見範圍類型
export type VisibilityScope = 'global' | 'role' | 'user' | 'owner';

export interface PlayRestriction {
    id: number;
    type: 'user' | 'role';
    view_id: string;
    user_id: string | null;
    role_id: string | null;
    owner_id: string | null;
    visibility_scope: VisibilityScope;
    creator: string;
    created_at: string;
}

export interface AllowedViewsResponse {
    allowed: boolean;
    views: string[];
    isSuperAdmin?: boolean;
}

// 超級管理員 roleId
const SUPER_ADMIN_ROLE_ID = '1';

@Injectable({
    providedIn: 'root'
})
export class PlayRestrictionsService {

    private endPointConfig: string = EndPointApi.getURL();
    private playRestrictions: PlayRestriction[] = [];
    private allowedViews: string[] = [];
    private isAllowed: boolean = true;
    private isSuperAdmin: boolean = false;

    playRestrictions$ = new BehaviorSubject<PlayRestriction[]>([]);
    allowedViews$ = new BehaviorSubject<AllowedViewsResponse>({ allowed: true, views: [], isSuperAdmin: false });

    constructor(private http: HttpClient) {}

    /**
     * 取得所有播放限制規則
     * @param viewId 可選的 view ID 篩選
     * @returns Observable<PlayRestriction[]>
     */
    getPlayRestrictions(viewId?: string): Observable<PlayRestriction[]> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        let params: any = {};
        if (viewId) {
            params.viewId = viewId;
        }
        return this.http.get<PlayRestriction[]>(this.endPointConfig + '/api/playrestrictions', { headers: header, params });
    }

    /**
     * 載入播放限制規則並儲存
     * @returns Promise<PlayRestriction[]>
     */
    async loadPlayRestrictions(): Promise<PlayRestriction[]> {
        if (!environment.serverEnabled) {
            return [];
        }
        try {
            const result = await this.getPlayRestrictions().toPromise();
            this.playRestrictions = result || [];
            this.playRestrictions$.next(this.playRestrictions);
            console.log('Play restrictions loaded:', this.playRestrictions);
            return this.playRestrictions;
        } catch (error) {
            console.error('Failed to load play restrictions:', error);
            return [];
        }
    }

    /**
     * 取得當前使用者允許的 views
     * @returns Observable<AllowedViewsResponse>
     */
    getAllowedViews(): Observable<AllowedViewsResponse> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.get<AllowedViewsResponse>(this.endPointConfig + '/api/playrestrictions/allowed-views', { headers: header });
    }

    /**
     * 載入允許的 views 並儲存
     * @returns Promise<AllowedViewsResponse>
     */
    async loadAllowedViews(): Promise<AllowedViewsResponse> {
        if (!environment.serverEnabled) {
            return { allowed: true, views: [] };
        }
        try {
            const result = await this.getAllowedViews().toPromise();
            this.isAllowed = result?.allowed ?? true;
            this.allowedViews = result?.views || [];
            this.allowedViews$.next(result);
            console.log('Allowed views loaded:', result);
            return result;
        } catch (error) {
            console.error('Failed to load allowed views:', error);
            return { allowed: true, views: [] };
        }
    }

    /**
     * 新增或更新播放限制
     * @param restriction 限制規則
     * @returns Observable<any>
     */
    setPlayRestriction(restriction: Partial<PlayRestriction>): Observable<any> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post(this.endPointConfig + '/api/playrestrictions', restriction, { headers: header });
    }

    /**
     * 刪除播放限制
     * @param id 限制 ID
     * @returns Observable<any>
     */
    deletePlayRestriction(id: number): Observable<any> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.delete(this.endPointConfig + '/api/playrestrictions/' + id, { headers: header });
    }

    /**
     * 根據 DMS 使用者資訊計算允許的 views
     * 判斷邏輯：
     * 1. roleId = 1 (超級管理員) -> 全部顯示
     * 2. visibility_scope = 'global' -> 全部顯示
     * 3. visibility_scope = 'role' -> 只顯示 role_id = 使用者 roleId 的 view
     * 4. visibility_scope = 'user' -> 只顯示 user_id = 使用者 userId 的 view
     * 5. visibility_scope = 'owner' -> 只顯示 owner_id = 使用者 userId 的 view
     *
     * @param dmsUser DMS 使用者資訊
     * @returns AllowedViewsResponse
     */
    calculateAllowedViews(dmsUser: UserItem): AllowedViewsResponse {
        // 如果沒有使用者資訊，預設全部允許
        if (!dmsUser) {
            console.warn('No DMS user info, allowing all views');
            return { allowed: true, views: [], isSuperAdmin: false };
        }

        const userId = dmsUser.id || dmsUser.username;
        const roleId = dmsUser.roleId;

        // 超級管理員 (roleId = 1) 全部顯示
        if (roleId === SUPER_ADMIN_ROLE_ID) {
            console.log('Super admin detected, allowing all views');
            this.isSuperAdmin = true;
            this.isAllowed = true;
            this.allowedViews = [];
            const result = { allowed: true, views: [], isSuperAdmin: true };
            this.allowedViews$.next(result);
            return result;
        }

        this.isSuperAdmin = false;

        // 如果沒有播放限制規則，全部顯示
        if (!this.playRestrictions || this.playRestrictions.length === 0) {
            console.log('No play restrictions, allowing all views');
            this.isAllowed = true;
            this.allowedViews = [];
            const result = { allowed: true, views: [], isSuperAdmin: false };
            this.allowedViews$.next(result);
            return result;
        }

        // 根據 visibility_scope、userId 和 roleId 過濾允許的 views
        const allowedViewIds = new Set<string>();

        for (const restriction of this.playRestrictions) {
            const isAllowed = this.checkRestrictionAccess(restriction, userId, roleId);
            if (isAllowed) {
                allowedViewIds.add(restriction.view_id);
            }
        }

        this.allowedViews = Array.from(allowedViewIds);
        this.isAllowed = this.allowedViews.length > 0;

        console.log(`Allowed views for user ${userId} (roleId: ${roleId}):`, this.allowedViews);

        const result = { allowed: this.isAllowed, views: this.allowedViews, isSuperAdmin: false };
        this.allowedViews$.next(result);
        return result;
    }

    /**
     * 檢查單一限制規則是否允許存取
     * @param restriction 播放限制規則
     * @param userId 使用者 ID
     * @param roleId 角色 ID
     * @returns boolean
     */
    private checkRestrictionAccess(restriction: PlayRestriction, userId: string, roleId: string): boolean {
        const scope = restriction.visibility_scope;

        switch (scope) {
            case 'global':
                // 全部顯示
                return true;

            case 'role':
                // 只顯示 role_id = 使用者 roleId 的 view
                return restriction.role_id === roleId;

            case 'user':
                // 只顯示 user_id = 使用者 userId 的 view
                return restriction.user_id === userId;

            case 'owner':
                // 只顯示 owner_id = 使用者 userId 的 view
                return restriction.owner_id === userId;

            default:
                // 預設：檢查舊的 type 邏輯（向後相容）
                if (restriction.type === 'user' && restriction.user_id === userId) {
                    return true;
                }
                if (restriction.type === 'role' && restriction.role_id === roleId) {
                    return true;
                }
                return false;
        }
    }

    /**
     * 檢查 view 是否允許存取
     * @param viewId view ID
     * @returns boolean
     */
    isViewAllowed(viewId: string): boolean {
        // 超級管理員全部允許
        if (this.isSuperAdmin) {
            return true;
        }
        // 如果沒有限制規則，全部允許
        if (!this.playRestrictions || this.playRestrictions.length === 0) {
            return true;
        }
        // 如果沒有允許的 views，表示沒有任何限制匹配，不允許
        if (this.allowedViews.length === 0) {
            return false;
        }
        return this.allowedViews.includes(viewId);
    }

    /**
     * 檢查是否為超級管理員
     */
    checkIsSuperAdmin(): boolean {
        return this.isSuperAdmin;
    }

    /**
     * 取得已載入的播放限制規則
     */
    getCachedPlayRestrictions(): PlayRestriction[] {
        return this.playRestrictions;
    }

    /**
     * 取得已載入的允許 views
     */
    getCachedAllowedViews(): string[] {
        return this.allowedViews;
    }
}
