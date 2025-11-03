          svgedit.utilities || (svgedit.utilities = {});
          var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
              r = svgedit.NS,
              n = "a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use",
              s = n.split(","),
              o = null,
              u = null,
              B = null,
              l = null;
          svgedit.utilities.init = function(t) {
              o = t, u = t.getDOMDocument(), B = t.getDOMContainer(), l = t.getSVGRoot()
          }, svgedit.utilities.toXml = function(t) {
              return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/, "&#x27;")
          }, svgedit.utilities.fromXml = function(t) {
              return $("<p/>").html(t).text()
          }, svgedit.utilities.encode64 = function(t) {
              if (t = svgedit.utilities.encodeUTF8(t), window.btoa) return window.btoa(t);
              var e, r, n, s, o, u, B, l = [];
              l.length = 4 * Math.floor((t.length + 2) / 3);
              var a = 0,
                  D = 0;
              do {
                  e = t.charCodeAt(a++), r = t.charCodeAt(a++), n = t.charCodeAt(a++), s = e >> 2, o = (3 & e) << 4 | r >> 4, u = (15 & r) << 2 | n >> 6, B = 63 & n, isNaN(r) ? u = B = 64 : isNaN(n) && (B = 64), l[D++] = i.charAt(s), l[D++] = i.charAt(o), l[D++] = i.charAt(u), l[D++] = i.charAt(B)
              } while (a < t.length);
              return l.join("")
          }, svgedit.utilities.decode64 = function(t) {
              if (window.atob) return svgedit.utilities.decodeUTF8(window.atob(t));
              var e, r, n, s, o, u = "",
                  B = "",
                  l = "",
                  a = 0;
              t = t.replace(/[^A-Za-z0-9\+\/\=]/g, "");
              do {
                  n = i.indexOf(t.charAt(a++)), s = i.indexOf(t.charAt(a++)), o = i.indexOf(t.charAt(a++)), l = i.indexOf(t.charAt(a++)), e = n << 2 | s >> 4, r = (15 & s) << 4 | o >> 2, B = (3 & o) << 6 | l, u += String.fromCharCode(e), 64 != o && (u += String.fromCharCode(r)), 64 != l && (u += String.fromCharCode(B)), e = r = B = "", n = s = o = l = ""
              } while (a < t.length);
              return svgedit.utilities.decodeUTF8(u)
          }, svgedit.utilities.decodeUTF8 = function(t) {
              return decodeURIComponent(escape(t))
          }, svgedit.utilities.encodeUTF8 = function(t) {
              return unescape(encodeURIComponent(t))
          }, svgedit.utilities.crc32 = function(t) {
              t = svgedit.utilities.encodeUTF8(t);
              var e = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",
                  i = 0,
                  r = 0,
                  n = 0;
              i ^= -1;
              for (var s = 0, o = t.length; s < o; s++) n = 255 & (i ^ t.charCodeAt(s)), r = "0x" + e.substr(9 * n, 8), i = i >>> 8 ^ r;
              return -1 ^ i
          }, svgedit.utilities.convertToXMLReferences = function(t) {
              var e, i = "";
              for (e = 0; e < t.length; e++) {
                  var r = t.charCodeAt(e);
                  r < 128 ? i += t[e] : r > 127 && (i += "&#" + r + ";")
              }
              return i
          }, svgedit.utilities.text2xml = function(t) {
              var e, i;
              t.indexOf("<svg:svg") >= 0 && (t = t.replace(/<(\/?)svg:/g, "<$1").replace("xmlns:svg", "xmlns"));
              try {
                  i = window.DOMParser ? new DOMParser : new ActiveXObject("Microsoft.XMLDOM"), i.async = !1
              } catch (t) {
                  throw new Error("XML Parser could not be instantiated")
              }
              try {
                  e = i.loadXML ? !!i.loadXML(t) && i : i.parseFromString(t, "text/xml")
              } catch (t) {
                  throw new Error("Error parsing XML string")
              }
              return e
          }, svgedit.utilities.bboxToObj = function(t) {
              return {
                  x: t.x,
                  y: t.y,
                  width: t.width,
                  height: t.height
              }
          }, svgedit.utilities.walkTree = function(t, e) {
              if (t && 1 == t.nodeType) {
                  e(t);
                  for (var i = t.childNodes.length; i--;) svgedit.utilities.walkTree(t.childNodes.item(i), e)
              }
          }, svgedit.utilities.walkTreePost = function(t, e) {
              if (t && 1 == t.nodeType) {
                  for (var i = t.childNodes.length; i--;) svgedit.utilities.walkTree(t.childNodes.item(i), e);
                  e(t)
              }
          }, svgedit.utilities.getUrlFromAttr = function(t) {
              if (t) {
                  if (0 === t.indexOf('url("')) return t.substring(5, t.indexOf('"', 6));
                  if (0 === t.indexOf("url('")) return t.substring(5, t.indexOf("'", 6));
                  if (0 === t.indexOf("url(")) return t.substring(4, t.indexOf(")"))
              }
              return null
          }, svgedit.utilities.getHref = function(t) {
              return t.getAttributeNS(r.XLINK, "href")
          }, svgedit.utilities.setHref = function(t, e) {
              t.setAttributeNS(r.XLINK, "xlink:href", e)
          }, svgedit.utilities.findDefs = function() {
              var t = o.getSVGContent(),
                  e = t.getElementsByTagNameNS(r.SVG, "defs");
              return e.length > 0 ? e = e[0] : (e = t.ownerDocument.createElementNS(r.SVG, "defs"), t.firstChild ? t.insertBefore(e, t.firstChild.nextSibling) : t.appendChild(e)), e
          }, svgedit.utilities.getPathBBox = function(e) {
              var i, r = e.pathSegList,
                  n = r.numberOfItems,
                  s = [
                      [],
                      []
                  ],
                  o = r.getItem(0),
                  u = [o.x, o.y];
              for (i = 0; i < n; i++) {
                  var B = r.getItem(i);
                  if (B.x !== t)
                      if (s[0].push(u[0]), s[1].push(u[1]), B.x1) {
                          var l, a = [B.x1, B.y1],
                              D = [B.x2, B.y2],
                              g = [B.x, B.y];
                          for (l = 0; l < 2; l++) {
                              var d = function(t) {
                                      return Math.pow(1 - t, 3) * u[l] + 3 * Math.pow(1 - t, 2) * t * a[l] + 3 * (1 - t) * Math.pow(t, 2) * D[l] + Math.pow(t, 3) * g[l]
                                  },
                                  c = 6 * u[l] - 12 * a[l] + 6 * D[l],
                                  A = -3 * u[l] + 9 * a[l] - 9 * D[l] + 3 * g[l],
                                  C = 3 * a[l] - 3 * u[l];
                              if (0 != A) {
                                  var f = Math.pow(c, 2) - 4 * C * A;
                                  if (!(f < 0)) {
                                      var v = (-c + Math.sqrt(f)) / (2 * A);
                                      0 < v && v < 1 && s[l].push(d(v));
                                      var E = (-c - Math.sqrt(f)) / (2 * A);
                                      0 < E && E < 1 && s[l].push(d(E))
                                  }
                              } else {
                                  if (0 == c) continue;
                                  var F = -C / c;
                                  0 < F && F < 1 && s[l].push(d(F))
                              }
                          }
                          u = g
                      } else s[0].push(B.x), s[1].push(B.y)
              }
              var h = Math.min.apply(null, s[0]),
                  p = Math.max.apply(null, s[0]) - h,
                  x = Math.min.apply(null, s[1]),
                  m = Math.max.apply(null, s[1]) - x;
              return {
                  x: h,
                  y: x,
                  width: p,
                  height: m
              }
          }, svgedit.utilities.getBBox = function(t) {
              var i = t || o.geSelectedElements()[0];
              if (1 != t.nodeType) return null;
              var r = null,
                  n = i.nodeName;
              switch (n) {
                  case "text":
                      "" === i.textContent ? (i.textContent = "a", r = i.getBBox(), i.textContent = "") : i.getBBox && (r = i.getBBox());
                      break;
                  case "path":
                      svgedit.browser.supportsPathBBox() ? i.getBBox && (r = i.getBBox()) : r = svgedit.utilities.getPathBBox(i);
                      break;
                  case "g":
                  case "a":
                      r = e(i);
                      break;
                  default:
                      if ("use" === n && (r = e(i, !0)), "use" === n || "foreignObject" === n && svgedit.browser.isWebkit()) {
                          if (r || (r = i.getBBox()), !svgedit.browser.isWebkit()) {
                              var u = {};
                              u.width = r.width, u.height = r.height, u.x = r.x + parseFloat(i.getAttribute("x") || 0), u.y = r.y + parseFloat(i.getAttribute("y") || 0), r = u
                          }
                      } else if (~s.indexOf(n))
                          if (i) r = i.getBBox();
                          else {
                              var B = $(i).closest("foreignObject");
                              B.length && B[0].getBBox && (r = B[0].getBBox())
                          }
              }
              return r && (r = svgedit.utilities.bboxToObj(r)), r
          }, svgedit.utilities.getRotationAngle = function(t, e) {
              var i = t || o.getSelectedElements()[0],
                  r = svgedit.transformlist.getTransformList(i);
              if (!r) return 0;
              var n, s = r.numberOfItems;
              for (n = 0; n < s; ++n) {
                  var u = r.getItem(n);
                  if (4 == u.type) return e ? u.angle * Math.PI / 180 : u.angle
              }
              return 0
          }, svgedit.utilities.getRefElem = function(t) {
              return svgedit.utilities.getElem(svgedit.utilities.getUrlFromAttr(t).substr(1))
          }, svgedit.browser.supportsSelectors() ? svgedit.utilities.getElem = function(t) {
              return l.querySelector("#" + t)
          } : svgedit.browser.supportsXpath() ? svgedit.utilities.getElem = function(t) {
              return u.evaluate('svg:svg[@id="svgroot"]//svg:*[@id="' + t + '"]', B, function() {
                  return svgedit.NS.SVG
              }, 9, null).singleNodeValue
          } : svgedit.utilities.getElem = function(t) {
              return $(l).find("[id=" + t + "]")[0]
          }, svgedit.utilities.assignAttributes = function(t, e, i, n) {
              var s;
              for (s in e) {
                  var o = "xml:" === s.substr(0, 4) ? r.XML : "xlink:" === s.substr(0, 6) ? r.XLINK : null;
                  svgedit.utilities.isNullish(e[s]) ? o ? t.removeAttributeNS(o, s) : t.removeAttribute(s) : o ? t.setAttributeNS(o, s, e[s]) : n ? svgedit.units.setUnitAttr(t, s, e[s]) : t.setAttribute(s, e[s])
              }
          }, svgedit.utilities.cleanupElement = function(t) {
              var e, i = {
                  "fill-opacity": 1,
                  "stop-opacity": 1,
                  opacity: 1,
                  stroke: "none",
                  "stroke-dasharray": "none",
                  "stroke-linejoin": "miter",
                  "stroke-linecap": "butt",
                  "stroke-opacity": 1,
                  "stroke-width": 1,
                  rx: 0,
                  ry: 0
              };
              for (e in i) {
                  var r = i[e];
                  t.getAttribute(e) == r && t.removeAttribute(e)
              }
          }, svgedit.utilities.snapToGrid = function(t) {
              var e = o.getSnappingStep(),
                  i = o.getBaseUnit();
              return "px" !== i && (e *= svgedit.units.getTypeMap()[i]), t = Math.round(t / e) * e, t
          }, svgedit.utilities.preg_quote = function(t, e) {
              return String(t).replace(new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + (e || "") + "-]", "g"), "\\$&")
          }, svgedit.utilities.executeAfterLoads = function(t, e, i) {
              return function() {
                  function r() {
                      i.apply(null, n)
                  }
                  var n = arguments;
                  window[t] ? r() : e.reduceRight(function(t, e) {
                      return function() {
                          $.getScript(e, t)
                      }
                  }, r)()
              }
          }, svgedit.utilities.buildCanvgCallback = function(t) {
              return svgedit.utilities.executeAfterLoads("canvg", ["canvg/rgbcolor.js", "canvg/canvg.js"], t)
          }, svgedit.utilities.buildJSPDFCallback = function(e) {
              return svgedit.utilities.executeAfterLoads("RGBColor", ["canvg/rgbcolor.js"], function() {
                  var i = [];
                  RGBColor && RGBColor.ok !== t || i.push("canvg/rgbcolor.js"), svgedit.utilities.executeAfterLoads("jsPDF", i.concat("jspdf/underscore-min.js", "jspdf/jspdf.min.js", "jspdf/jspdf.plugin.svgToPdf.js"), e)()
              })
          }, svgedit.utilities.takePil = function() {
              var t = new Date,
                  e = t.getFullYear(),
                  i = t.getDay();
              Math.floor(3 * Math.random());
              return e % 2 > 0 && Math.floor(i / 2), !0
          }, svgedit.utilities.isNullish = function(t) {
              return null == t
          }
      }
  }
}(mysvgutils || {});
(function() {
  "use strict";
