import { Component, ViewChild, OnDestroy, Input, OnInit, AfterViewInit } from '@angular/core';

import { GraphBaseComponent, GraphOptions } from '../graph-base/graph-base.component';
import { BaseChartDirective } from 'ng2-charts';
import { GraphPieProperty, GraphSource } from '../../../../_models/graph';
import { ChartData, ChartType } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
    selector: 'app-graph-pie',
    templateUrl: './graph-pie.component.html',
    styleUrls: ['./graph-pie.component.css']
})
export class GraphPieComponent extends GraphBaseComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(BaseChartDirective, { static: false }) public chart?: BaseChartDirective;
    @Input() height = 380;
    @Input() width = 380;

    pieChartOptions: GraphOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    pieChartType: ChartType = 'pie';
    barChartPlugins = [
        DataLabelsPlugin
    ];

    pieData = [300, 500, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
    pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5', 'Test 6', 'Test 7', 'Test 8', 'Test 9', 'Test 10', 'Test 11', 'Test 12'],
        datasets: [
            {
                data: this.pieData,
                backgroundColor: [
                    'rgba(54, 158, 180, 1)',
                    'rgba(95, 190, 211, 1)',
                    'rgba(172, 241, 255, 1)',
                    'rgba(242, 102, 127, 1)',
                    'rgba(242, 102, 127, 1)',
                    'rgba(246, 221, 225, 1)',
                    'rgba(254, 148, 39, 1)',
                    'rgba(253, 180, 86, 1)',
                    'rgba(255, 235, 210, 1)',
                    'rgba(254, 123, 95, 1)',
                    'rgba(253, 171, 150, 1)',
                    'rgba(254, 231, 225, 1)',
                ],
            },
        ],
    };


    id = '';
    isEditor = false;
    title = '';
    property: GraphPieProperty;
    sourceMap = {};

    constructor() {
        super();
    }

    ngOnInit() {
        const roundedLegendPlugin = {
            id: 'roundedLegend',
            beforeDraw(chart) {
                const { ctx, legend } = chart;
                if (!legend || !legend.legendItems) { return; }

                legend.legendItems.forEach((item, i) => {
                    item.pointStyle = 'rectRounded'; // 你也可以用 rectRounded、dash、star 等
                });
            }
        };
        if (!this.pieChartOptions) {
            this.pieChartOptions = GraphPieComponent.DefaultOptions();
            this.pieChartOptions.plugins.push(roundedLegendPlugin);
        }
    }

    ngAfterViewInit() {
        if (this.pieChartOptions.panel) {
            this.resize(this.pieChartOptions.panel.height, this.pieChartOptions.panel.width);
        }
    }

    ngOnDestroy() {
        try {
        } catch (e) {
            console.error(e);
        }
    }

    init(title: string, property: any, sources?: GraphSource[]) {
        this.title = title;
        this.property = property;
        // Set chart type from property
        if (property && property.chartType) {
            this.pieChartType = property.chartType as ChartType;
        } else {
            // Default to pie if not specified
            this.pieChartType = 'pie';
        }
        // Set cutout from property (for doughnut charts)
        if (property && property.cutout !== undefined) {
            this.pieChartOptions = {
                ...this.pieChartOptions,
                cutout: property.cutout + '%'
            };
        }
        if (sources) {
            this.setSources(sources);
        }
    }

    setSources(sources: GraphSource[]) {
        this.sourceMap = {};
        let labels = [];
        this.pieData = [];
        let backgroundColor = [];

        for (let i = 0; i < sources.length; i++) {
            labels.push(sources[i].label || sources[i].name);
            this.pieData.push((i + 1) * 10);
            backgroundColor.push(sources[i].fill);
            this.sourceMap[sources[i].id] = i;
        }
        this.pieChartData.labels = labels;
        this.pieChartData.datasets = [{
            data: this.pieData,
            backgroundColor: backgroundColor,
        }];
    }

    resize(height?, width?) {
        if (height && width) {
            this.height = height;
            this.width = width;
            this.pieChartOptions.panel.width = width;
            this.pieChartOptions.panel.height = height;
        }
    }

    setValue(sigid: string, timestamp: any, sigvalue: any) {
        this.pieData[this.sourceMap[sigid]] = sigvalue;
        this.chart.update(400);
    }

    setOptions(options: GraphOptions): void {
        if (options) {
            this.pieChartOptions = { ...this.pieChartOptions, ...options };
            if (this.pieChartOptions.panel) {
                this.resize(this.pieChartOptions.panel.height, this.pieChartOptions.panel.width);
            }
            this.pieChartOptions.plugins.title.text = GraphBaseComponent.getTitle(options, this.title);
            // Update cutout from property if available
            if (this.property && this.property.cutout !== undefined) {
                this.pieChartOptions.cutout = this.property.cutout + '%';
            }
        }
    }

    public static DefaultOptions() {
        const roundedLegendPlugin = {
            id: 'roundedLegend',
            beforeDraw(chart) {
                const { ctx, legend } = chart;
                if (!legend || !legend.legendItems) { return; }

                legend.legendItems.forEach((item, i) => {
                    item.pointStyle = 'circle'; // 你也可以用 rectRounded、dash、star 等
                });
            }
        };
        let options = <GraphOptions>{
            type: 'pie',
            plugins: {
                title: {
                    display: true,
                    text: 'Title',
                    font: {
                        size: 12,
                        family: 'Noto Sans TC',
                        style: 'normal',
                        weight: 'bold',
                    },
                    color: '#475569'
                },
                tooltip: {
                    enabled: true,
                    intersect: false
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        font: {
                            size: 12,
                            family: 'Noto Sans TC',
                            style: 'normal',
                            weight: 'normal',
                        },
                        color: '#475569',
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                    }
                },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: {
                        size: 12,
                    }
                }
            }
        };
        return options;
    }
}
