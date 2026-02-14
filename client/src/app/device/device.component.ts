/* eslint-disable @angular-eslint/component-class-suffix */
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {DeviceListComponent} from './device-list/device-list.component';
import {DeviceMapComponent} from './device-map/device-map.component';
import {Device, DEVICE_PREFIX, DevicesUtils, DeviceType, DeviceViewModeType, TAG_PREFIX, DeviceNetProperty, Tag} from './../_models/device';
import {ProjectService} from '../_services/project.service';
import {HmiService} from '../_services/hmi.service';
import {DEVICE_READONLY} from '../_models/hmi';
import {Utils} from '../_helpers/utils';
import { getProtocolList, ProtocolItem } from '../api/protocol';

@Component({
    selector: 'app-device',
    templateUrl: './device.component.html',
    styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit, OnDestroy {

    @ViewChild('devicelist', {static: false}) deviceList: DeviceListComponent;
    @ViewChild('devicemap', {static: false}) deviceMap: DeviceMapComponent;
    @ViewChild('fileImportInput', {static: false}) fileImportInput: any;
    @ViewChild('tplFileImportInput',{static: false}) tplFileImportInput: any;

    private subscriptionLoad: Subscription;
    private subscriptionDeviceChange: Subscription;
    private subscriptionVariableChange: Subscription;
    private askStatusTimer;

    devicesViewMode = DeviceViewModeType.devices;
    devicesViewMap = DeviceViewModeType.map;
    devicesViewList = DeviceViewModeType.list;
    tagsViewMode = DeviceViewModeType.tags;

    showMode = <string>this.devicesViewMap;
    readonly = false;
    reloadActive = false;
    mqttDevices: Device[] = [];
    selectedMqttDevice: Device | null = null;
    mqttTemplates: any[] = [];

    constructor(private router: Router,
        private projectService: ProjectService,
        private hmiService: HmiService) {
        if (this.router.url.indexOf(DEVICE_READONLY) >= 0) {
            this.readonly = true;
        }
        this.showMode = localStorage.getItem('@frango.devicesview') || this.devicesViewMap;
    }

    ngOnInit() {
        this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(res => {
            this.deviceMap.loadCurrentProject();
            this.deviceList.mapTags();
            this.loadMqttDevices(); // 重新載入MQTT設備列表
            this.loadMqttTemplates(); // 重新載入MQTT模板
        });
        this.subscriptionDeviceChange = this.hmiService.onDeviceChanged.subscribe(event => {
            this.deviceMap.setDeviceStatus(event);
        });
        this.subscriptionVariableChange = this.hmiService.onVariableChanged.subscribe(event => {
            this.deviceList.updateDeviceValue();
        });
        this.askStatusTimer = setInterval(() => {
            this.hmiService.askDeviceStatus();
        }, 10000);
        this.hmiService.askDeviceStatus();
        this.loadMqttDevices();
        this.loadMqttTemplates();
    }

    ngOnDestroy() {
        // this.checkToSave();
        try {
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
            if (this.subscriptionDeviceChange) {
                this.subscriptionDeviceChange.unsubscribe();
            }
            if (this.subscriptionVariableChange) {
                this.subscriptionVariableChange.unsubscribe();
            }
        } catch (e) {
        }
        try {
            clearInterval(this.askStatusTimer);
            this.askStatusTimer = null;
        } catch { }
    }

    show(mode: string) {
        // this.checkToSave();
        this.showMode = mode;
        if (this.showMode === this.tagsViewMode) {
            this.deviceList.updateDeviceValue();
            try {
                if (Object.values(this.deviceMap.devicesValue()).length > 0) {
                    this.deviceList.setSelectedDevice(this.deviceMap.devicesValue()[0]);
                }
            } catch (e) {
            }
        } else {
            localStorage.setItem('@frango.devicesview', this.showMode);
        }
    }

    gotoDevices(flag: boolean) {
        if (flag) {
            if (this.showMode === this.devicesViewMap) {
                this.show(this.devicesViewList);
            } else {
                this.show(this.devicesViewMap);
            }
            return;
        }
        let mode = localStorage.getItem('@frango.devicesview') || this.devicesViewMap;
        this.show(mode);
    }

    gotoList(device: Device) {
        this.onReload();
        this.show(this.tagsViewMode);
        this.deviceList.setSelectedDevice(device);
    }

    addItem() {
        if (this.showMode === this.tagsViewMode) {
            this.deviceList.onAddTag();
        } else if (this.showMode.startsWith(this.devicesViewMode)) {
            this.deviceMap.addDevice();
        }
    }

    onReload() {
        this.projectService.onRefreshProject();
        this.reloadActive = true;
        setTimeout(() => {
            this.reloadActive = false;
        }, 1000);
    }

    onExport(type: string) {
        try {
            this.projectService.exportDevices(type);
        } catch (err) {
            console.error(err);
        }
    }

    onImport() {
        let ele = document.getElementById('devicesConfigFileUpload') as HTMLElement;
        ele.click();
    }

    onImportTpl() {
        let ele = document.getElementById('devicesConfigTplUpload') as HTMLElement;
        ele.click();
    }

    /**
     * @deprecated use onDevTplChangeListener
     * open Project event file loaded
     * @param event file resource
     */
    onFileChangeListener(event) {
        return this.onDevTplChangeListener(event, false);
    }

    /**
     * open Project event file loaded
     * @param event file resource
     * @param isTemplate use template for import, if true, generate new device id and tag id
     */
    onDevTplChangeListener(event, isTemplate: boolean){
        let input = event.target;
        let reader = new FileReader();
        reader.onload = (data) => {
            let devices;
            if (Utils.isJson(reader.result)) {
                // JSON
                devices = JSON.parse(reader.result.toString());
            } else {
                // CSV
                devices = DevicesUtils.csvToDevices(reader.result.toString());
            }
            //generate new id and filte fuxa
            let importDev = [];
            if(isTemplate) {
                devices.forEach((device: Device) => {
                    if (device.type != DeviceType.FuxaServer) {
                        device.id = Utils.getGUID(DEVICE_PREFIX);
                        device.name = Utils.getShortGUID(device.name + '_', '');
                        if (device.tags) {
                            let newTags = {};
                            Object.keys(device.tags).forEach((key) => {
                                const id = Utils.getGUID(TAG_PREFIX);
                                //change tags key to new id
                                newTags[id] = device.tags[key];
                                newTags[id].id = id;
                            });
                            device.tags = newTags;
                        }
                        importDev.push(device);
                    }
                });
            }
            this.projectService.importDevices(isTemplate ? importDev : devices);
            setTimeout(() => { this.projectService.onRefreshProject(); }, 2000);
        };

        reader.onerror = function() {
            let msg = 'Unable to read ' + input.files[0];
            // this.translateService.get('msg.project-load-error', {value: input.files[0]}).subscribe((txt: string) => { msg = txt });
            alert(msg);
        };
        reader.readAsText(input.files[0]);
        this.tplFileImportInput.nativeElement.value = null;
    }

    loadMqttDevices() {
        const devices = this.projectService.getDeviceList();
        const mqttDevices = devices.filter(device => device.type === DeviceType.MQTTclient);

        // 過濾重複名稱的設備，只保留每個名稱的第一個設備
        const uniqueMqttDevices: Device[] = [];
        const seenNames = new Set<string>();

        for (const device of mqttDevices) {
            if (!seenNames.has(device.name)) {
                seenNames.add(device.name);
                uniqueMqttDevices.push(device);
            }
        }

        this.mqttDevices = uniqueMqttDevices;
    }

    async loadMqttTemplates() {
        try {
            const response = await getProtocolList({ type: 'MQTT' });
            if (response.data && response.data.pageInfo && response.data.pageInfo.list) {
                // 將 API 回應的 ProtocolItem 轉換為模板格式
                this.mqttTemplates = response.data.pageInfo.list.map((protocol: ProtocolItem) => {
                    const template: any = {
                        name: protocol.name,
                        address: protocol.mqttServerAddr ? `mqtt://${protocol.mqttServerAddr}` : 'mqtt://localhost:1883',
                        topics: []
                    };

                    // 如果有 topicList，將其轉換為 topics 格式
                    if (protocol.topicList && protocol.topicList.length > 0) {
                        template.topics = protocol.topicList.map((topicPath: string, index: number) => ({
                            name: `Topic${index + 1}`,
                            address: topicPath,
                            type: 'Real',
                            subs: true
                        }));
                    } else {
                        // 如果沒有 topicList，使用基本的 topic 結構
                        if (protocol.pushTopic) {
                            template.topics.push({
                                name: 'Push',
                                address: protocol.pushTopic,
                                type: 'Real',
                                subs: true
                            });
                        }
                        if (protocol.receiveTopic) {
                            template.topics.push({
                                name: 'Receive',
                                address: protocol.receiveTopic,
                                type: 'Real',
                                subs: true
                            });
                        }
                        if (protocol.alarmTopic) {
                            template.topics.push({
                                name: 'Alarm',
                                address: protocol.alarmTopic,
                                type: 'Bool',
                                subs: true
                            });
                        }
                    }

                    return template;
                });
            } else {
                console.warn('No MQTT protocols found from API, using empty templates');
                this.mqttTemplates = [];
            }
        } catch (error) {
            console.error('Failed to load MQTT templates from API:', error);
            // 如果 API 呼叫失敗，可以使用空陣列或預設值
            this.mqttTemplates = [];
        }
    }

    getAvailableTemplates() {
        // 取得所有現有設備名稱
        const devices = this.projectService.getDeviceList();
        const existingNames = new Set(devices.map(device => device.name));

        // 只返回名稱不重複的模板
        return this.mqttTemplates.filter(template => !existingNames.has(template.name));
    }

    onMqttDeviceSelected(device: Device) {
        // 複製現有MQTT設備的設定，並觸發原本的新增流程
        const existingTopics = Object.values(device.tags).map((tag: Tag) => ({
            name: tag.name,
            address: tag.address,
            type: tag.type,
            subs: tag.options?.subs ? true : false
        }));

        this.addMqttDeviceWithTemplate({
            name: device.name + '_copy',
            address: device.property?.address || 'mqtt://test.mosquitto.org:1883',
            topics: existingTopics
        });
    }

    onMqttTemplateSelected(template: any) {
        // 觸發原本的新增設備流程，並預設MQTT模板資料
        this.addMqttDeviceWithTemplate(template);
    }

    addMqttDeviceWithTemplate(template: any) {
        // 創建新的MQTT設備，並預設模板資料
        let device = new Device(Utils.getGUID(DEVICE_PREFIX));
        device.property = new DeviceNetProperty();
        device.enabled = false;
        device.tags = {};
        device.type = DeviceType.MQTTclient;
        device.name = template.name;
        device.property.address = template.address;
        device.polling = 350;

        // 根據模板添加預設的 topics/tags
        if (template.topics && template.topics.length > 0) {
            template.topics.forEach((topic: any) => {
                const tagId = Utils.getGUID(TAG_PREFIX);
                const tag = new Tag(tagId);
                tag.name = topic.name;
                tag.address = topic.address;
                tag.type = topic.type;

                // 設定 MQTT subscription options
                if (topic.subs) {
                    tag.options = {
                        subs: topic.address  // 訂閱的 topic 路徑
                    };
                }

                // 添加到設備的 tags 中
                device.tags[tagId] = tag;
            });
        }

        // 呼叫device-map的原生新增流程
        this.deviceMap.editDevice(device, false);
    }
}
