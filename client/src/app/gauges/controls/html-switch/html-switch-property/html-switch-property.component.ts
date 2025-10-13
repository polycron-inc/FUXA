import { Component, Inject, ViewChild, AfterContentInit, OnInit } from '@angular/core';

import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { GaugeProperty } from '../../../../_models/hmi';

import { FlexAuthComponent } from '../../../gauge-property/flex-auth/flex-auth.component';
import { FlexHeadComponent } from '../../../gauge-property/flex-head/flex-head.component';
import { HtmlSwitchComponent } from '../html-switch.component';
import { NgxSwitchComponent, SwitchOptions } from '../../../../gui-helpers/ngx-switch/ngx-switch.component';
import { Define } from '../../../../_helpers/define';
import { Utils } from '../../../../_helpers/utils';
import { FlexEventComponent } from '../../../gauge-property/flex-event/flex-event.component';

@Component({
    selector: 'app-html-switch-property',
    templateUrl: './html-switch-property.component.html',
    styleUrls: ['./html-switch-property.component.scss']
})
export class HtmlSwitchPropertyComponent implements OnInit, AfterContentInit {

    @ViewChild('switcher', {static: false}) switcher: NgxSwitchComponent;
	@ViewChild('flexhead', {static: false}) flexhead: FlexHeadComponent;
    @ViewChild('flexhead2', {static: false}) flexhead2: FlexHeadComponent;
    @ViewChild('flexhead3', {static: false}) flexhead3: FlexHeadComponent;
    @ViewChild('flexauth', {static: false}) flexauth: FlexAuthComponent;
    @ViewChild('flexevent', {static: false}) flexEvent: FlexEventComponent;

    property: GaugeProperty;
    readProperty: GaugeProperty;
    writeProperty: GaugeProperty;
    options: SwitchOptions;
    name: string;
    switchWidth = 80;
    switchHeight = 40;
    fonts = Define.fonts;
    defaultColor = Utils.defaultColor;
    withBitmask = false;
	eventsSupported: boolean;

    constructor(public dialogRef: MatDialogRef<HtmlSwitchPropertyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {
        this.property = <GaugeProperty>JSON.parse(JSON.stringify(this.data.settings.property));
        if (!this.property) {
            this.property = new GaugeProperty();
        }

        // Create separate property objects for read and write tags
        this.readProperty = new GaugeProperty();
        this.readProperty.variableId = this.property.readVariableId || this.property.variableId;

        this.writeProperty = new GaugeProperty();
        this.writeProperty.variableId = this.property.writeVariableId || this.property.variableId;
        this.name = this.data.settings.name;
        this.options = <SwitchOptions>this.property.options;
        if (!this.options) {
            this.options = new SwitchOptions();
        }
        let switchsize = HtmlSwitchComponent.getSize(this.data.settings);
        this.switchHeight = switchsize.height;
        this.switchWidth = switchsize.width;
        this.options.height = this.switchHeight;
        this.eventsSupported = this.data.withEvents;
    }

    ngOnInit(): void {
        if (this.data.withBitmask) {
            this.withBitmask = this.data.withBitmask;
        }
    }

    ngAfterContentInit() {
        this.updateOptions();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        // Sync read and write properties back to main property
        this.property.readVariableId = this.readProperty.variableId;
        this.property.writeVariableId = this.writeProperty.variableId;

        this.data.settings.property = this.property;
        this.data.settings.property.permission = this.flexauth.permission;
        this.data.settings.property.permissionRoles = this.flexauth.permissionRoles;
        this.data.settings.property.options = this.options;
        this.data.settings.name = this.flexauth.name;
        if (this.flexEvent) {
            this.data.settings.property.events = this.flexEvent.getEvents();
        }
    }

    onAddEvent() {
        this.flexEvent.onAddEvent();
    }

    updateOptions() {
        this.switcher?.setOptions(this.options);
    }
}
