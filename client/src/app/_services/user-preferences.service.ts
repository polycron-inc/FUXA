import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EndPointApi } from '../_helpers/endpointapi';
import { environment } from '../../environments/environment';

export interface UserPreference {
    id?: number;
    dms_user_id: string;
    start_view_id: string | null;
    preferences?: any;
    created_at?: number;
    updated_at?: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserPreferencesService {

    private endPointConfig: string = EndPointApi.getURL();
    private userPreference: UserPreference | null = null;

    userPreference$ = new BehaviorSubject<UserPreference | null>(null);

    constructor(private http: HttpClient) {}

    /**
     * 取得使用者偏好設定
     * @param dmsUserId DMS 使用者 ID
     * @returns Observable<UserPreference>
     */
    getUserPreference(dmsUserId: string): Observable<UserPreference> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.get<UserPreference>(
            this.endPointConfig + '/api/userpreferences/' + dmsUserId,
            { headers: header }
        );
    }

    /**
     * 載入使用者偏好設定並快取
     * @param dmsUserId DMS 使用者 ID
     * @returns Promise<UserPreference | null>
     */
    async loadUserPreference(dmsUserId: string): Promise<UserPreference | null> {
        if (!environment.serverEnabled || !dmsUserId) {
            return null;
        }
        try {
            const result = await this.getUserPreference(dmsUserId).toPromise();
            this.userPreference = result;
            this.userPreference$.next(this.userPreference);
            console.log('User preference loaded:', this.userPreference);
            return this.userPreference;
        } catch (error: any) {
            // 404 表示還沒有設定，不是錯誤
            if (error.status === 404) {
                console.log('No user preference found for:', dmsUserId);
                this.userPreference = null;
                this.userPreference$.next(null);
                return null;
            }
            console.error('Failed to load user preference:', error);
            return null;
        }
    }

    /**
     * 儲存使用者偏好設定
     * @param preference 使用者偏好設定
     * @returns Observable<any>
     */
    setUserPreference(preference: UserPreference): Observable<any> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post(
            this.endPointConfig + '/api/userpreferences',
            preference,
            { headers: header }
        );
    }

    /**
     * 儲存使用者偏好設定並更新快取
     * @param preference 使用者偏好設定
     * @returns Promise<boolean>
     */
    async saveUserPreference(preference: UserPreference): Promise<boolean> {
        if (!environment.serverEnabled) {
            return false;
        }
        try {
            await this.setUserPreference(preference).toPromise();
            this.userPreference = preference;
            this.userPreference$.next(this.userPreference);
            console.log('User preference saved:', this.userPreference);
            return true;
        } catch (error) {
            console.error('Failed to save user preference:', error);
            return false;
        }
    }

    /**
     * 設定起始視圖
     * @param dmsUserId DMS 使用者 ID
     * @param startViewId 起始視圖 ID
     * @returns Promise<boolean>
     */
    async setStartView(dmsUserId: string, startViewId: string): Promise<boolean> {
        const preference: UserPreference = {
            dms_user_id: dmsUserId,
            start_view_id: startViewId,
            preferences: this.userPreference?.preferences || {}
        };
        return this.saveUserPreference(preference);
    }

    /**
     * 取得起始視圖 ID
     * @returns string | null
     */
    getStartViewId(): string | null {
        return this.userPreference?.start_view_id || null;
    }

    /**
     * 刪除使用者偏好設定
     * @param dmsUserId DMS 使用者 ID
     * @returns Observable<any>
     */
    deleteUserPreference(dmsUserId: string): Observable<any> {
        let header = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.delete(
            this.endPointConfig + '/api/userpreferences/' + dmsUserId,
            { headers: header }
        );
    }

    /**
     * 取得快取的使用者偏好設定
     * @returns UserPreference | null
     */
    getCachedUserPreference(): UserPreference | null {
        return this.userPreference;
    }
}
