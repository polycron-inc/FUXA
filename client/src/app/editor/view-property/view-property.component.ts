import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../_helpers/utils';
import { Script } from '../../_models/script';
import { DocAlignType, DocProfile, ViewProperty, ViewType } from '../../_models/hmi';
import { TranslateService } from '@ngx-translate/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GridType } from 'angular-gridster2';
import { FlexEventComponent } from '../../gauges/gauge-property/flex-event/flex-event.component';
import { ProjectService } from '../../_services/project.service';
import { UserService } from '../../_services/user.service';
import { AuthService } from '../../_services/auth.service';
import { User } from '../../_models/user';
import { Subject, startWith, takeUntil } from 'rxjs';
import { MatLegacyTab as MatTab } from '@angular/material/legacy-tabs';
import { getUserList } from '../../api/user';

@Component({
    selector: 'app-view-property',
    templateUrl: './view-property.component.html',
    styleUrls: ['./view-property.component.scss']
})
export class ViewPropertyComponent implements OnInit, OnDestroy {
    defaultColor = Utils.defaultColor;
    viewType = ViewType;
    alignType = DocAlignType;
    formGroup: UntypedFormGroup;
    gridType = GridType;
    scripts: Script[];
    private destroy$ = new Subject<void>();

    // Tags management
    viewTags: string[] = [];
    newTagInput = '';
    allExistingTags: string[] = [];

    // Permission management
    users: any[] = [];  // Changed from User[] to any[] to support minimal user objects
    selectedViewers: string[] = [];
    currentUser: User;

    @ViewChild('flexevent', {static: false}) flexEvent: FlexEventComponent;
    @ViewChild('tabEvents', {static: true}) tabEvents: MatTab;

    propSizeType = [{ text: 'dlg.docproperty-size-320-240', value: { width: 320, height: 240 } }, { text: 'dlg.docproperty-size-460-360', value: { width: 460, height: 360 } },
    { text: 'dlg.docproperty-size-640-480', value: { width: 640, height: 480 } }, { text: 'dlg.docproperty-size-800-600', value: { width: 800, height: 600 } },
    { text: 'dlg.docproperty-size-1024-768', value: { width: 1024, height: 768 } }, { text: 'dlg.docproperty-size-1280-960', value: { width: 1280, height: 960 } },
    { text: 'dlg.docproperty-size-1600-1200', value: { width: 1600, height: 1200 } }, { text: 'dlg.docproperty-size-1920-1080', value: { width: 1920, height: 1080 } }];

    constructor(private fb: UntypedFormBuilder,
                private translateService: TranslateService,
                private projectService: ProjectService,
                private userService: UserService,
                private authService: AuthService,
                public dialogRef: MatDialogRef<ViewPropertyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ViewPropertyType & { newView: boolean}) {

        this.scripts = this.projectService.getScripts();
        for (let i = 0; i < this.propSizeType.length; i++) {
            this.translateService.get(this.propSizeType[i].text).subscribe((txt: string) => { this.propSizeType[i].text = txt; });
        }

        // Get current user
        this.currentUser = this.authService.getUser();

        // Load users list from API
        this.loadUsersList();
    }

    private async loadUsersList() {
        try {
            const response = await getUserList({ pageNum: '1', limit: '100' });
            if (response && response.data && response.data.pageInfo && response.data.pageInfo.list) {
                // Map API response to user format with username
                this.users = response.data.pageInfo.list.map((user: any) => ({
                    username: user.username,
                    id: user.id,
                    email: user.email,
                    phone: user.phone
                }));
            }
        } catch (error) {
            console.error('Failed to load users list:', error);
            // Fallback to old method if API fails
            this.userService.getUsersList().subscribe(result => {
                if (result && result.users) {
                    this.users = result.users;
                }
            }, err => {
                console.error('Fallback also failed:', err);
                // If both methods fail, at least show current user
                if (this.currentUser) {
                    this.users = [{ username: this.currentUser.username }];
                }
            });
        }
    }

