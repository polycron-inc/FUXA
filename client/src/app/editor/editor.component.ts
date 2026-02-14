/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ProjectService, SaveMode } from '../_services/project.service';
import { PlayRestrictionsService } from '../_services/play-restrictions.service';
import { Hmi, View, GaugeSettings, SelElement, LayoutSettings, ViewType, ISvgElement, GaugeProperty, DocProfile } from '../_models/hmi';
import { WindowRef } from '../_helpers/windowref';
import { GaugePropertyComponent, GaugeDialogType, GaugePropertyData } from '../gauges/gauge-property/gauge-property.component';

import { GaugesManager } from '../gauges/gauges.component';
import { GaugeBaseComponent } from '../gauges/gauge-base/gauge-base.component';
import { Utils } from '../_helpers/utils';
import { Define } from '../_helpers/define';
import { LibImagesComponent } from '../resources/lib-images/lib-images.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../gui-helpers/confirm-dialog/confirm-dialog.component';

import { BagPropertyComponent } from '../gauges/controls/html-bag/bag-property/bag-property.component';
import { SliderPropertyComponent } from '../gauges/controls/slider/slider-property/slider-property.component';
import { HtmlInputComponent } from '../gauges/controls/html-input/html-input.component';
import { HtmlButtonComponent } from '../gauges/controls/html-button/html-button.component';
import { HtmlSelectComponent } from '../gauges/controls/html-select/html-select.component';
import { ValueComponent } from '../gauges/controls/value/value.component';
import { GaugeProgressComponent } from '../gauges/controls/gauge-progress/gauge-progress.component';
import { GaugeSemaphoreComponent } from '../gauges/controls/gauge-semaphore/gauge-semaphore.component';
import { HtmlSwitchPropertyComponent } from '../gauges/controls/html-switch/html-switch-property/html-switch-property.component';

import { GridsterItem } from 'angular-gridster2';
import { CardConfigComponent, CardConfigType } from './card-config/card-config.component';
import { CardsViewComponent } from '../cards-view/cards-view.component';
import { IElementPreview } from './svg-selector/svg-selector.component';
import { TagIdRef, TagsIdsConfigComponent, TagsIdsData } from './tags-ids-config/tags-ids-config.component';
import { UploadFile } from '../_models/project';
import { ViewPropertyComponent, ViewPropertyType } from './view-property/view-property.component';
import { HtmlImageComponent } from '../gauges/controls/html-image/html-image.component';
import { LibWidgetsService } from '../resources/lib-widgets/lib-widgets.service';
import { PipePropertyData } from '../gauges/controls/pipe/pipe-property/pipe-property.component';
import { MapsViewComponent } from '../maps/maps-view/maps-view.component';
import { KioskWidgetsComponent } from '../resources/kiosk-widgets/kiosk-widgets.component';

declare var Gauge: any;

declare var $: any;
declare var mypathseg: any;         ///< svg-editor component
declare var mybrowser: any;
declare var mysvgutils: any;
declare var myselect: any;
declare var mydraw: any;
declare var initContextmenu: any;
declare var mysvgcanvas: any;
declare var mysvgeditor: any;

@Component({
    moduleId: module.id,
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.css']
})

