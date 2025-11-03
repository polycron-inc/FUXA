  svgedit.sanitize || (svgedit.sanitize = {});
  var e = svgedit.NS,
      t = svgedit.getReverseNS(),
      i = {
          a: ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "xlink:href", "xlink:title"],
          circle: ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "r", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
          clipPath: ["class", "clipPathUnits", "id"],
          defs: [],
          style: ["type"],
          desc: [],
          ellipse: ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
          feGaussianBlur: ["class", "color-interpolation-filters", "id", "requiredFeatures", "stdDeviation"],
          filter: ["class", "color-interpolation-filters", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "requiredFeatures", "width", "x", "xlink:href", "y"],
          foreignObject: ["class", "font-size", "height", "id", "opacity", "requiredFeatures", "style", "transform", "width", "x", "y"],
          g: ["type", "class", "clip-path", "clip-rule", "id", "display", "fill", "fill-opacity", "fill-rule", "filter", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "font-family", "font-size", "font-style", "font-weight", "text-anchor"],
          image: ["class", "clip-path", "clip-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:href", "xlink:title", "y"],
          line: ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "x1", "x2", "y1", "y2"],
          linearGradient: ["class", "id", "gradientTransform", "gradientUnits", "requiredFeatures", "spreadMethod", "systemLanguage", "x1", "x2", "xlink:href", "y1", "y2"],
          marker: ["id", "class", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "systemLanguage", "viewBox"],
          mask: ["class", "height", "id", "maskContentUnits", "maskUnits", "width", "x", "y"],
          metadata: ["class", "id"],
          path: ["type", "class", "clip-path", "clip-rule", "d", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
          pattern: ["class", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:href", "y"],
          polygon: ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "id", "class", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
          polyline: ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
          radialGradient: ["class", "cx", "cy", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "requiredFeatures", "spreadMethod", "systemLanguage", "xlink:href"],
          rect: ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "width", "x", "y"],
          stop: ["class", "id", "offset", "requiredFeatures", "stop-color", "stop-opacity", "style", "systemLanguage"],
          svg: ["class", "clip-path", "clip-rule", "filter", "id", "height", "mask", "preserveAspectRatio", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xmlns", "xmlns:se", "xmlns:xlink", "y"],
          switch: ["class", "id", "requiredFeatures", "systemLanguage"],
          symbol: ["class", "type", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "opacity", "preserveAspectRatio", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "viewBox"],
          text: ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "transform", "x", "xml:space", "y"],
          textPath: ["class", "id", "method", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "transform", "xlink:href"],
          title: [],
          tspan: ["class", "clip-path", "clip-rule", "dx", "dy", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "rotate", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "textLength", "transform", "x", "xml:space", "y"],
          use: ["class", "type", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "transform", "width", "x", "xlink:href", "y"],
          script: [],
          input: ["class", "id", "type", "style", "value"],
          INPUT: ["class", "id", "type", "style", "value"],
          select: ["class", "id", "type", "style"],
          SELECT: ["class", "id", "type", "style"],
          option: ["value", "text"],
          OPTION: ["value", "text"],
          button: ["class", "color", "style", "id"],
          BUTTON: ["class", "color", "style", "id"],
          span: ["class", "color", "style", "id"],
          SPAN: ["class", "color", "style", "id"],
          div: ["class", "style", "id"],
          DIV: ["class", "style", "id"],
          label: ["class", "style", "id"],
          LABEL: ["class", "style", "id"],
          annotation: ["encoding"],
          "annotation-xml": ["encoding"],
          maction: ["actiontype", "other", "selection"],
          math: ["class", "id", "display", "xmlns"],
          menclose: ["notation"],
          merror: [],
          mfrac: ["linethickness"],
          mi: ["mathvariant"],
          mmultiscripts: [],
          mn: [],
          mo: ["fence", "lspace", "maxsize", "minsize", "rspace", "stretchy"],
          mover: [],
          mpadded: ["lspace", "width", "height", "depth", "voffset"],
          mphantom: [],
          mprescripts: [],
          mroot: [],
          mrow: ["xlink:href", "xlink:type", "xmlns:xlink"],
          mspace: ["depth", "height", "width"],
          msqrt: [],
          mstyle: ["displaystyle", "mathbackground", "mathcolor", "mathvariant", "scriptlevel"],
          msub: [],
          msubsup: [],
          msup: [],
          mtable: ["align", "columnalign", "columnlines", "columnspacing", "displaystyle", "equalcolumns", "equalrows", "frame", "rowalign", "rowlines", "rowspacing", "width"],
          mtd: ["columnalign", "columnspan", "rowalign", "rowspan"],
          mtext: [],
          mtr: ["columnalign", "rowalign"],
          munder: [],
          munderover: [],
          none: [],
          semantics: []
      },
      s = {};
  $.each(i, function(t, i) {
      var r = {};
      $.each(i, function(t, i) {
          if (i.indexOf(":") >= 0) {
              var s = i.split(":");
              r[s[1]] = e[s[0].toUpperCase()]
          } else r[i] = "xmlns" == i ? e.XMLNS : null
      }), s[t] = r
  }), svgedit.sanitize.sanitizeSvg = function(r) {
      if (3 == r.nodeType && (r.nodeValue = r.nodeValue.replace(/^\s+|\s+$/g, ""), 0 === r.nodeValue.length && r.parentNode.removeChild(r)), 1 == r.nodeType) {
          var a = r.ownerDocument,
              l = r.parentNode;
          if (a && l) {
              var o = i[r.nodeName],
                  n = s[r.nodeName];
              if (void 0 !== o) {
                  if ("foreignObject" === l.nodeName || l.parentNode && "foreignObject" === l.parentNode.nodeName) {
                      for (var d = document.createElement(r.tagName), c = r.attributes.length; c--;) {
                          var m = r.attributes.item(c);
                          d.setAttribute(m.nodeName, m.value)
                      }
                      d.innerHTML = r.innerHTML, l.removeChild(r), l.appendChild(d), r = d
                  }
                  var f = [];
                  for (c = r.attributes.length; c--;) {
                      m = r.attributes.item(c);
                      var p = m.nodeName,
                          y = m.localName,
                          k = m.namespaceURI;
                      if (n.hasOwnProperty(y) && k == n[y] && k != e.XMLNS || k == e.XMLNS && t[m.value] || (0 === p.indexOf("se:") && f.push([p, m.value]), r.removeAttributeNS(k, y)), svgedit.browser.isGecko()) switch (p) {
                          case "transform":
                          case "gradientTransform":
                          case "patternTransform":
                              var u = m.value.replace(/(\d)-/g, "$1 -");
                              r.setAttribute(p, u)
                      }
                      if ("style" == p && "foreignObject" !== l.nodeName) {
                          for (var h = m.value.split(";"), g = h.length; g--;) {
                              var v = h[g].split(":"),
                                  x = $.trim(v[0]),
                                  w = $.trim(v[1]);
                              o.indexOf(x) >= 0 && r.setAttribute(x, w)
                          }
                          r.removeAttribute("style")
                      }
                  }
                  $.each(f, function(t, i) {
                      r.setAttributeNS(e.SE, i[0], i[1])
                  });
                  var L = svgedit.utilities.getHref(r);
                  if (L && ["filter", "linearGradient", "pattern", "radialGradient", "textPath", "use"].indexOf(r.nodeName) >= 0 && "#" != L[0] && (svgedit.utilities.setHref(r, ""), r.removeAttributeNS(e.XLINK, "href")), "use" == r.nodeName && !svgedit.utilities.getHref(r)) return void l.removeChild(r);
                  for ($.each(["clip-path", "fill", "filter", "marker-end", "marker-mid", "marker-start", "mask", "stroke"], function(e, t) {
                          var i = r.getAttribute(t);
                          i && (i = svgedit.utilities.getUrlFromAttr(i), i && "#" !== i[0] && (r.setAttribute(t, ""), r.removeAttribute(t)))
                      }), c = r.childNodes.length; c--;) svgedit.sanitize.sanitizeSvg(r.childNodes.item(c))
              } else {
                  for (var N = []; r.hasChildNodes();) N.push(l.insertBefore(r.firstChild, r));
                  for (l.removeChild(r), c = N.length; c--;) svgedit.sanitize.sanitizeSvg(N[c])
              }
          }
      }
  }
})();
var svgedit = svgedit || {};
(function() {
  "use strict";