    ngOnInit() {
        this.formGroup = this.fb.group({
            name: [{value: this.data.name, disabled: this.data.name}, Validators.required],
            type: [{value: this.data.type, disabled: this.data.name}],
            width: [this.data.profile.width],
            height: [this.data.profile.height],
            margin: [this.data.profile.margin],
            align: [this.data.profile.align],
            gridType: [this.data.profile.gridType],
        });
        if (this.data.type !== ViewType.cards && this.data.type !== ViewType.maps) {
            this.formGroup.controls.width.setValidators(Validators.required);
            this.formGroup.controls.height.setValidators(Validators.required);
        }
        if (!this.data.name) {
            this.formGroup.controls.name.addValidators(this.isValidName());
        }
        this.formGroup.updateValueAndValidity();

        this.formGroup.controls.type.valueChanges.pipe(
            takeUntil(this.destroy$),
            startWith(this.formGroup.controls.type.value)
        ).subscribe(type => {
            this.tabEvents.disabled = type === ViewType.cards || type === ViewType.maps;
            if (type === ViewType.cards && this.data.newView && this.data.profile.bkcolor === '#ffffffff') {
                this.data.profile.bkcolor = '#E6E6E6';
            }
        });

        // Initialize tags
        this.viewTags = this.data.tags ? [...this.data.tags] : [];

        // Collect all existing tags from all views
        const allViews = this.projectService.getViews();
        const tagsSet = new Set<string>();
        allViews.forEach(view => {
            if (view.tags && Array.isArray(view.tags)) {
                view.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        this.allExistingTags = Array.from(tagsSet).sort();

        // Initialize permissions
        if (!this.data.property) {
            this.data.property = new ViewProperty();
        }

        // Set creator for new views (default to current user)
        if (this.data.newView && this.currentUser && !this.data.property.creator) {
            this.data.property.creator = this.currentUser.username;
        }

        // Initialize viewers list
        this.selectedViewers = this.data.property.viewers ? [...this.data.property.viewers] : [];
    }

    ngOnDestroy() {
        this.destroy$.next(null);
        this.destroy$.complete();
    }

    isValidName(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.data.existingNames?.indexOf(control.value) !== -1) {
                return { name: this.translateService.instant('msg.view-name-exist') };
            }
            return null;
        };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.name = this.formGroup.controls.name.value;
        this.data.type = this.formGroup.controls.type.value;
        this.data.profile.width = this.formGroup.controls.width.value;
        this.data.profile.height = this.formGroup.controls.height.value;
        this.data.profile.margin = this.formGroup.controls.margin.value;
        this.data.profile.align = this.formGroup.controls.align.value;
        this.data.profile.gridType = this.formGroup.controls.gridType.value;
        if (!this.data.property) {
			this.data.property = new ViewProperty();
        }
        this.data.property.events = this.flexEvent.getEvents();
        // Save tags
        this.data.tags = this.viewTags.length > 0 ? this.viewTags : undefined;

        // Save permissions
        this.data.property.viewers = this.selectedViewers.length > 0 ? this.selectedViewers : undefined;
        this.data.property.updatedAt = new Date().toISOString();

        this.dialogRef.close(this.data);
    }

    onSizeChange(size) {
        if (size?.width && size?.height) {
            this.formGroup.controls.height.setValue(size.height);
            this.formGroup.controls.width.setValue(size.width);
        }
    }

    onAddEvent() {
        this.flexEvent.onAddEvent();
    }

    onBackgroundImageSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.data.profile.bkimage = e.target?.result as string;
                if (!this.data.profile.bkimageSize) {
                    this.data.profile.bkimageSize = 'cover';
                }
                if (!this.data.profile.bkimageRepeat) {
                    this.data.profile.bkimageRepeat = 'no-repeat';
                }
                if (!this.data.profile.bkimagePosition) {
                    this.data.profile.bkimagePosition = 'center';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    removeBackgroundImage() {
        this.data.profile.bkimage = undefined;
        this.data.profile.bkimageSize = 'cover';
        this.data.profile.bkimageRepeat = 'no-repeat';
        this.data.profile.bkimagePosition = 'center';
    }

    // Tag management methods
    addTag(tag: string) {
        const trimmedTag = tag.trim();
        if (trimmedTag && !this.viewTags.includes(trimmedTag)) {
            this.viewTags.push(trimmedTag);
            this.viewTags.sort();
            this.newTagInput = '';
        }
    }

    removeTag(tag: string) {
        const index = this.viewTags.indexOf(tag);
        if (index >= 0) {
            this.viewTags.splice(index, 1);
        }
    }

    toggleTag(tag: string) {
        if (this.viewTags.includes(tag)) {
            this.removeTag(tag);
        } else {
            this.addTag(tag);
        }
    }

    isTagSelected(tag: string): boolean {
        return this.viewTags.includes(tag);
    }

    onTagInputKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addTag(this.newTagInput);
        }
    }

    getImageFileName(base64: string): string {
        if (!base64) { return ''; }
        return base64.substring(0, 50) + '...'; // 顯示前50個字符
    }

    // Permission management methods
    toggleViewer(username: string) {
        const index = this.selectedViewers.indexOf(username);
        if (index >= 0) {
            this.selectedViewers.splice(index, 1);
        } else {
            this.selectedViewers.push(username);
        }
    }

    isViewerSelected(username: string): boolean {
        return this.selectedViewers.includes(username);
    }

    toggleLocked() {
        this.data.property.locked = !this.data.property.locked;
    }
}

export interface ViewPropertyType {
    name: string;
    type: ViewType;
    profile: DocProfile;
    property: ViewProperty;
    existingNames?: string[];
    tags?: string[];
}
