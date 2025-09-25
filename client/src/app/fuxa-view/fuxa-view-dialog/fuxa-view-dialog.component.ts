import { Component, Inject, OnInit } from '@angular/core';
import { Hmi, View } from '../../_models/hmi';
import { GaugesManager } from '../../gauges/gauges.component';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ProjectService } from '../../_services/project.service';

@Component({
    selector: 'app-fuxa-view-dialog',
    templateUrl: './fuxa-view-dialog.component.html',
    styleUrls: ['./fuxa-view-dialog.component.scss']
})
export class FuxaViewDialogComponent implements OnInit {

    view: View;
    hmi: Hmi;
    gaugesManager: GaugesManager;
    variablesMapping = [];

    constructor(public dialogRef: MatDialogRef<FuxaViewDialogComponent>,
                private projectService: ProjectService,
                @Inject(MAT_DIALOG_DATA) public data: FuxaViewDialogData) {
    }

    ngOnInit() {
        this.hmi = this.projectService.getHmi();
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    getBackgroundStyle() {
        const profile = this.data?.view?.profile;
        if (!profile) {
            return {};
        }

        const style: any = {};

        if (profile.bkimage) {
            // 設定背景圖片
            style.backgroundImage = `url(${profile.bkimage})`;

            // Set background size
            if (profile.bkimageSize === 'stretch') {
                style.backgroundSize = '100% 100%';
            } else {
                style.backgroundSize = profile.bkimageSize || 'cover';
            }

            // Set background repeat
            style.backgroundRepeat = profile.bkimageRepeat || 'no-repeat';

            // Set background position
            style.backgroundPosition = profile.bkimagePosition || 'center';

            // Ensure background attachment is fixed for better display
            style.backgroundAttachment = 'scroll';
        }
        if (profile.bkcolor) {
            // 設定背景色（可與背景圖片同時存在）
            style.backgroundColor = profile.bkcolor;
        }

        return style;
    }
}

export interface FuxaViewDialogData {
    disableDefaultClose: boolean;
    bkColor: string;
    gaugesManager: GaugesManager;
    view: View;
    variablesMapping: [];
}
