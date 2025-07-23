import { Component } from '@angular/core';
import { GaugeBaseComponent } from '../../gauge-base/gauge-base.component';
import { GaugeSettings, Variable } from '../../../_models/hmi';
import { Utils } from '../../../_helpers/utils';
import { GaugeDialogType } from '../../gauge-property/gauge-property.component';

@Component({
    selector: 'app-html-iframe',
    templateUrl: './html-iframe.component.html',
    styleUrls: ['./html-iframe.component.css']
})
export class HtmlIframeComponent extends GaugeBaseComponent {
    static TypeTag = 'svg-ext-own_ctrl-iframe';
    static LabelTag = 'HtmlIframe';
    static prefixD = 'D-OXC_';

    constructor() {
        super();
    }

    static getSignals(pro: any) {
        let res: string[] = [];
        if (pro.variableId) {
            res.push(pro.variableId);
        }
        return res;
    }

    static getDialogType(): GaugeDialogType {
        return GaugeDialogType.Iframe;
    }

    static processValue(ga: GaugeSettings, svgele: any, sig: Variable) {
        try {
            if (sig.value && svgele?.node?.children?.length >= 1) {
                const parentIframe = Utils.searchTreeStartWith(svgele.node, this.prefixD);
                const iframe = parentIframe.querySelector('iframe');
                const src = iframe.getAttribute('src');
                if (src !== sig.value && Utils.isValidUrl(sig.value)) {
                    iframe.setAttribute('src', sig.value);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    static initElement(gaugeSettings: GaugeSettings, isview: boolean): HTMLElement {
        let svgIframeContainer = null;
        let ele = document.getElementById(gaugeSettings.id);
        if (ele) {
            ele?.setAttribute('data-name', gaugeSettings.name);
            svgIframeContainer = Utils.searchTreeStartWith(ele, this.prefixD);
            if (svgIframeContainer) {
                svgIframeContainer.innerHTML = '';
                let iframe = document.createElement('iframe');
                iframe.setAttribute('name', gaugeSettings.name);
                iframe.style['width'] = '100%';
                iframe.style['height'] = '100%';
                iframe.style['border'] = 'none';
                iframe.style['background-color'] = '#F1F3F4';
                if (!isview) {
                    svgIframeContainer.innerHTML = `<div class="control-iframe-title"><div><svg width="154" height="63" viewBox="0 0 154 63" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M90.3268 7.33203C91.0818 7.50987 91.5311 7.98411 91.723 8.72667V30.3498C91.5061 31.1673 90.9898 31.679 90.1255 31.7476H63.7787C62.8645 31.6758 62.2592 31.0659 62.1797 30.1486V8.92791C62.2452 8.08863 62.735 7.58007 63.5197 7.33203H90.3268ZM90.7916 11.8654V8.87175C90.7916 8.67831 90.4765 8.31639 90.2581 8.30079L63.6898 8.28675C63.4526 8.29923 63.111 8.65491 63.111 8.87175V11.8654H90.7916ZM90.7916 12.8544H63.1126V30.2048C63.1126 30.3982 63.4277 30.7601 63.6461 30.7757L90.2144 30.7898C90.4516 30.7773 90.7932 30.4216 90.7932 30.2048V12.8544H90.7916Z" fill="#64748B"/>
<path d="M68.1146 22.2715L69.0147 19.5977C69.1598 19.2061 69.6917 19.1812 69.8696 19.5571L70.7307 22.2715L71.6355 19.5446C71.9194 19.0595 72.6386 19.334 72.5091 19.8894C72.0068 21.1577 71.7494 22.6147 71.2564 23.8721C71.0676 24.3541 70.7619 24.5522 70.3563 24.1279C69.985 23.3292 69.868 22.259 69.5139 21.4822C69.4827 21.4135 69.542 21.3776 69.3922 21.3995C69.3922 21.4775 69.3891 21.5586 69.3657 21.6335C69.1504 22.2902 68.8868 23.4618 68.6075 24.0156C68.4172 24.3962 67.9804 24.5132 67.7526 24.1139C67.5249 23.7145 67.269 22.6381 67.1099 22.1405C66.8588 21.3589 66.6341 20.5664 66.3814 19.7833C66.3596 19.3044 67.007 19.111 67.255 19.4947L68.1146 22.2684V22.2715Z" fill="#64748B"/>
<path d="M83.116 22.2712C83.2189 22.2259 83.2564 21.9997 83.2907 21.8952C83.5044 21.2369 83.7259 20.1714 84.0161 19.5973C84.2142 19.2058 84.6588 19.1668 84.871 19.5568L85.7321 22.2712L86.6681 19.46C86.9426 19.1512 87.5198 19.2978 87.5245 19.7424L86.1065 24.1884C85.821 24.4364 85.5371 24.413 85.3327 24.0948C85.0004 23.2477 84.8273 22.3336 84.5153 21.4818C84.4856 21.4007 84.5356 21.3835 84.3936 21.4007L83.5918 24.0574C83.2579 24.5285 82.871 24.4271 82.662 23.9154C82.1519 22.6627 81.907 21.1589 81.3937 19.8906C81.2752 19.304 82.0084 19.0576 82.2876 19.5833L83.116 22.2727V22.2712Z" fill="#64748B"/>
<path d="M75.6155 22.2715L76.5156 19.5977C76.6607 19.2061 77.1927 19.1812 77.3705 19.5571L78.2316 22.2715L79.1364 19.5446C79.3548 19.1375 80.0194 19.2576 80.0241 19.7428C80.0241 19.8379 79.9695 19.9643 79.9461 20.0626C79.6809 21.1374 79.1427 22.9517 78.7246 23.9563C78.5296 24.4259 78.1505 24.4992 77.8323 24.0952L77.0164 21.4822L76.8947 21.401L76.11 24.0172C75.3253 25.0686 75.0383 23.4883 74.8433 22.8986C74.5048 21.869 74.2115 20.8207 73.8839 19.788C73.8511 19.2514 74.5687 19.1172 74.7871 19.5836L75.6155 22.2731V22.2715Z" fill="#64748B"/>
<path d="M68.6773 9.43646C69.8457 9.16814 69.8395 10.9029 68.7865 10.7578C68.0736 10.6595 68.0611 9.57842 68.6773 9.43646Z" fill="#64748B"/>
<path d="M66.0629 9.43745C67.0645 9.23309 67.2064 10.5528 66.4311 10.7354C65.5154 10.9506 65.2564 9.60125 66.0629 9.43745Z" fill="#64748B"/>
<path d="M71.3534 9.43626C72.3378 9.2085 72.5437 10.5407 71.7232 10.7357C70.8012 10.9557 70.6015 9.60942 71.3534 9.43626Z" fill="#64748B"/>
</svg>

<div>Enter link to embed ifame</div></div></div>`;
                    iframe.style['overflow'] = 'hidden';
                    iframe.style['pointer-events'] = 'none';
                }
                iframe.setAttribute('title', 'iframe');
                if (gaugeSettings.property && gaugeSettings.property.address && isview) {
                    if (Utils.isValidUrl(gaugeSettings.property.address)) {
                        iframe.setAttribute('src', gaugeSettings.property.address);
                    } else {
                        console.error('IFRAME URL not valid');
                    }
                }
                iframe.innerHTML = '&nbsp;';
                svgIframeContainer.appendChild(iframe);
            }
        }
        return svgIframeContainer;
    }

    static detectChange(gab: GaugeSettings): HTMLElement {
        return HtmlIframeComponent.initElement(gab, false);
    }
}