export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('gaugepanel', { static: false }) gaugePanelComponent: GaugeBaseComponent;
    @ViewChild('viewFileImportInput', { static: false }) viewFileImportInput: any;
    @ViewChild('cardsview', { static: false }) cardsview: CardsViewComponent;
    @ViewChild('sidePanel', { static: false }) sidePanel: MatDrawer;
    @ViewChild('svgSelectorPanel', { static: false }) svgSelectorPanel: MatDrawer;
    @ViewChild('svgpreview', { static: false }) svgPreview: ElementRef;
    @ViewChild('mapsView', { static: false }) mapsView: MapsViewComponent;

    svgElementSelected: ISvgElement = null;
    svgElements: ISvgElement[] = [];
    gaugeDialogType = GaugeDialogType;
    gaugeDialog = { type: null, data: null };
    reloadGaugeDialog: boolean;

    readonly colorDefault = { fill: 'transparent', stroke: '#000000' };
    fonts = Define.fonts;
    isLoading = true;
    editorModeType = EditorModeType;
    editorMode: EditorModeType = EditorModeType.SVG;
    defaultColor = Utils.defaultColor;
    colorFill = this.colorDefault.fill;
    colorStroke = this.colorDefault.stroke;
    currentView: View = null;
    currentTemplate: View = null;
    hmi: Hmi = new Hmi();// = {_id: '', name: '', networktype: '', ipaddress: '', maskaddress: '' };
    currentMode = '';
    imagefile: string;
    ctrlInitParams: any;
    gridOn = false;
    isAnySelected = false;
    selectedElement: SelElement = new SelElement();
    panelsState: PanelsStateType = {
        enabled: false,
        panelView: true,
        panelViewHeight: 200,
        panelTemplate: true,
        panelTemplateHeight: 200,
        panelGeneral: true,
        panelC: true,
        panelD: true,
        panelS: true,
        panelWidgets: true,
    };
    panelPropertyIdOpenState: boolean;
    panelPropertyTransformOpenState: boolean;
    panelAlignOpenState: boolean;
    panelFillOpenState: boolean;
    panelEventOpenState: boolean;
    panelMarkerOpenState: boolean;
    panelHyperlinkOpenState: boolean;
    gaugeSettingsHide: boolean = false;
    gaugeSettingsLock: boolean = false;

    dashboard: Array<GridsterItem>;
    cardViewType = ViewType.cards;
    svgViewType = ViewType.svg;
    mapsViewType = ViewType.maps;
    shapesGrps = [];
    private gaugesRef = {};

    private subscriptionSave: Subscription;
    private subscriptionLoad: Subscription;
    private destroy$ = new Subject<void>();

    constructor(private projectService: ProjectService,
        private winRef: WindowRef,
        public dialog: MatDialog,
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        public gaugesManager: GaugesManager,
        private viewContainerRef: ViewContainerRef,
        private resolver: ComponentFactoryResolver,
        private libWidgetsService: LibWidgetsService,
        private playRestrictionsService: PlayRestrictionsService,
        private mdIconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer) {
        mdIconRegistry.addSvgIcon('group', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/group.svg'));
        mdIconRegistry.addSvgIcon('to_bottom', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/to-bottom.svg'));
        mdIconRegistry.addSvgIcon('to_top', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/to-top.svg'));
    }

    //#region Implemented onInit / onAfterInit event
    /**
     * Init Save Project event and clear gauge memory (to manage event signal/gauge)
     */
    ngOnInit() {
        try {
            this.subscriptionSave = this.projectService.onSaveCurrent.subscribe((mode: SaveMode) => {
                if (mode === SaveMode.Current) {
                    this.onSaveProject();
                } else if (mode === SaveMode.SaveAs) {
                    this.projectService.saveAs();
                } else if (mode === SaveMode.Save) {
                    this.onSaveProject(true);
                }
            });
            this.gaugesManager.clearMemory();
        } catch (err) {
            console.error(err);
        }

        this.libWidgetsService.svgWidgetSelected$.pipe(
            switchMap(widgetPath =>
                fetch(widgetPath).then(response =>
                    response.text().then(content => ({ content, widgetPath }))
                )
            ),
            takeUntil(this.destroy$)
        ).subscribe(({ content, widgetPath }) => {
            localStorage.setItem(widgetPath, content);
            this.ctrlInitParams = widgetPath;
            this.setMode('own_ctrl-image');
        });
    }

    /**
     * after init event
     */
    ngAfterViewInit() {
        this.myInit();
        this.setMode('select');
        let hmi = this.projectService.getHmi();
        if (hmi) {
            this.loadHmi();
        }
        this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(load => {
            this.loadHmi();
        }, error => {
            console.error('Error loadHMI');
        });
        this.changeDetector.detectChanges();
    }

    ngOnDestroy() {
        try {
            if (this.subscriptionSave) {
                this.subscriptionSave.unsubscribe();
            }
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
        } catch (e) {
            console.error(e);
        }
        this.onSaveProject();
        this.destroy$.next(null);
        this.destroy$.complete();
    }
    //#endregion

    //#region General private function
    /**
     * Init, first init the svg-editor component
     */
    private myInit() {
        try {
            // first init svg-editor component
            mypathseg.initPathSeg();
            mybrowser.initBrowser();
            mysvgutils.initSvgutils();
            myselect.initSelect();
            mydraw.initDraw();
            mysvgcanvas.initSvgCanvas();
            // init svg-editor
            let toinit = mysvgeditor.initSvgEditor($,
                (selected) => {
                    this.isAnySelected = (selected);
                    this.onSelectedElement(selected);
                    this.getGaugeSettings(selected);
                    this.checkSelectedGaugeSettings();
                },
                (type, args) => {
                    this.onExtensionLoaded(args);
                    this.clearSelection();
                    if (type === 'shapes') {
                        this.setShapes();
                    }
                },
                (type, color) => {
                    if (type === 'fill') {
                        this.colorFill = color;
                        this.setFillColor(this.colorFill);
                        this.checkMySelectedToSetColor(this.colorFill, null, this.winRef.nativeWindow.svgEditor.getSelectedElements());
                    } else if (type === 'stroke') {
                        this.colorStroke = color;
                        this.checkMySelectedToSetColor(null, this.colorStroke, this.winRef.nativeWindow.svgEditor.getSelectedElements());
                        // Update stroke color input when stroke color changes
                        const strokeColorInput = document.getElementById('stroke_color') as HTMLInputElement;
                        if (strokeColorInput && color) {
                            strokeColorInput.value = color;
                            strokeColorInput.style.backgroundColor = color;
                        }
                    }
                },
                (eleadded) => {
                    let ga: GaugeSettings = this.getGaugeSettings(eleadded, this.ctrlInitParams);
                    this.checkGaugeAdded(ga);
                    // Don't auto-switch to select mode for text elements
                    if (eleadded?.tagName?.toLowerCase() !== 'text') {
                        setTimeout(() => {
                            this.setMode('select', false);
                        }, 700);
                    }
                    this.checkSvgElementsMap(true);
                },
                (eleremoved) => {
                    this.onRemoveElement(eleremoved);
                    this.checkSvgElementsMap(true);
                },
                (eleresized) => {
                    if (eleresized && eleresized.id) {
                        let ga: GaugeSettings = this.getGaugeSettings(eleresized);
                        this.gaugesManager.checkElementToResize(ga, this.resolver, this.viewContainerRef, eleresized.size);
                    }
                },
                (copiedPasted) => {
                    this.onCopyAndPaste(copiedPasted);
                },
                () => { // onGroupChanged
                    this.checkSvgElementsMap(true);
                }
            );
            console.log('myInit');
            this.winRef.nativeWindow.svgEditor.init();
            $(initContextmenu);

            // Setup observer to auto-switch to select tool after drawing basic shapes
            this.setupSvgElementObserver();

        } catch (err) {
            console.error(err);
        }
        this.setFillColor(this.colorFill);
        this.setFillColor(this.colorStroke);
    }

    /**
     * Setup global mouseup listener to detect when drawing is complete and auto-switch to select tool
     */
    private setupSvgElementObserver() {
        setTimeout(() => {
            let isDrawing = false;
            let drawingTool = '';

            // Use document-level event listeners to capture all mouse events
            const mousedownHandler = (event: MouseEvent) => {
                if (this.currentMode !== 'select' && this.currentMode !== '') {
                    // Check if the mousedown is within the SVG canvas area
                    const target = event.target as Element;
                    console.log('Mousedown target:', target?.tagName, target?.id, target?.className);

                    // Check various possible SVG-related targets
                    const isSvgTarget = target && (
                        target.closest('#svgcontent') ||
                        target.id === 'svgcontent' ||
                        target.closest('svg') ||
                        target.tagName === 'svg' ||
                        target.closest('#svgcanvas') ||
                        target.id === 'svgcanvas' ||
                        target.closest('.svg-editor') ||
                        target.classList?.contains('svg-editor')
                    );

                    if (isSvgTarget) {
                        isDrawing = true;
                        drawingTool = this.currentMode;
                        console.log('Drawing started with tool:', this.currentMode);
                    } else {
                        console.log('Target not in SVG area');
                    }
                }
            };

            const mouseupHandler = (event: MouseEvent) => {
                console.log('Global mouseup detected, isDrawing:', isDrawing, 'tool:', drawingTool);
                if (isDrawing && drawingTool !== 'select' && drawingTool !== '') {
                    console.log('Drawing completed with tool:', drawingTool);
                    // Small delay to ensure the shape is fully created before switching
                    setTimeout(() => {
                        if (drawingTool !== 'text') {
                            this.setMode('select', false);
                            isDrawing = false;
                        }

                        drawingTool = '';
                    }, 150);
                }
            };

            // Add global listeners
            document.addEventListener('mousedown', mousedownHandler, true);
            document.addEventListener('mouseup', mouseupHandler, true);

            console.log('Global mouse listeners setup complete');
        }, 1000); // Delay to ensure SVG editor is fully initialized
    }

    /**
     * Search SVG elements in View/Template, fill into select box and select the current svg element selected
     * @param loadSvgElement
     */
    checkSvgElementsMap(loadSvgElement = false) {
        if (loadSvgElement) {
            const currentItems = (this.currentView || this.currentTemplate)?.items || {};
            this.svgElements = Array.from(document.querySelectorAll('g, text, line, rect, image, path, circle, ellipse'))
                .filter((svg: any) => svg.attributes?.type?.value?.startsWith('svg-ext') ||
                    (svg.id?.startsWith('svg_') && !svg.parentNode?.attributes?.type?.value?.startsWith('svg-ext')))
                .map(ele => <ISvgElement>{ id: ele.id, name: currentItems[ele.id]?.name });
        }
        this.svgElementSelected = this.svgElements.find(se => se.id === this.selectedElement?.id);
    }

    /**
     * Selected in select box will be selected in editor
     */
    onSvgElementSelected(value: ISvgElement) {
        this.clearSelection();
        this.winRef.nativeWindow.svgEditor.selectOnly([document.getElementById(value.id)], true);
    }

    onSvgElementPreview(value: IElementPreview) {//value: ISvgElement, preview: boolean) {
        let elem = document.getElementById(value.element?.id);
        let rect: DOMRect = elem?.getBoundingClientRect();
        if (elem && rect) {
            this.svgPreview.nativeElement.style.width = `${rect.width}px`;
            this.svgPreview.nativeElement.style.height = `${rect.height}px`;
            this.svgPreview.nativeElement.style.top = `${rect.top}px`;
            this.svgPreview.nativeElement.style.left = `${rect.left}px`;
        }
        this.svgPreview.nativeElement.style.display = (value.preview) ? 'flex' : 'none';
    }

    /**
     * Load the hmi resource and bind it
     */
    private loadHmi() {
        this.gaugesManager.initGaugesMap();
        this.currentView = null;
        this.hmi = this.projectService.getHmi();

        // Initialize templates array if not exist
        if (!this.hmi.templates) {
            this.hmi.templates = [];
        }

        // 取得允許的視圖列表（過濾掉用戶無權限的視圖）
        const allowedViewsResult = this.playRestrictionsService.allowedViews$.getValue();
        let allowedViews = this.hmi.views || [];
        if (!allowedViewsResult.isSuperAdmin && allowedViewsResult.restrictedViews?.length > 0) {
            allowedViews = this.hmi.views.filter(view => !allowedViewsResult.restrictedViews.includes(view.id));
        }

        // check new hmi
        if (!this.hmi.views || this.hmi.views.length <= 0) {
            this.hmi.views = [];
            this.addView();
            // this.selectView(this.hmi.views[0].name);
        } else if (allowedViews.length <= 0) {
            // 用戶沒有權限查看任何視圖
            console.warn('No views allowed for current user');
        } else {
            let oldsel = localStorage.getItem('@frango.webeditor.currentview');
            if (!oldsel && allowedViews.length) {
                oldsel = allowedViews[0].name;
            }
            // 在允許的視圖中尋找上次選擇的視圖
            for (let i = 0; i < allowedViews.length; i++) {
                if (allowedViews[i].name === oldsel && allowedViews[i].type !== ViewType.maps) {
                    this.onSelectView(allowedViews[i]);
                    break;
                }
            }
            // 如果上次選擇的視圖不在允許列表中，選擇第一個允許的視圖
            if (!this.currentView && allowedViews.length > 0) {
                this.onSelectView(allowedViews[0]);
            }
        }
        this.hmi.layout = <LayoutSettings>Utils.mergeDeep(new LayoutSettings(), this.hmi.layout);

        // check and set start page
        if (!this.hmi.layout.start && this.hmi.views.length > 0) {
            this.hmi.layout.start = this.hmi.views[0].id;
        }
        this.loadPanelState();
        this.isLoading = false;
    }

    /**
     * Set or Add the View to Project
     * Save the View to Server
     */
    private saveView(view: View, notify = false) {
        this.projectService.setView(view, notify);
    }

    /**
     * Remove the View from Project
     * Remove the View from Server
     * @param view
     */
    private removeView(view: View) {
        this.projectService.removeView(view);
    }

    private getContent() {
        if (!this.currentView && !this.currentTemplate) {
            return '';
        }
        const view = this.currentView || this.currentTemplate;
        if (view.type === ViewType.cards) {
            view.svgcontent = this.cardsview.getContent();
            return view.svgcontent;
        } else if (view.type === ViewType.maps) {
            return view.svgcontent;
        }
        return this.winRef.nativeWindow.svgEditor.getSvgString();
    }

    /**
     * Take shapes from svg-editor to show in panel
     */
    private setShapes() {
        let temp = this.winRef.nativeWindow.svgEditor.getShapes();
        let grps = [];
        Object.keys(temp).forEach(grpk => {
            grps.push({ name: grpk, shapes: temp[grpk] });
        }),
            this.shapesGrps = grps;
    }

    /**
     * get gauge settings from current view items, if not exist create void settings from GaugesManager
     * @param ele gauge id
     */
    getGaugeSettings(ele, initParams: any = null): GaugeSettings {
        const currentContext = this.currentView || this.currentTemplate;
        if (ele && currentContext) {
            // Ensure items object exists
            if (!currentContext.items) {
                currentContext.items = {};
            }
            if (currentContext.items[ele.id]) {
                return currentContext.items[ele.id];
            }
            let gs = this.gaugesManager.createSettings(ele.id, ele.type);
            if (initParams) {
                gs.property = new GaugeProperty();
                gs.property.address = initParams;
            }
            return gs;
        }
        return null;
    }

    /**
     * search gauge settings on all views items, if not exist create void settings from GaugesManager
     * @param ele gauge element
     */
    private searchGaugeSettings(ele): GaugeSettings {
        if (ele) {
            const currentContext = this.currentView || this.currentTemplate;
            if (currentContext) {
                if (currentContext.items[ele.id]) {
                    return currentContext.items[ele.id];
                }
            }
            for (var i = 0; i < this.hmi.views.length; i++) {
                if (this.hmi.views[i].items[ele.id]) {
                    return this.hmi.views[i].items[ele.id];
                }
            }
            if (this.hmi.templates) {
                for (var i = 0; i < this.hmi.templates.length; i++) {
                    if (this.hmi.templates[i].items[ele.id]) {
                        return this.hmi.templates[i].items[ele.id];
                    }
                }
            }
            return this.gaugesManager.createSettings(ele.id, ele.type);
        }
        return null;
    }

    /**
     * add the gauge settings to the current view items list
     * @param ga GaugeSettings
     */
    private setGaugeSettings(ga) {
        if (ga.id) {
            const currentContext = this.currentView || this.currentTemplate;
            if (currentContext) {
                currentContext.items[ga.id] = ga;
            }
        } else {
            console.error('!TOFIX', ga);
        }
    }

    /**
     * check the gauge in current view of element
     * @param ele element to check
     */
    private checkGaugeInView(ele) {
        let g = this.getGaugeSettings(ele);
        if (!g) {

        }
    }

    /**
     * check and set the color panel with selected element
     * @param ele selected element
     */
    private checkColors(ele) {
        let eles = this.winRef.nativeWindow.svgEditor.getSelectedElements();
        let clrfill = null;
        let clrstroke = null;
        if (eles && (eles.length <= 1 || !eles[1]) && eles[0]) {
            // check for gauge fill and stroke color
            let colors = { fill: clrfill, stroke: clrstroke };
            if (GaugesManager.checkGaugeColor(ele, eles, colors)) {
                if (colors.fill) {
                    this.colorFill = colors.fill;
                }
                if (colors.stroke) {
                    this.colorStroke = colors.stroke;
                }
            } else {
                if (eles[0].attributes['fill']) {
                    clrfill = eles[0].attributes['fill'].value;
                    this.colorFill = clrfill;
                }
                if (eles[0].attributes['stroke']) {
                    clrstroke = eles[0].attributes['stroke'].value;
                    this.colorStroke = clrstroke;
                }
                // this.setFillColor(this.colorFill);
            }
        }
    }

    /**
     * return the fill color of svg element 'g'
     * @param eleId
     */
    private getFillColor(eleId) {
        if (eleId) {
            let ele = document.getElementById(eleId);
            if (ele) {
                return ele.getAttribute('fill');
            }
        }
    }

    /**
     * load the view to svg-editor and canvas
     * @param view view to load
     */
    private loadView(view: View) {
        if (view) {
            this.clearEditor();
            if (this.isSvgEditMode(this.editorMode)) {
                let svgcontent = '';
                // Use the passed view object directly instead of looking up by name
                // This prevents confusion between views and templates with the same name
                let v = view;
                if (v && v.svgcontent) {
                    svgcontent = v.svgcontent;
                }
                if (!svgcontent || svgcontent.length <= 0) {
                    svgcontent = '<svg id="' + view.name + '" width="' + view.profile.width + '" height="' + view.profile.height +
                        '" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
                        '<filter id="blur-filter" x="-3" y="-3" width="200" height="200"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>' +
                        '<g><title>Layer 1</title></g></svg>';
                }
                if (this.winRef.nativeWindow.svgEditor) {
                    this.winRef.nativeWindow.svgEditor.setDocProperty(view.name, view.profile.width, view.profile.height, view.profile.bkcolor, view.profile.bkimage);
                    this.winRef.nativeWindow.svgEditor.setSvgString(svgcontent);
                }

                // check gauge to init
                this.gaugesRef = {};
                setTimeout(() => {
                    if (v && v.items) {
                        for (let key in v.items) {
                            let ga: GaugeSettings = this.getGaugeSettings(v.items[key]);
                            this.checkGaugeAdded(ga);
                        }
                    }
                    this.winRef.nativeWindow.svgEditor.refreshCanvas();
                    this.checkSvgElementsMap(true);
                    this.winRef.nativeWindow.svgEditor.resetUndoStack();
                }, 500);
            } else if (this.isCardsEditMode(this.editorMode) && this.cardsview) {
                this.cardsview.view = view;
                this.cardsview.reload();
            } else if (this.isMapsEditMode(this.editorMode) && this.mapsView) {
                this.mapsView.view = view;
                this.mapsView.reload();
            }
        }
    }

    private isSvgEditMode(editMode: EditorModeType) {
        return editMode !== EditorModeType.CARDS && editMode !== EditorModeType.MAPS;
    }

    private isCardsEditMode(editMode: EditorModeType) {
        return editMode === EditorModeType.CARDS;
    }

    private isMapsEditMode(editMode: EditorModeType) {
        return editMode === EditorModeType.MAPS;
    }

    /**
     * get view from hmi views list
     * @param name view name
     */
    private getView(name) {
        // Search in views
        for (var i = 0; i < this.hmi.views.length; i++) {
            if (this.hmi.views[i].name === name) {
                return this.hmi.views[i];
            }
        }
        // Search in templates
        if (this.hmi.templates) {
            for (var i = 0; i < this.hmi.templates.length; i++) {
                if (this.hmi.templates[i].name === name) {
                    return this.hmi.templates[i];
                }
            }
        }
        return null;
    }

    getViewsSorted() {
        return this.hmi.views.sort((a, b) => {
            if (a.name > b.name) { return 1; }
            return -1;
        });
    }
    //#endregion

    //#region Cards Widget
    editCardsWidget(item: any) {
        let exist: string[] = this.cardsview.getWindgetViewName();
        if (item.card.data && exist.indexOf(item.card.data) >= 0) {
            exist = exist.filter((n) => n !== item.card.data);
        }
        let cardType = ViewType.cards;
        let views = this.hmi.views.filter((v) => v.type !== cardType && exist.indexOf(v.name) < 0).map((v) => v.name);
        let dialogRef = this.dialog.open(CardConfigComponent, {
            position: { top: '60px' },
            data: <CardConfigType>{
                item: JSON.parse(JSON.stringify(item)),
                views: views
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                item.card = result.card;
                this.onSaveProject();
                this.cardsview.render();
            }
        });
    }

    addCard() {
        this.cardsview.addCardsWidget();
    }

    saveCards(dashboard) {
    }
    // #region

    //#region Svg-editor event and function interface
    /**
     * set the mode to svg-editor (line,text,...)
     * @param mode mode to set
     */
    setMode(mode: string, clearSelection: boolean = true) {
        this.currentMode = mode;
        if (clearSelection) {
            this.clearSelection();
            this.checkFillAndStrokeColor();
        }
        this.winRef.nativeWindow.svgEditor.clickToSetMode(mode);
    }

    /**
     * check with the current mode
     * @param mode mode to check
     */
    isModeActive(mode) {
        return (this.currentMode === mode);
    }

    /**
     * clear svg-editor and the canvas
     */
    private clearEditor() {
        if (this.winRef.nativeWindow.svgEditor) {
            this.winRef.nativeWindow.svgEditor.clickClearAll();
        }
    }

    /**
     * check if fill and stroke not the same color is, text and label set all to black
     */
    private checkFillAndStrokeColor() {
        if (this.colorFill && this.colorStroke && this.colorFill === this.colorStroke) {
            this.setFillColor(this.colorDefault.fill);
            this.setStrokeColor(this.colorDefault.stroke);
        }
    }

    /**
     * event from svg-editor by new selection svg element
     * @param event svg element
     */
    private onSelectedElement(elems) {
        this.selectedElement = null;
        try {
            // to remove some strange effects
            if (document.activeElement !== document.body) { (document.activeElement as HTMLElement).blur(); }
        } catch (e) { }
        if (elems) {
            if (elems.length <= 1) {
                this.selectedElement = elems[0];
                this.selectedElement.type = elems[0].type || 'svg-ext-shapes-' + (this.currentMode || 'default');
                this.checkColors(this.selectedElement);
                this.checkGaugeInView(this.selectedElement);
            }
        }
        this.checkSvgElementsMap(false);
        if (this.sidePanel.opened) {
            this.sidePanel.toggle();
        }
    }

    /**
     * event from svg-editor: for every loaded extension
     * @param args
     */
    private onExtensionLoaded(args) {
    }

    /**
     * event from svg-editor: change fill color
     * @param event color code
     */
    onChangeFillColor(event) {
        this.setFillColor(event);
        this.checkMySelectedToSetColor(this.colorFill, null, this.winRef.nativeWindow.svgEditor.getSelectedElements());
    }

    /**
     * event change stroke color (from bottom color panel)
     * @param event color code
     */
    onChangeStrokeColor(event) {
        this.setStrokeColor(event);
        this.checkMySelectedToSetColor(null, this.colorStroke, this.winRef.nativeWindow.svgEditor.getSelectedElements());
    }

    private onCopyAndPaste(copiedPasted: CopiedAndPasted) {
        if (copiedPasted?.copy?.length && copiedPasted?.past?.length) {
            const copied = copiedPasted.copy.filter(element => element !== null && !element?.symbols);
            const pasted = copiedPasted.past.filter(element => element !== null);
            if (copied.length == copiedPasted.past.length) {
                let names = Object.values(this.currentView.items).map(gs => gs.name);
                for (let i = 0; i < copied.length; i++) {
                    let copiedIdsAndTypes = Utils.getInTreeIdAndType(copied[i]);
                    let pastedIdsAndTypes = Utils.getInTreeIdAndType(pasted[i]);

                    // Handle image elements without type attribute
                    if (copiedIdsAndTypes.length === 0 && copied[i].tagName.toLowerCase() === 'image') {
                        const copiedId = copied[i].getAttribute('id');
                        if (copiedId) {
                            // Search for the gauge settings to get the type
                            const gaSrc = this.searchGaugeSettings({ id: copiedId, type: null });
                            if (gaSrc) {
                                copiedIdsAndTypes = [{ id: copiedId, type: gaSrc.type }];
                            }
                        }
                    }

                    if (pastedIdsAndTypes.length === 0 && pasted[i].tagName.toLowerCase() === 'image') {
                        const pastedId = pasted[i].getAttribute('id');
                        if (pastedId && copiedIdsAndTypes.length > 0) {
                            // Use the same type as the copied element
                            pastedIdsAndTypes = [{ id: pastedId, type: copiedIdsAndTypes[0].type }];
                        }
                    }

                    if (copiedIdsAndTypes.length === pastedIdsAndTypes.length) {
                        for (let j = 0; j < copiedIdsAndTypes.length; j++) {
                            if (copiedIdsAndTypes[j].id && pastedIdsAndTypes[j].id && copiedIdsAndTypes[j].type === pastedIdsAndTypes[j].type) {
                                let gaSrc: GaugeSettings = this.searchGaugeSettings(copiedIdsAndTypes[j]);
                                if (gaSrc) {
                                    let gaDest: GaugeSettings = this.gaugesManager.createSettings(pastedIdsAndTypes[j].id, pastedIdsAndTypes[j].type);
                                    gaDest.name = Utils.getNextName(GaugesManager.getPrefixGaugeName(pastedIdsAndTypes[j].type), names);
                                    gaDest.property = JSON.parse(JSON.stringify(gaSrc.property));
                                    gaDest.hide = gaSrc.hide;
                                    this.setGaugeSettings(gaDest);
                                    this.checkGaugeAdded(gaDest);
                                }
                            } else {
                                console.error(`Inconsistent elements!`, `${copiedIdsAndTypes[j]}`, `${pastedIdsAndTypes[j]}`);
                            }
                        }
                    } else {
                        let copyGaugeSettings = this.searchGaugeSettings(copiedIdsAndTypes[i]);
                        if (copyGaugeSettings) {
                            let gaugeSettingsDest: GaugeSettings = this.gaugesManager.createSettings(pastedIdsAndTypes[i].id, pastedIdsAndTypes[i].type);
                            gaugeSettingsDest.name = Utils.getNextName(GaugesManager.getPrefixGaugeName(pastedIdsAndTypes[i].type), names);

                            // First deep clone all properties to ensure everything is copied
                            gaugeSettingsDest.property = JSON.parse(JSON.stringify(copyGaugeSettings.property));

                            if (copyGaugeSettings.property?.type === HtmlImageComponent.propertyWidgetType) {
                                // Handle widget type images with special GUID replacement
                                const svgGuid = Utils.getShortGUID('', '_');
                                gaugeSettingsDest.property = Utils.replaceStringInObject(gaugeSettingsDest.property,
                                    copyGaugeSettings.property.svgGuid,
                                    svgGuid);
                            }

                            gaugeSettingsDest.hide = copyGaugeSettings.hide;
                            this.setGaugeSettings(gaugeSettingsDest);
                            this.checkGaugeAdded(gaugeSettingsDest);
                        } else {
                            console.error('Between copied and pasted there are inconsistent elements!');
                        }
                    }
                }
                this.checkSvgElementsMap(true);
            }
        }
    }

    /**
     * event from svg-editor: svg element removed
     * @param ele svg element
     */
    private onRemoveElement(ele: any) {
        if (this.currentView && this.currentView.items && ele) {
            for (let i = 0; i < ele.length; i++) {
                if (this.currentView.items[ele[i].id]) {
                    delete this.currentView.items[ele[i].id];
                    if (this.gaugesRef.hasOwnProperty(ele[i].id)) {
                        if (this.gaugesRef[ele[i].id].ref && this.gaugesRef[ele[i].id].ref['ngOnDestroy']) {
                            try {
                                this.gaugesRef[ele[i].id].ref['ngOnDestroy']();
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * set the fill color (to svg-editor)
     * @param event color code
     */
    private setFillColor(event) {
        let color = event;
        if (color === 'transparent') {
            // Handle transparent color specially
            if (this.winRef.nativeWindow.svgEditor) {
                this.winRef.nativeWindow.svgEditor.setColor('none', 0, 'fill');
            }
        } else {
            if (color.charAt(0) === '#') { color = color.slice(1); }
            let alfa = 100;
            if (this.winRef.nativeWindow.svgEditor) {
                this.winRef.nativeWindow.svgEditor.setColor(color, alfa, 'fill');
            }
        }
        // this.fillcolor;
    }

    /**
     * set stroke color (to svg-editor)
     * @param event color code
     */
    setStrokeColor(event) {
        let color = event;
        if (color.charAt(0) === '#') { color = color.slice(1); }
        let alfa = 100;
        this.winRef.nativeWindow.svgEditor.setColor(color, alfa, 'stroke');
        // this.fillcolor;
    }

    /**
     * set the marker to selected element (->, <->, <-)
     * @param id marker id (start,mid,end)
     * @param marker marker type
     */
    onSetMarker(id, marker) {
        if (marker >= 0) {
            this.winRef.nativeWindow.svgEditor.setMarker(id, marker);
        }
    }

    /**
     * align the selected element
     * @param letter align type (left,center,right,top,middle,bottom)
     */
    onAlignSelected(letter: string) {
        this.winRef.nativeWindow.svgEditor.alignSelectedElements(letter.charAt(0));
    }

    /**
     * select the zoom area function
     */
    onZoomSelect() {
        this.winRef.nativeWindow.svgEditor.clickZoom();
    }

    /**
     * show grid in canvas
     */
    onShowGrid() {
        this.gridOn = this.gridOn = !this.gridOn;
        this.winRef.nativeWindow.svgEditor.clickExtension('view_grid');
        this.winRef.nativeWindow.svgEditor.enableGridSnapping(this.gridOn);
    }

    /**
     * add image to view
     * @param event selected file
     */
    onSetImage(event) {
        if (event.target.files) {
            let filename = event.target.files[0].name;
            this.imagefile = 'assets/images/' + event.target.files[0].name;
            let fileToUpload = { type: filename.split('.').pop().toLowerCase(), name: filename.split('/').pop(), data: null };
            let self = this;
            if (fileToUpload.type === 'svg') {
                let reader = new FileReader();
                reader.onloadend = function (e: any) {
                    localStorage.setItem(fileToUpload.name, reader.result.toString());
                    self.ctrlInitParams = fileToUpload.name;
                    self.setMode('own_ctrl-image');
                };
                reader.readAsText(event.target.files[0]);
            } else {
                this.getBase64Image(event.target.files[0], function (imgdata) {
                    if (self.winRef.nativeWindow.svgEditor.setUrlImageToAdd) {
                        self.winRef.nativeWindow.svgEditor.setUrlImageToAdd(imgdata);
                    }
                    self.setMode('image');
                });
            }
        }
    }

    /**
     * add image to view
     * the image will be upload into server/_appdata/_upload_files
     * @param event selected file
     */
    onSetImageAsLink(event) {
        if (event.target.files) {
            let filename = event.target.files[0].name;
            let fileToUpload = { type: filename.split('.').pop().toLowerCase(), name: filename.split('/').pop(), data: null };
            let reader = new FileReader();
            this.ctrlInitParams = null;
            reader.onload = () => {
                try {
                    fileToUpload.data = reader.result;
                    this.projectService.uploadFile(fileToUpload).subscribe((result: UploadFile) => {
                        this.ctrlInitParams = result.location;
                        this.setMode('own_ctrl-image');
                    });
                } catch (err) {
                    console.error(err);
                }
            };
            if (fileToUpload.type === 'svg') {
                reader.readAsText(event.target.files[0]);
            } else {
                reader.readAsDataURL(event.target.files[0]);
            }
        }
    }

    /**
     * convert image file to code to attach in svg
     * @param file image file
     * @param callback event for end load image
     */
    private getBase64Image(file, callback) {
        var fr = new FileReader();
        fr.onload = function () {
            callback(fr.result);
        };
        fr.readAsDataURL(file);
    }

    /**
     * set stroke to svg selected (joinmieter, joinround, joinbevel, capbutt, capsquare, capround)
     * @param option stroke type
     */
    onSetStrokeOption(option) {
        this.winRef.nativeWindow.svgEditor.setStrokeOption(option);
    }

    /**
     * set shadow to svg selected
     * @param event shadow
     */
    onSetShadowOption(event) {
        this.winRef.nativeWindow.svgEditor.onSetShadowOption(event);
    }

    /**
     * set font to svg selected
     * @param font font family
     */
    onFontFamilyChange(font) {
        this.winRef.nativeWindow.svgEditor.setFontFamily(font);
    }

    /**
     * align the svg text (left,middle,right)
     * @param align type
     */
    onTextAlignChange(align) {
        this.winRef.nativeWindow.svgEditor.setTextAlign(align);
    }

    /**
     * set input border color
     */
    onInputBorderColorChange(event) {
        const color = event.target.value;
        if (this.winRef.nativeWindow.svgEditor && typeof this.winRef.nativeWindow.svgEditor.setInputBorderColor === 'function') {
            this.winRef.nativeWindow.svgEditor.setInputBorderColor(color);
        } else {
            console.error('setInputBorderColor function not found. Available methods:', Object.keys(this.winRef.nativeWindow.svgEditor || {}).filter(k => k.startsWith('set')));
        }
    }

    /**
     * set input border width
     */
    onInputBorderWidthChange(event) {
        const width = parseFloat(event.target.value);
        if (this.winRef.nativeWindow.svgEditor && typeof this.winRef.nativeWindow.svgEditor.setInputBorderWidth === 'function') {
            this.winRef.nativeWindow.svgEditor.setInputBorderWidth(width);
        } else {
            console.error('setInputBorderWidth function not found');
        }
    }

    /**
     * set input border style
     */
    onInputBorderStyleChange(event) {
        const style = event.target.value;
        if (this.winRef.nativeWindow.svgEditor && typeof this.winRef.nativeWindow.svgEditor.setInputBorderStyle === 'function') {
            this.winRef.nativeWindow.svgEditor.setInputBorderStyle(style);
        } else {
            console.error('setInputBorderStyle function not found');
        }
    }

    /**
     * set stroke color for all shapes
     */
    onStrokeColorChange(event) {
        const color = event.target.value;
        // setColor(colorValue, alpha, type)
        // - colorValue: color without # (setPaint will add it)
        // - alpha: 0-100 percentage (will be divided by 100 in setPaint)
        // - type: 'stroke' or 'fill'
        if (this.winRef.nativeWindow.svgEditor && this.winRef.nativeWindow.svgEditor.setColor) {
            const colorValue = color.startsWith('#') ? color.substr(1) : color;
            this.winRef.nativeWindow.svgEditor.setColor(colorValue, 100, 'stroke');
            // Update background color
            event.target.style.backgroundColor = color;
        } else {
            console.error('svgEditor.setColor function not found');
        }
    }

    checkMySelectedToSetColor(bkcolor, color, elems) {
        GaugesManager.initElementColor(bkcolor, color, elems);
    }

    /**
     * Prevent drag events from propagating when mouse is over the right bar
     */
    onRightBarMouseDown(event: MouseEvent) {
        // Stop propagation to prevent SVG canvas from receiving the mousedown event
        // This prevents dragging from starting when clicking on the right bar
        event.stopPropagation();
    }

    /**
     * Change the source of selected image element
     */
    onChangeImageSource(event) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const filename = file.name;
            const fileType = filename.split('.').pop().toLowerCase();

            // Get selected image element
            const selectedElements = this.winRef.nativeWindow.svgEditor.getSelectedElements();
            if (!selectedElements || selectedElements.length === 0 || selectedElements[0]?.tagName !== 'image') {
                console.error('No image element selected');
                return;
            }

            if (fileType === 'svg') {
                // Handle SVG files
                const reader = new FileReader();
                reader.onloadend = (e: any) => {
                    const svgData = reader.result.toString();
                    // Create data URL for SVG
                    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
                    const dataUrl = 'data:image/svg+xml;base64,' + svgBase64;
                    if (this.winRef.nativeWindow.svgEditor.setImageURL) {
                        this.winRef.nativeWindow.svgEditor.setImageURL(dataUrl);
                    }
                };
                reader.readAsText(file);
            } else {
                // Handle raster images (PNG, JPG, etc.)
                this.getBase64Image(file, (imgdata) => {
                    if (this.winRef.nativeWindow.svgEditor.setImageURL) {
                        this.winRef.nativeWindow.svgEditor.setImageURL(imgdata);
                    } else {
                        console.error('setImageURL function not found');
                    }
                });
            }
        }
    }

    /**
     * check and set the special gauge like ngx-uplot, ngx-gauge, ... if added
     * if return true then the GaugeSettings is changed have to set again
     * @param ga
     */
    checkGaugeAdded(ga: GaugeSettings) {
        let gauge = this.gaugesManager.initElementAdded(ga, this.resolver, this.viewContainerRef, false);
        if (gauge) {
            if (gauge !== true) {
                if (!this.gaugesRef.hasOwnProperty(ga.id)) {
                    this.gaugesRef[ga.id] = { type: ga.type, ref: gauge };
                }
            }
            this.setGaugeSettings(ga);
        }
    }

    /**
     * dialog to define hyperlink
     */
    onMakeHyperlink() {
        let dialogRef = this.dialog.open(DialogLinkProperty, {
            data: { url: 'https://' },
            position: { top: '60px' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.url) {
                this.winRef.nativeWindow.svgEditor.makeHyperlink(result.url);
            }
        });
    }
    //#endregion

    //#region Toolbar Top Events
    /**
     * save current project and launch the Test in new Windows 'lab'
     */
    async onStartCurrent() {
        if (this.currentView) {
            // Show loading mask
            this.isLoading = true;

            try {
                // Save current view and wait for completion
                this.currentView.svgcontent = this.getContent();
                await this.projectService.setViewAsync(this.currentView, false);

                // Hide loading mask and open window after save completes
                this.isLoading = false;
                this.winRef.nativeWindow.open('lab', 'MyTest', 'width=800,height=640,menubar=0');
            } catch (error) {
                // Hide loading mask on error
                this.isLoading = false;
                console.error('Error saving view:', error);
                // Still open window even if save fails
                this.winRef.nativeWindow.open('lab', 'MyTest', 'width=800,height=640,menubar=0');
            }
        } else {
            this.winRef.nativeWindow.open('lab', 'MyTest', 'width=800,height=640,menubar=0');
        }
    }
    //#endregion

    //#region Project Events
    /**
     * Save Project
     * Save the current View or Template
     */
    onSaveProject(notify = false) {
        if (this.currentView) {
            this.currentView.svgcontent = this.getContent();

            // Generate and upload thumbnail
            this.generateAndUploadThumbnail().then(thumbnailUrl => {
                this.currentView.thumbnail = thumbnailUrl;
                this.saveView(this.currentView, notify);
            }).catch(err => {
                console.error('Failed to generate/upload thumbnail:', err);
                // Save without thumbnail if generation fails
                this.saveView(this.currentView, notify);
            });
        } else if (this.currentTemplate) {
            this.currentTemplate.svgcontent = this.getContent();

            // Generate and upload thumbnail for template
            this.generateAndUploadThumbnail().then(thumbnailUrl => {
                this.currentTemplate.thumbnail = thumbnailUrl;
                this.saveTemplate(this.currentTemplate, notify);
            }).catch(err => {
                console.error('Failed to generate/upload thumbnail for template:', err);
                // Save without thumbnail if generation fails
                this.saveTemplate(this.currentTemplate, notify);
            });
        }
    }

    /**
     * Generate thumbnail from current SVG canvas and upload to server
     * @returns Promise with thumbnail URL
     */
    private generateAndUploadThumbnail(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Get the current view or template
                const currentContext = this.currentView || this.currentTemplate;
                if (!currentContext) {
                    reject('No current view or template');
                    return;
                }

                // Get the SVG content (prefer the one just saved in onSaveProject)
                let svgString = currentContext.svgcontent;
                if (!svgString && this.winRef?.nativeWindow?.svgEditor?.getSvgString) {
                    svgString = this.winRef.nativeWindow.svgEditor.getSvgString();
                }

                // Validate SVG content
                if (!svgString || svgString.length === 0) {
                    reject('No SVG content');
                    return;
                }

                // Remove foreignObject (HTML/canvas content) to avoid canvas tainting, then inline images and render
                const cleanedSvg = this.stripForeignObjects(svgString);
                this.inlineSvgImages(cleanedSvg).then((inlinedSvg) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    const blob = new Blob([inlinedSvg], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);

                    img.onload = () => {
                        try {
                            // Create canvas for thumbnail
                            const canvas = document.createElement('canvas');
                            const maxWidth = 300;
                            const maxHeight = 200;

                            // Calculate scaled dimensions maintaining aspect ratio
                            let width = img.width || currentContext.profile.width || 1920;
                            let height = img.height || currentContext.profile.height || 1080;

                            const scale = Math.min(maxWidth / width, maxHeight / height);
                            canvas.width = Math.max(1, Math.floor(width * scale));
                            canvas.height = Math.max(1, Math.floor(height * scale));

                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                URL.revokeObjectURL(url);
                                reject('Failed to get canvas context');
                                return;
                            }

                            // Fill with white background
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);

                            // Draw the image scaled down
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                            // Convert to base64 PNG
                            let thumbnailData: string;
                            try {
                                thumbnailData = canvas.toDataURL('image/png');
                            } catch (secErr) {
                                URL.revokeObjectURL(url);
                                reject(`Canvas export failed: ${secErr}`);
                                return;
                            }
                            URL.revokeObjectURL(url);

                            // Upload thumbnail to server
                            const fileName = `${currentContext.id}_thumbnail.png`;
                            const uploadData = {
                                name: fileName,
                                type: 'png',
                                data: thumbnailData
                            };

                            this.projectService.uploadFile(uploadData, 'thumbnails').subscribe(
                                (result) => {
                                    if (result && result.location) {
                                        resolve(result.location);
                                    } else {
                                        reject('Upload failed: no location returned');
                                    }
                                },
                                (error) => {
                                    reject(`Upload failed: ${error}`);
                                }
                            );
                        } catch (err) {
                            URL.revokeObjectURL(url);
                            reject(err);
                        }
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(url);
                        reject('Failed to load SVG image');
                    };

                    img.src = url;
                }).catch((inlineErr) => {
                    reject(`Inline images failed: ${inlineErr}`);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Remove all <foreignObject> nodes from the SVG to avoid security-taint when rasterizing.
     */
    private stripForeignObjects(svg: string): string {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            const nodes = Array.from(doc.querySelectorAll('foreignObject'));
            for (const n of nodes) {
                n.parentNode?.removeChild(n);
            }
            const serializer = new XMLSerializer();
            return serializer.serializeToString(doc.documentElement);
        } catch (e) {
            return svg;
        }
    }

    /**
     * Replace external <image> hrefs inside the SVG with data URLs to prevent canvas tainting.
     */
    private inlineSvgImages(svg: string): Promise<string> {
        return new Promise(async (resolve) => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svg, 'image/svg+xml');
                const images = Array.from(doc.querySelectorAll('image')) as SVGImageElement[];

                const fetchAsDataUrl = (url: string) => new Promise<string>(async (res, rej) => {
                    try {
                        // Ignore already inlined data URLs
                        if (!url || url.startsWith('data:')) { res(url); return; }
                        const response = await fetch(url, { credentials: 'same-origin' });
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => res(reader.result as string);
                        reader.onerror = (e) => rej(e);
                        reader.readAsDataURL(blob);
                    } catch (e) {
                        // Fallback to transparent pixel to avoid canvas tainting even if fetch fails
                        res('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3XvQkAAAAASUVORK5CYII=');
                    }
                });

                for (const img of images) {
                    const href = (img.getAttribute('href') || img.getAttribute('xlink:href')) as string;
                    if (href) {
                        const dataUrl = await fetchAsDataUrl(href);
                        if (img.hasAttribute('href')) {
                            img.setAttribute('href', dataUrl);
                        }
                        if (img.hasAttribute('xlink:href')) {
                            img.setAttribute('xlink:href', dataUrl);
                        }
                    }
                }
                const serializer = new XMLSerializer();
                resolve(serializer.serializeToString(doc.documentElement));
            } catch (_) {
                // On any parsing error, return original svg
                resolve(svg);
            }
        });
    }

    //#endregion

    //#region View Events (Add/Rename/Delete/...)
    onAddDoc() {
        let dialogRef = this.dialog.open(ViewPropertyComponent, {
            position: { top: '60px' },
            data: <ViewPropertyType & { newView: boolean }>{
                name: '',
                profile: new DocProfile(),
                type: ViewType.svg,
                existingNames: this.hmi.views.map((v) => v.name),
                newView: true,
                tags: []
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let view = new View(Utils.getShortGUID('v_'), result.type, result.name);
                view.profile = result.profile;
                view.tags = result.tags;
                this.hmi.views.push(view);
                this.onSelectView(view);
                this.saveView(this.currentView);
            }
        });
    }

    /**
     * Add View to Project with a default name View_[x]
     */
    addView(name?: string, type?: ViewType): string {
        if (this.hmi.views) {
            let nn = 'View_';
            let idx = 1;
            for (idx = 1; idx < this.hmi.views.length + 2; idx++) {
                let found = false;
                for (var i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].name === nn + idx) {
                        found = true;
                        break;
                    }
                }
                if (!found) { break; }
            }
            let v = new View(Utils.getShortGUID('v_'), type);
            if (name) {
                v.name = name;
            } else if (this.hmi.views.length <= 0) {
                v.name = 'MainView';
            } else {
                v.name = nn + idx;
                v.profile.bkcolor = '#ffffffff';
            }
            if (type === ViewType.cards) {
                v.profile.bkcolor = 'rgba(67, 67, 67, 1)';
            }
            this.hmi.views.push(v);
            this.onSelectView(v);
            this.saveView(this.currentView);
            return v.id;
        }
        return null;
    }

    /**
     * Clone the View, copy and change all ids
     * @param view
     */
    onCloneView(view: View) {
        if (view) {
            let nn = 'View_';
            let idx = 1;
            for (idx = 1; idx < this.hmi.views.length + 2; idx++) {
                let found = false;
                for (var i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].name === nn + idx) {
                        found = true;
                        break;
                    }
                }
                if (!found) { break; }
            }
            let torename = { content: JSON.stringify(view), id: '' };
            // change all gauge ids
            let idrenamed = [];
            for (let key in view.items) {
                torename.id = key;
                let newid = this.winRef.nativeWindow.svgEditor.renameSvgExtensionId(torename);
                idrenamed.push(newid);
            }
            let strv = this.winRef.nativeWindow.svgEditor.renameAllSvgExtensionId(torename.content, idrenamed);
            let v: View = JSON.parse(strv);
            v.id = 'v_' + Utils.getShortGUID();
            v.name = nn + idx;
            this.hmi.views.push(v);
            this.onSelectView(v);
            this.saveView(this.currentView);
        }
    }

    onViewPropertyChanged(view: View) {
        this.winRef.nativeWindow.svgEditor.setDocProperty(view.name, view.profile.width, view.profile.height, view.profile.bkcolor, view.profile.bkimage);
        this.onSelectView(view);
    }

    /**
     * select the view, save current vieww before
     * @param view selected view to load resource
     */
    onSelectView(view: View, force = true) {
        console.log('pass onSelectView');
        if (!force && this.currentView?.id === view?.id) {
            return;
        }
        console.log('pass onSelectView 2');
        if (this.currentView) {
            this.currentView.svgcontent = this.getContent();
            this.saveView(this.currentView);
        }
        // Save current template if switching from template to view
        else if (this.currentTemplate) {
            this.currentTemplate.svgcontent = this.getContent();
            this.saveTemplate(this.currentTemplate);
        } else {
            this.setFillColor(this.colorFill);
        }
        console.log('pass onSelectView 3');
        if (this.currentView) {
            this.saveView(this.currentView);
        }
        console.log('pass onSelectView 4');
        this.currentView = view;
        console.log('pass onSelectView 5');
        if (this.currentView.type === ViewType.cards) {
            this.editorMode = EditorModeType.CARDS;
        } else if (this.currentView.type === ViewType.maps) {
            this.editorMode = EditorModeType.MAPS;
        } else {
            this.editorMode = EditorModeType.SVG;
        }
        console.log('pass onSelectView 6');
        localStorage.setItem('@frango.webeditor.currentview', this.currentView.name);
        console.log('pass onSelectView 7');
        this.loadView(this.currentView);
    }

    /**
     * check with the current view
     * @param view view to check
     */
    isViewActive(view) {
        return (this.currentView && this.currentView.name === view.name);
    }

    /**
     * Import view from file (exported in json format [View name].json)
     */
    onImportView() {
        let ele = document.getElementById('viewFileUpload') as HTMLElement;
        ele.click();
    }

    /**
     * open Project event file loaded
     * @param event file resource
     */
    onViewFileChangeListener(event) {
        let text = [];
        let files = event.srcElement.files;
        let input = event.target;
        let reader = new FileReader();
        reader.onload = (data) => {
            let view = JSON.parse(reader.result.toString());
            if (this.projectService.verifyView(view)) {
                let idx = 1;
                let startname = view.name;
                let existView = null;
                while (existView = this.hmi.views.find((v) => v.name === view.name)) {
                    view.name = startname + '_' + idx++;
                }
                view.id = 'v_' + Utils.getShortGUID();
                this.hmi.views.push(view);
                this.onSelectView(view);
                this.saveView(this.currentView);
            }
            // this.projectService.setProject(prj, true);
        };

        reader.onerror = function () {
            let msg = 'Unable to read ' + input.files[0];
            // this.translateService.get('msg.project-load-error', {value: input.files[0]}).subscribe((txt: string) => { msg = txt });
            alert(msg);
        };
        reader.readAsText(input.files[0]);
        this.viewFileImportInput.nativeElement.value = null;
    }
    //#endregion

    //#region Template Events (Add/Clone/Convert/...)
    /**
     * Add Template to Project
     */
    onAddTemplate() {
        let dialogRef = this.dialog.open(ViewPropertyComponent, {
            position: { top: '60px' },
            data: <ViewPropertyType & { newView: boolean }>{
                name: '',
                profile: new DocProfile(),
                type: ViewType.svg,
                existingNames: this.hmi.templates.map((t) => t.name),
                newView: true,
                tags: []
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let template = new View(Utils.getShortGUID('t_'), result.type, result.name);
                template.profile = result.profile;
                template.tags = result.tags;
                this.hmi.templates.push(template);
                this.onSelectTemplate(template);
                this.saveTemplate(this.currentTemplate);
            }
        });
    }

    /**
     * Clone the Template, copy and change all ids
     * @param template
     */
    onCloneTemplate(template: View) {
        if (template) {
            let nn = 'Template_';
            let idx = 1;
            for (idx = 1; idx < this.hmi.templates.length + 2; idx++) {
                let found = false;
                for (var i = 0; i < this.hmi.templates.length; i++) {
                    if (this.hmi.templates[i].name === nn + idx) {
                        found = true;
                        break;
                    }
                }
                if (!found) { break; }
            }
            let torename = { content: JSON.stringify(template), id: '' };
            // change all gauge ids
            let idrenamed = [];
            for (let key in template.items) {
                torename.id = key;
                let newid = this.winRef.nativeWindow.svgEditor.renameSvgExtensionId(torename);
                idrenamed.push(newid);
            }
            let strv = this.winRef.nativeWindow.svgEditor.renameAllSvgExtensionId(torename.content, idrenamed);
            let t: View = JSON.parse(strv);
            t.id = 't_' + Utils.getShortGUID();
            t.name = nn + idx;
            this.hmi.templates.push(t);
            this.onSelectTemplate(t);
            this.saveTemplate(this.currentTemplate);
        }
    }

    /**
     * Template property changed
     * @param template
     */
    onTemplatePropertyChanged(template: View) {
        this.winRef.nativeWindow.svgEditor.setDocProperty(template.name, template.profile.width, template.profile.height, template.profile.bkcolor, template.profile.bkimage);
        this.onSelectTemplate(template);
    }

    /**
     * Select the template, save current view/template before
     * @param template selected template to load resource
     */
    onSelectTemplate(template: View, force = true) {
        if (!force && this.currentTemplate?.id === template?.id) {
            return;
        }
        // Save current view if switching from view to template
        if (this.currentView) {
            this.currentView.svgcontent = this.getContent();
            this.saveView(this.currentView);
        }
        // Save current template if switching from template to template
        if (this.currentTemplate) {
            this.currentTemplate.svgcontent = this.getContent();
            this.saveTemplate(this.currentTemplate);
        }
        // Switch to new template
        this.currentView = null;
        this.currentTemplate = template;
        localStorage.setItem('@frango.webeditor.currenttemplate', this.currentTemplate.name);
        this.loadView(this.currentTemplate);
    }

    /**
     * Convert template to view
     * @param template
     */
    async onConvertTemplateToView(template: View) {
        // Check if a view with the same name already exists
        const existingView = this.hmi.views.find(v => v.name === template.name);
        if (existingView) {
            // Show warning dialog
            let dialogRef = this.dialog.open(ConfirmDialogComponent, {
                position: { top: '60px' },
                data: <ConfirmDialogData>{
                    msg: this.translateService.instant('msg.view-name-exist'),
                    hideCancel: true
                }
            });
            return;
        }

        try {
            // Save current template if it's being edited
            if (this.currentTemplate && this.currentTemplate.id === template.id) {
                this.currentTemplate.svgcontent = this.getContent();
                await this.projectService.setTemplateAsync(this.currentTemplate, false);
            }

            // Call backend API to convert template to view
            this.projectService.convertTemplateToView(template.id).subscribe(
                (newView: View) => {
                    if (newView) {
                        // Note: projectService.convertTemplateToView already adds the view
                        // to hmi.views and removes the template from hmi.templates
                        this.onSelectView(newView);
                    }
                },
                (error) => {
                    console.error('Failed to convert template to view:', error);
                }
            );
        } catch (error) {
            console.error('Failed to save template before conversion:', error);
        }
    }

    /**
     * Save the Template to Server
     */
    private saveTemplate(template: View, notify = false) {
        this.projectService.setTemplate(template, notify);
    }

    /**
     * Remove the Template from Project
     * @param template
     */
    removeTemplate(template: View) {
        this.projectService.removeTemplate(template);
    }
    //#endregion

    //#region Panels State
    /**
     * Load the left panels state copied in localstorage
     */
    private loadPanelState() {
        let ps = localStorage.getItem('@frango.webeditor.panelsState');
        this.panelsState.enabled = true;
        if (ps) {
            this.panelsState = Utils.mergeDeep(this.panelsState, JSON.parse(ps));
        }
    }

    /**
     * Save the panels state in localstorage (after every toggled)
     */
    savePanelState() {
        if (this.panelsState.enabled) {
            if (this.panelsState.panelViewHeight < 100) {
                this.panelsState.panelViewHeight = 100;
            }
            localStorage.setItem('@frango.webeditor.panelsState', JSON.stringify(this.panelsState));
        }
    }
    //#endregion

    //#region Interactivity
    /**
     * to check from DOM and to control open close interaction panel
     * @param ele selected gauge element
     */
    isInteractivtyEnabled(ele) {
        if (ele && ele.type) {
            return this.gaugesManager.isGauge(ele.type);
        }
        return false;
    }

    /**
     * callback to open edit gauge property form (from GaugeBase)
     * @param event
     */
    onGaugeEdit(event) {
        this.openEditGauge(this.gaugePanelComponent?.settings, data => {
            this.setGaugeSettings(data);
        });
    }

    /**
     * callback to open edit gauge property form (from selected element context menu)
     */
    onGaugeEditEx() {
        setTimeout(() => {
            this.gaugePanelComponent.onEdit();
        }, 500);
    }

    isWithEvents(type) {
        return this.gaugesManager.isWithEvents(type);
    }

    isWithActions(type) {
        return this.gaugesManager.isWithActions(type);
    }

    /**
     * edit the gauges/chart settings property, the settings are composed from gauge id... and property
     * in property will be the result values saved
     *
     * @param settings
     * @param callback
     */
    openEditGauge(settings, callback) {
        if (!settings) {
            return;
        }
        let tempsettings = JSON.parse(JSON.stringify(settings));
        let hmi = this.projectService.getHmi();
        let dlgType = GaugesManager.getEditDialogTypeToUse(settings.type);
        let bitmaskSupported = GaugesManager.isBitmaskSupported(settings.type);
        let eventsSupported = this.isWithEvents(settings.type);
        let actionsSupported = this.isWithActions(settings.type);
        let defaultValue = GaugesManager.getDefaultValue(settings.type);
        const currentContext = this.currentView || this.currentTemplate;
        let names = Object.values(currentContext.items).map(gs => gs.name);
        // set default name
        if (!tempsettings.name) {
            tempsettings.name = Utils.getNextName(GaugesManager.getPrefixGaugeName(settings.type), names);
        }
        let dialogRef: any;
        let elementWithLanguageText;
        if (dlgType === GaugeDialogType.Chart) {
            this.gaugeDialog.type = dlgType;
            this.gaugeDialog.data = {
                settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                views: hmi.views, dlgType: dlgType, charts: this.projectService.getCharts(),
                names: names
            };
            if (!this.sidePanel.opened) {
                this.sidePanel.toggle();
            }
            this.reloadGaugeDialog = !this.reloadGaugeDialog;
            return;
        } else if (dlgType === GaugeDialogType.Graph) {
            this.gaugeDialog.type = dlgType;
            this.gaugeDialog.data = {
                settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                views: hmi.views, dlgType: dlgType, graphs: this.projectService.getGraphs(),
                names: names
            };
            if (!this.sidePanel.opened) {
                this.sidePanel.toggle();
            }
            this.reloadGaugeDialog = !this.reloadGaugeDialog;
            return;
        } else if (dlgType === GaugeDialogType.Iframe) {
            this.gaugeDialog.type = dlgType;
            this.gaugeDialog.data = {
                settings: tempsettings, dlgType: dlgType, names: names
            };
            if (!this.sidePanel.opened) {
                this.sidePanel.toggle();
            }
            this.reloadGaugeDialog = !this.reloadGaugeDialog;
            return;
        } else if (dlgType === GaugeDialogType.Gauge) {
            dialogRef = this.dialog.open(BagPropertyComponent, {
                position: { top: '30px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()), dlgType: dlgType,
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Pipe) {
            this.gaugeDialog.type = dlgType;
            this.gaugeDialog.data = <PipePropertyData>{
                settings: tempsettings,
                dlgType: dlgType,
                names: names,
                withEvents: eventsSupported,
                withActions: actionsSupported,
            };
            if (!this.sidePanel.opened) {
                this.sidePanel.toggle();
            }
            this.reloadGaugeDialog = !this.reloadGaugeDialog;
            return;
        } else if (dlgType === GaugeDialogType.Slider) {
            dialogRef = this.dialog.open(SliderPropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    withEvents: eventsSupported, withActions: actionsSupported,
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Switch) {
            dialogRef = this.dialog.open(HtmlSwitchPropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    withEvents: eventsSupported, withActions: actionsSupported, withBitmask: bitmaskSupported,
                    views: hmi.views,
                    view: this.currentView,
                    scripts: this.projectService.getScripts(),
                    inputs: Object.values(this.currentView.items).filter(gs => gs.name && (gs.id.startsWith('HXS_') || gs.id.startsWith('HXI_'))),
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Table || dlgType === GaugeDialogType.Panel) {
            this.gaugeDialog.type = dlgType;
            this.gaugeDialog.data = {
                settings: tempsettings, dlgType: dlgType, names: names
            };
            if (!this.sidePanel.opened) {
                this.sidePanel.toggle();
            }
            this.reloadGaugeDialog = !this.reloadGaugeDialog;
            return;
        } else {
            //!TODO to be refactored (GaugePropertyComponent)
            elementWithLanguageText = this.isSelectedElementToEnableLanguageTextSettings();
            let title = this.getGaugeTitle(settings.type);
            dialogRef = this.dialog.open(GaugePropertyComponent, {
                position: { top: '60px' },
                disableClose: true,
                data: <GaugePropertyData>{
                    settings: tempsettings,
                    devices: Object.values(this.projectService.getDevices()),
                    title: title,
                    views: hmi.views,
                    view: currentContext,
                    dlgType: dlgType,
                    withEvents: eventsSupported,
                    withActions: actionsSupported,
                    default: defaultValue,
                    inputs: Object.values(currentContext.items).filter(gs => gs.name && (gs.id.startsWith('HXS_') || gs.id.startsWith('HXI_'))),
                    names: names,
                    scripts: this.projectService.getScripts(),
                    withBitmask: bitmaskSupported,
                    languageTextEnabled: !!elementWithLanguageText
                }
            });
        }
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                callback(result.settings);
                if (this.currentView) {
                    this.saveView(this.currentView);
                } else if (this.currentTemplate) {
                    this.saveTemplate(this.currentTemplate);
                }
                this.gaugesManager.initInEditor(result.settings, this.resolver, this.viewContainerRef, elementWithLanguageText);
                this.checkSvgElementsMap(true);
            }
        });
    }

    isSelectedElementToEnableLanguageTextSettings(): any {
        const elementsSelected = this.winRef.nativeWindow.svgEditor.getSelectedElements();
        return elementsSelected[0]?.tagName?.toLowerCase() === 'text' ? elementsSelected[0] : null;
    }

    editBindOfTags(selected: any) {
        if (!selected) {
            return;
        }
        const gaugesSettings: GaugeSettings[] = [];
        const elesSelected = this.winRef.nativeWindow.svgEditor.getSelectedElements();
        const tagsIds = new Set();
        if (elesSelected?.length) {
            const eleIdsAndTypes = Utils.getInTreeIdAndType(elesSelected[0]);
            if (eleIdsAndTypes?.length) {
                for (let i = 0; i < eleIdsAndTypes.length; i++) {
                    let gaSrc: GaugeSettings = this.searchGaugeSettings(eleIdsAndTypes[i]);
                    const variablesIds = Utils.searchValuesByAttribute(gaSrc, 'variableId');
                    if (variablesIds?.length) {
                        gaugesSettings.push(gaSrc);
                        variablesIds.forEach(id => {
                            tagsIds.add(id);
                        });
                    }
                }
            }
        }
        const dialogRef = this.dialog.open(TagsIdsConfigComponent, {
            position: { top: '60px' },
            data: <TagsIdsData>{
                devices: Object.values(this.projectService.getDevices()),
                tagsIds: Array.from(tagsIds).map(id => <TagIdRef>{ srcId: id, destId: id })
            }
        });
        dialogRef.afterClosed().subscribe((result: TagIdRef[]) => {
            if (result?.length) {
                gaugesSettings.forEach(gaSettings => {
                    result.forEach((tagIdRef: TagIdRef) => {
                        Utils.changeAttributeValue(gaSettings, 'variableId', tagIdRef.srcId, tagIdRef.destId);
                    });
                });
                this.saveView(this.currentView);
            }
        });
    }

    onGaugeDialogChanged(settings: any) {
        if (settings) {
            this.setGaugeSettings(settings);
            this.saveView(this.currentView);
            let result_gauge = this.gaugesManager.initInEditor(settings, this.resolver, this.viewContainerRef);
            if (result_gauge?.element && result_gauge.element.id !== settings.id) {
                // by init a path we need to change the id
                delete this.currentView.items[settings.id];
                settings.id = result_gauge.element.id;
                this.saveView(this.currentView);
            }
        }
    }

    private getGaugeTitle(type): string {
        if (type.startsWith(HtmlInputComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-input-settings');
        } else if (type.startsWith(ValueComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-output-settings');
        } else if (type.startsWith(HtmlButtonComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-button-settings');
        } else if (type.startsWith(HtmlSelectComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-select-settings');
        } else if (type.startsWith(GaugeProgressComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-progress-settings');
        } else if (type.startsWith(GaugeSemaphoreComponent.TypeTag)) {
            return this.translateService.instant('editor.controls-semaphore-settings');
        } else {
            return this.translateService.instant('editor.controls-shape-settings');
        }
    }

    //#endregion

    onAddResource() {
        let dialogRef = this.dialog.open(LibImagesComponent, {
            disableClose: true,
            position: { top: '60px' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result) {
                    this.imagefile = result;
                    let self = this;
                    if (this.imagefile.split('.').pop().toLowerCase() === 'svg') {
                        fetch(this.imagefile).then(r => r.text()).then(text => {
                            if (self.winRef.nativeWindow.svgEditor.setSvgImageToAdd) {
                                self.winRef.nativeWindow.svgEditor.setSvgImageToAdd(text);
                            }
                            self.setMode('svg-image');
                        });
                    }
                    // } else {
                    //     this.getBase64Image(result, function (imgdata) {
                    //         if (self.winRef.nativeWindow.svgEditor.setUrlImageToAdd) {
                    //             self.winRef.nativeWindow.svgEditor.setUrlImageToAdd(imgdata);
                    //         }
                    //         self.setMode('image');
                    //     });
                    // }
                }
            }
        });
    }

    onWidgetKiosk() {
        let dialogRef = this.dialog.open(KioskWidgetsComponent, {
            disableClose: true,
            position: { top: '60px' },
            width: '1020px',
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.libWidgetsService.refreshResources();
            }
        });
    }

    isWithShadow() {
        if (this.selectedElement) {

        }
        return false;
    }

    private fileNew() {
    }

    private checkValid(hmi) {
        if (!hmi.views) {
            hmi.views = [];
            return false;
        }
        return true;
    }

    private clearSelection() {
        this.winRef.nativeWindow.svgEditor.clearSelection();
    }

    cloneElement() {
        this.winRef.nativeWindow.svgEditor.clickExtension('view_grid');
    }

    onHideSelectionToggle(checked: boolean) {
        let gaugeSettings = this.getGaugeSettings(this.selectedElement);
        if (gaugeSettings) {
            gaugeSettings.hide = checked;
            this.setGaugeSettings(gaugeSettings);
        }
    }

    onLockSelectionToggle(checked: boolean) {
        let gaugeSettings = this.getGaugeSettings(this.selectedElement);
        if (gaugeSettings) {
            gaugeSettings.lock = checked;
            this.setGaugeSettings(gaugeSettings);
            this.winRef.nativeWindow.svgEditor.lockSelection(gaugeSettings.lock);
        }
    }

    checkSelectedGaugeSettings() {
        let gaugeSettings = this.getGaugeSettings(this.selectedElement);
        this.gaugeSettingsHide = gaugeSettings?.hide ?? false;
        this.gaugeSettingsLock = gaugeSettings?.lock ?? false;
        this.winRef.nativeWindow.svgEditor.lockSelection(gaugeSettings?.lock);
    }

    flipSelected(fliptype: string) {
    }
}

interface CopiedAndPasted {
    copy: any[];
    past: HTMLElement[];
}

@Component({
    selector: 'dialog-link-property',
    templateUrl: 'linkproperty.dialog.html',
})
export class DialogLinkProperty {
    constructor(
        public dialogRef: MatDialogRef<DialogLinkProperty>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

export enum EditorModeType {
    SVG,
    CARDS,
    MAPS
}

interface PanelsStateType {
    enabled?: boolean;
    panelView?: boolean;
    panelViewHeight?: number;
    panelTemplate?: boolean;
    panelTemplateHeight?: number;
    panelGeneral?: boolean;
    panelC?: boolean;
    panelD?: boolean;
    panelS?: boolean;
    panelWidgets?: boolean;
}
