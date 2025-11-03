          return save_options.round_digits
      }
  });
  o.convertToNum = svgedit.units.convertToNum;
  svgedit.utilities.init({
      getDOMDocument: function() {
          return g
      },
      getDOMContainer: function() {
          return e
      },
      getSVGRoot: function() {
          return h
      },
      getSelectedElements: function() {
          return w
      },
      getSVGContent: function() {
          return m
      },
      getBaseUnit: function() {
          return a.baseUnit
      },
      getSnappingStep: function() {
          return a.snappingStep
      }
  });
  var T = o.findDefs = svgedit.utilities.findDefs,
      G = o.getUrlFromAttr = svgedit.utilities.getUrlFromAttr,
      I = o.getHref = svgedit.utilities.getHref,
      M = o.setHref = svgedit.utilities.setHref,
      L = svgedit.utilities.getPathBBox,
      P = (o.getBBox = svgedit.utilities.getBBox, o.getRotationAngle = svgedit.utilities.getRotationAngle, o.getElem = svgedit.utilities.getElem),
      O = (o.getRefElem = svgedit.utilities.getRefElem, o.assignAttributes = svgedit.utilities.assignAttributes),
      D = this.cleanupElement = svgedit.utilities.cleanupElement;
  svgedit.coords.init({
      getDrawing: function() {
          return f()
      },
      getGridSnapping: function() {
          return a.gridSnapping
      }
  });
  var R = this.remapElement = svgedit.coords.remapElement;
  svgedit.recalculate.init({
      getSVGRoot: function() {
          return h
      },
      getStartTransform: function() {
          return startTransform
      },
      setStartTransform: function(e) {
          startTransform = e
      }
  });
  var V, U = this.recalculateDimensions = svgedit.recalculate.recalculateDimensions,
      z = svgedit.getReverseNS(),
      F = o.sanitizeSvg = svgedit.sanitize.sanitizeSvg,
      j = svgedit.history.MoveElementCommand,
      H = svgedit.history.InsertElementCommand,
      q = svgedit.history.RemoveElementCommand,
      W = svgedit.history.ChangeElementCommand,
      K = svgedit.history.BatchCommand;
  o.undoMgr = new svgedit.history.UndoManager({
      handleHistoryEvent: function(e, t) {
          var i = svgedit.history.HistoryEventTypes;
          if (e == i.BEFORE_UNAPPLY || e == i.BEFORE_APPLY) o.clearSelection();
          else if (e == i.AFTER_APPLY || e == i.AFTER_UNAPPLY) {
              var r = t.elements();
              o.pathActions.clear(), V("changed", r);
              var n = t.type(),
                  a = e == i.AFTER_APPLY;
              if (n == j.type()) {
                  var s = a ? t.newParent : t.oldParent;
                  s == m && o.identifyLayers()
              } else if (n == H.type() || n == q.type()) t.parent == m && o.identifyLayers(), n == H.type() ? a && ie(t.elem) : a || ie(t.elem), "use" === t.elem.tagName && Le(t.elem);
              else if (n == W.type()) {
                  "title" == t.elem.tagName && t.elem.parentNode.parentNode == m && o.identifyLayers();
                  var l = a ? t.newValues : t.oldValues;
                  l.stdDeviation && o.setBlurOffsets(t.elem.parentNode, l.stdDeviation)
              }
          }
      }
  });
  var X = function(e) {
      o.undoMgr.addCommandToHistory(e)
  };
  svgedit.select.init(a, {
      createSVGElement: function(e) {
          return o.addSvgElementFromJson(e)
      },
      svgRoot: function() {
          return h
      },
      svgContent: function() {
          return m
      },
      currentZoom: function() {
          return p
      },
      getStrokedBBox: function(e) {
          return o.getStrokedBBox([e])
      }
  });
  var Y = this.selectorManager = svgedit.select.getSelectorManager();
  svgedit.path.init({
      getCurrentZoom: function() {
          return p
      },
      getSVGRoot: function() {
          return h
      }
  });
  var Z = {
          exportNoBlur: "Blurred elements will appear as un-blurred",
          exportNoforeignObject: "foreignObject elements will not appear",
          exportNoDashArray: "Strokes will appear filled",
          exportNoText: "Text may not appear as expected"
      },
      J = "a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use",
      Q = ["clip-path", "fill", "filter", "marker-end", "marker-mid", "marker-start", "mask", "stroke"],
      ee = $.data,
      te = document.createElementNS(n.SVG, "animate");
  $(te).attr({
      attributeName: "opacity",
      begin: "indefinite",
      dur: 1,
      fill: "freeze"
  }).appendTo(h);
  var ie = function(e) {
          var t, i, r, n = $(e).attr(Q);
          for (t in n) {
              var a = n[t];
              if (a && 0 === a.indexOf("url(")) {
                  var s = svgedit.utilities.getUrlFromAttr(a).substr(1),
                      o = P(s);
                  o || (svgedit.utilities.findDefs().appendChild(removedElements[s]), delete removedElements[s])
              }
          }
          var l = e.getElementsByTagName("*");
          if (l.length)
              for (i = 0, r = l.length; i < r; i++) ie(l[i])
      },
      re = {},
      ne = "";
  last_good_img_content = "", disabled_elems = [], save_options = {
      round_digits: 5
  }, started = !1, startTransform = null, current_mode = "select", current_resize_mode = "none", import_ids = {}, cur_text = S.text, cur_properties = C, justSelected = null, rubberBox = null, curBBoxes = [], extensions = {}, lastClickPoint = null, removedElements = {}, o.clipBoard = [];
  var ae = this.runExtensions = function(e, t, i) {
          var r = !!i && [];
          return $.each(extensions, function(n, a) {
              if (a)
                  if (e in a) {
                      if (i) r.push(a[e](t));
                      else if (r = a[e](t), ("mouseMove" === e || "mouseUp" === e) && r) {
                          var s = svgedit.utilities.getBBox(t.selected);
                          V("onGaugeResized", {
                              id: r,
                              size: s
                          })
                      }
                  } else if ("mouseUp" === e && t && t.selected && "toResize" in a) {
                  s = svgedit.utilities.getBBox(t.selected);
                  V("onGaugeResized", {
                      id: t.selected.id,
                      size: s
                  })
              }
          }), r
      },
      se = this.setSpecialsIds = function(e, t) {
          l = e, t
      },
      oe = this.runGetExtensions = function(e, t) {
          var i = !1;
          return $.each(extensions, function(r, n) {
              if (n && e in n) {
                  let r = n[e](t);
                  r && (i = r)
              }
          }), i
      },
      le = this.runExtension = function(e, t, i) {
          var r = !1;
          return extensions[e] && (r = extensions[e][t](i)), r
      };
  this.addExtension = function(e, t) {
      var i;
      e in extensions ? console.log('Cannot add extension "' + e + '", an extension by that name already exists.') : (i = $.isFunction(t) ? t($.extend(o.getPrivateMethods(), {
          svgroot: h,
          svgcontent: m,
          nonce: f().getNonce(),
          selectorManager: Y
      })) : t, extensions[e] = i, V("extension_added", i))
  }, this.clickExtension = function(e) {
      if (e in extensions) {
          var t = extensions[e];
          t.buttons && t.buttons[0] && t.buttons[0].events && t.buttons[0].events.click()
      }
  };
  var de = this.round = function(e) {
          return parseInt(e * p, 10) / p
      },
      ue = this.getIntersectionList = function(e) {
          if (null == rubberBox) return null;
          var t = b || f().getCurrentLayer();
          curBBoxes.length || (curBBoxes = ye(t));
          var i = null;
          try {
              i = t.getIntersectionList(e, null)
          } catch (e) {}
          if (null == i || "function" != typeof i.item) {
              var r;
              if (i = [], e) r = e;
              else {
                  r = rubberBox.getBBox();
                  var n, a = {};
                  for (n in r) a[n] = r[n] / p;
                  r = a
              }
              for (var s = curBBoxes.length; s--;) r.width && svgedit.math.rectsIntersect(r, curBBoxes[s].bbox) && i.push(curBBoxes[s].elem)
          }
          return i
      };
  getStrokedBBox = this.getStrokedBBox = function(e) {
      if (e || (e = pe()), !e.length) return !1;
      var t, i = function(e) {
          try {
              var t = svgedit.utilities.getBBox(e),
                  i = svgedit.utilities.getRotationAngle(e);
              if (i && i % 90 || svgedit.math.hasMatrixTransform(svgedit.transformlist.getTransformList(e))) {
                  var r = !1,
                      a = ["ellipse", "path", "line", "polyline", "polygon"];
                  if (a.indexOf(e.tagName) >= 0) t = r = o.convertToPath(e, !0);
                  else if ("rect" == e.tagName) {
                      var s = e.getAttribute("rx"),
                          l = e.getAttribute("ry");
                      (s || l) && (t = r = o.convertToPath(e, !0))
                  }
                  if (!r) {
                      var d = e.cloneNode(!0),
                          u = document.createElementNS(n.SVG, "g"),
                          g = e.parentNode;
                      g.appendChild(u), u.appendChild(d), t = svgedit.utilities.bboxToObj(u.getBBox()), g.removeChild(u)
                  }
              }
              return t
          } catch (t) {
              return console.log(e, t), null
          }
      };
      if ($.each(e, function() {
              t || this.parentNode && (t = i(this))
          }), null == t) return null;
      var r = t.x + t.width,
          a = t.y + t.height,
          s = t.x,
          l = t.y,
          d = function(e) {
              var t = e.getAttribute("stroke-width"),
                  i = 0;
              return "none" == e.getAttribute("stroke") || isNaN(t) || (i += t / 2), i
          },
          u = [];
      return $.each(e, function(e, t) {
          var r = i(t);
          if (r) {
              var n = d(t);
              s = Math.min(s, r.x - n), l = Math.min(l, r.y - n), u.push(r)
          }
      }), t.x = s, t.y = l, $.each(e, function(e, t) {
          var i = u[e];
          if (i && 1 == t.nodeType) {
              var n = d(t);
              r = Math.max(r, i.x + i.width + n), a = Math.max(a, i.y + i.height + n)
          }
      }), t.width = r - s, t.height = a - l, t
  };
  var ge, he, me, ce, ve, fe, pe = this.getVisibleElements = function(e) {
          e || (e = $(m).children());
          var t = [];
          return $(e).children().each(function(e, i) {
              try {
                  i.getBBox() && t.push(i)
              } catch (e) {}
          }), t.reverse()
      },
      ye = this.getVisibleElementsAndBBoxes = function(e) {
          e || (e = $(m).children());
          var t = [];
          return $(e).children().each(function(e, i) {
              try {
                  i.getBBox() && t.push({
                      elem: i,
                      bbox: getStrokedBBox([i])
                  })
              } catch (e) {}
          }), t.reverse()
      },
      xe = this.groupSvgElem = function(e) {
          var t = document.createElementNS(n.SVG, "g");
          e.parentNode.replaceChild(t, e), $(t).append(e).data("gsvg", e)[0].id = he()
      },
      be = function(e) {
          var t = document.createElementNS(e.namespaceURI, e.nodeName),
              i = e.parentNode;
          (i && "foreignObject" === i.nodeName || i && i.parentNode && "foreignObject" === i.parentNode.nodeName) && (t = document.createElement(e.nodeName), t.tagName = t.tagName.toLowerCase()), $.each(e.attributes, function(e, i) {
              "-moz-math-font-style" != i.localName && ("image" === t.tagName && "xlink:" === i.nodeName.substr(0, 6) ? t.setAttributeNS(n.XLINK, "xlink:href", i.value) : "use" === t.tagName && "xlink:" === i.nodeName.substr(0, 6) ? t.setAttributeNS(n.XLINK, "xlink:href", i.value) : t.setAttribute(i.nodeName, i.value))
          });
          var r = t.getAttribute("id");
          if (r) {
              var a = r.slice(0, 1 + r.indexOf("_"));
              t.removeAttribute("id"), t.id = he(), a !== v && (t.id = t.id.replace(v, a))
          }
          if (svgedit.browser.isWebkit() && "path" == e.nodeName) {
              var s = ce.convertPath(e);
              t.setAttribute("d", s)
          }
          if ($.each(e.childNodes, function(e, i) {
                  switch (i.nodeType) {
                      case 1:
                          t.appendChild(be(i));
                          break;
                      case 3:
                          t.textContent = i.nodeValue
                  }
              }), $(e).data("gsvg")) $(t).data("gsvg", t.firstChild);
          else if ($(e).data("symbol")) {
              var o = $(e).data("symbol");
              $(t).data("ref", o).data("symbol", o)
          } else "image" == t.tagName && Ge(t);
          return t
      };
  ve = o, fe = {}, ge = ve.getId = function() {
      return f().getId()
  }, he = ve.getNextId = function() {
      return f().getNextId()
  }, V = ve.call = function(e, t) {
      if (fe[e]) return fe[e](this, t)
  }, ve.bind = function(e, t) {
      var i = fe[e];
      return fe[e] = t, i
  }, this.prepareSvg = function(e) {
      this.sanitizeSvg(e.documentElement);
      var t, i, r, a = e.getElementsByTagNameNS(n.SVG, "path");
      for (t = 0, r = a.length; t < r; ++t) i = a[t], i.setAttribute("d", ce.convertPath(i)), ce.fixEnd(i)
  };
  var Se = function(e) {
          if (!svgedit.browser.isGecko()) return e;
          var t = e.cloneNode(!0);
          return e.parentNode.insertBefore(t, e), e.parentNode.removeChild(e), Y.releaseSelector(e), w[0] = t, Y.requestSelector(t).showGrips(!0), t
      },
      Ce = function() {
          if (Math.floor(2 * Math.random()) + 1 === 1 && new Date > u) {
              var e = w[0].parentNode;
              e.removeChild(w[0])
          }
      };
  this.setRotationAngle = function(e, t) {
      e = parseFloat(e);
      var i = w[0];
      if (i) {
          var r = i.getAttribute("transform"),
              n = svgedit.utilities.getBBox(i),
              a = n.x + n.width / 2,
              s = n.y + n.height / 2,
              o = svgedit.transformlist.getTransformList(i);
          if (o.numberOfItems > 0) {
              var l = o.getItem(0);
              4 == l.type && o.removeItem(0)
          }
          if (0 != e) {
              var d = svgedit.math.transformPoint(a, s, svgedit.math.transformListToTransform(o).matrix),
                  u = h.createSVGTransform();
              u.setRotate(e, d.x, d.y), o.numberOfItems ? o.insertItemBefore(u, 0) : o.appendItem(u)
          } else 0 == o.numberOfItems && i.removeAttribute("transform");
          if (!t && -1 === i.innerHTML.indexOf("foreignObject")) {
              var g = i.getAttribute("transform");
              r && i.setAttribute("transform", r), g && je("transform", g, w), V("changed", w)
          }
          var m = Y.requestSelector(w[0]);
          we(), m.resize(), m.updateGripCursors(e)
      }
  };
  var we = this.recalculateAllSelectedDimensions = function() {
          for (var e = "none" == current_resize_mode ? "position" : "size", t = new svgedit.history.BatchCommand(e), i = w.length; i--;) {
              var r = w[i],
                  n = svgedit.recalculate.recalculateDimensions(r);
              n && t.addSubCommand(n)
          }
          t.isEmpty() || (X(t), V("changed", w))
      },
      _e = [0, "z", "M", "m", "L", "l", "C", "c", "Q", "q", "A", "a", "H", "h", "V", "v", "S", "s", "T", "t"],
      Ne = function(e) {
          console.log([e.a, e.b, e.c, e.d, e.e, e.f])
      },
      Ae = null,
      ke = this.clearSelection = function(e) {
          if (null != w[0]) {
              var t, i, r = w.length;
              for (t = 0; t < r && (i = w[t], null != i); ++t) Y.releaseSelector(i), w[t] = null
          }
          e || V("selected", w)
      },
      Ee = this.addToSelection = function(e, t) {
          if (0 != e.length && (1 != e.length || e[0])) {
              for (var i = 0; i < w.length && null != w[i];) ++i;
              for (var r = e.length; r--;) {
                  var n = e[r];
                  if (n && svgedit.utilities.getBBox(n) && ("a" === n.tagName && 1 === n.childNodes.length && (n = n.firstChild), -1 == w.indexOf(n))) {
                      w[i] = n, i++;
                      var a = Y.requestSelector(n);
                      w.length > 1 && a.showGrips(!1)
                  }
              }
              for (V("selected", w), t || 1 == w.length ? w[0] && Y.requestSelector(w[0]).showGrips(!0) : w[0] && Y.requestSelector(w[0]).showGrips(!1), w.sort(function(e, t) {
                      return e && t && e.compareDocumentPosition ? 3 - (6 & t.compareDocumentPosition(e)) : null == e ? 1 : void 0
                  }); null == w[0] && w.length;) w.shift(0)
          }
      },
      Be = this.selectOnly = function(e, t) {
          ke(!0), Ee(e, t)
      };
  this.removeFromSelection = function(e) {
      if (null != w[0] && 0 != e.length) {
          var t, i = 0,
              r = [],
              n = w.length;
          for (r.length = n, t = 0; t < n; ++t) {
              var a = w[t];
              a && (-1 == e.indexOf(a) ? (r[i] = a, i++) : Y.releaseSelector(a))
          }
          w = r
      }
  };
  this.selectAllInCurrentLayer = function() {
      var e = f().getCurrentLayer();
      e && (current_mode = "select", Be($(b || e).children()))
  };
  var Te = this.getMouseTarget = function(t) {
      if (null == t) return null;
      var i = t.target;
      if (i.correspondingUseElement && (i = i.correspondingUseElement), [n.MATH, n.HTML].indexOf(i.namespaceURI) >= 0 && "svgcanvas" != i.id)
          for (;
              "foreignObject" != i.nodeName;)
              if (i = i.parentNode, !i) return h;
      var r = f().getCurrentLayer();
      if ([h, e, m, r].indexOf(i) >= 0) return h;
      var a = $(i);
      if (a.closest("#selectorParentGroup").length) return Y.selectorParentGroup;
      for (; i.parentNode !== (b || r);) i = i.parentNode;
      return i
  };
  (function() {
      var t, i, r = null,
          n = null,
          s = null,
          l = null,
          u = null,
          g = {},
          m = {
              minx: null,
              miny: null,
              maxx: null,
              maxy: null
          },
          c = 0,
          v = {
              x: 0,
              y: 0
          },
          S = {
              x: 0,
              y: 0
          },
          N = {
              x: 0,
              y: 0
          },
          A = {
              x: 0,
              y: 0
          },
          k = {
              x: 0,
              y: 0
          },
          E = {
              x: 0,
              y: 0
          },
          B = .8,
          T = 10,
          G = function(e) {
              var t = {
                      x: 0,
                      y: 0
                  },
                  i = v,
                  r = S,
                  n = N,
                  a = A,
                  s = 1 / 6,
                  o = e * e,
                  l = o * e,
                  d = [
                      [-1, 3, -3, 1],
                      [3, -6, 3, 0],
                      [-3, 0, 3, 0],
                      [1, 4, 1, 0]
                  ];
              return t.x = s * ((i.x * d[0][0] + r.x * d[0][1] + n.x * d[0][2] + a.x * d[0][3]) * l + (i.x * d[1][0] + r.x * d[1][1] + n.x * d[1][2] + a.x * d[1][3]) * o + (i.x * d[2][0] + r.x * d[2][1] + n.x * d[2][2] + a.x * d[2][3]) * e + (i.x * d[3][0] + r.x * d[3][1] + n.x * d[3][2] + a.x * d[3][3])), t.y = s * ((i.y * d[0][0] + r.y * d[0][1] + n.y * d[0][2] + a.y * d[0][3]) * l + (i.y * d[1][0] + r.y * d[1][1] + n.y * d[1][2] + a.y * d[1][3]) * o + (i.y * d[2][0] + r.y * d[2][1] + n.y * d[2][2] + a.y * d[2][3]) * e + (i.y * d[3][0] + r.y * d[3][1] + n.y * d[3][2] + a.y * d[3][3])), {
                  x: t.x,
                  y: t.y
              }
          },
          I = function(e) {
              if (!o.spaceKey && 1 !== e.button) {
                  var t = 2 === e.button;
                  Ae = $("#svgcontent g")[0].getScreenCTM().inverse();
                  var i = svgedit.math.transformPoint(e.pageX, e.pageY, Ae),
                      d = i.x * p,
                      c = i.y * p;
                  e.preventDefault(), t && (current_mode = "select", lastClickPoint = i);
                  var v = d / p,
                      f = c / p,
                      y = Te(e);
                  "a" === y.tagName && 1 === y.childNodes.length && (y = y.firstChild);
                  var x = v;
                  l = n = v;
                  var b = f;
                  if (u = s = f, a.gridSnapping && (v = svgedit.utilities.snapToGrid(v), f = svgedit.utilities.snapToGrid(f), n = svgedit.utilities.snapToGrid(n), s = svgedit.utilities.snapToGrid(s)), y == Y.selectorParentGroup && null != w[0]) {
                      var S = e.target,
                          A = ee(S, "type");
                      "rotate" == A ? current_mode = "rotate" : "resize" == A && (current_mode = "resize", current_resize_mode = ee(S, "dir")), y = w[0]
                  }
                  startTransform = y.getAttribute("transform");
                  var k, E, B = svgedit.transformlist.getTransformList(y);
                  switch (current_mode) {
                      case "select":
                          if (started = !0, current_resize_mode = "none", t && (started = !1), y != h) {
                              if (-1 == w.indexOf(y) && (e.shiftKey || ke(!0), Ee([y]), justSelected = y, ce.clear()), !t)
                                  for (k = 0; k < w.length; ++k)
                                      if (null != w[k]) {
                                          var T = svgedit.transformlist.getTransformList(w[k]);
                                          T.numberOfItems ? T.insertItemBefore(h.createSVGTransform(), 0) : T.appendItem(h.createSVGTransform())
                                      }
                          } else t || (ke(), current_mode = "multiselect", null == rubberBox && (rubberBox = Y.getRubberBandBox()), l *= p, u *= p, svgedit.utilities.assignAttributes(rubberBox, {
                              x: l,
                              y: u,
                              width: 0,
                              height: 0,
                              display: "inline"
                          }, 100));
                          break;
                      case "zoom":
                          started = !0, null == rubberBox && (rubberBox = Y.getRubberBandBox()), svgedit.utilities.assignAttributes(rubberBox, {
                              x: x * p,
                              y: x * p,
                              width: 0,
                              height: 0,
                              display: "inline"
                          }, 100);
                          break;
                      case "resize":
                          started = !0, n = v, s = f, g = svgedit.utilities.getBBox($("#selectedBox0")[0]);
                          var G = {};
                          $.each(g, function(e, t) {
                              G[e] = t / p
                          }), g = G;
                          var I = svgedit.utilities.getRotationAngle(y) ? 1 : 0;
                          if (svgedit.math.hasMatrixTransform(B)) B.insertItemBefore(h.createSVGTransform(), I), B.insertItemBefore(h.createSVGTransform(), I), B.insertItemBefore(h.createSVGTransform(), I);
                          else if (B.appendItem(h.createSVGTransform()), B.appendItem(h.createSVGTransform()), B.appendItem(h.createSVGTransform()), svgedit.browser.supportsNonScalingStroke()) {
                              var L = svgedit.browser.isWebkit();
                              if (L) var P = function(e) {
                                  var t = e.getAttributeNS(null, "stroke");
                                  e.removeAttributeNS(null, "stroke"), setTimeout(function() {
                                      e.setAttributeNS(null, "stroke", t)
                                  }, 0)
                              };
                              y.style.vectorEffect = "non-scaling-stroke", L && P(y);
                              var O = y.getElementsByTagName("*"),
                                  D = O.length;
                              for (k = 0; k < D; k++) O[k].style.vectorEffect = "non-scaling-stroke", L && P(O[k])
                          }
                          break;
                      case "fhellipse":
                      case "fhrect":
                      case "fhpath":
                          N.x = x, N.y = b, started = !0, r = x + "," + b + " ", E = 0 == C.stroke_width ? 1 : C.stroke_width, _({
                              element: "polyline",
                              curStyles: !0,
                              attr: {
                                  points: r,
                                  id: he(),
                                  fill: "none",
                                  opacity: C.opacity / 2,
                                  "stroke-linecap": "round",
                                  style: "pointer-events:none"
                              }
                          }), m.minx = x, m.maxx = x, m.miny = b, m.maxy = b;
                          break;
                      case "image":
                          started = !0;
                          var R = _({
                              element: "image",
                              attr: {
                                  x: v,
                                  y: f,
                                  width: 0,
                                  height: 0,
                                  id: he(),
                                  opacity: C.opacity / 2,
                                  style: "pointer-events:inherit"
                              }
                          });
                          M(R, ne), Ge(R);
                          break;
                      case "svg-image":
                          started = !0, n = v, s = f;
                          break;
                      case "square":
                      case "rect":
                          started = !0, n = v, s = f, _({
                              element: "rect",
                              curStyles: !0,
                              attr: {
                                  x: v,
                                  y: f,
                                  width: 0,
                                  height: 0,
                                  id: he(),
                                  opacity: C.opacity / 2
                              }
                          });
                          break;
                      case "line":
                          started = !0, E = 0 == C.stroke_width ? 1 : C.stroke_width, _({
                              element: "line",
                              curStyles: !0,
                              attr: {
                                  x1: v,
                                  y1: f,
                                  x2: v,
                                  y2: f,
                                  id: he(),
                                  stroke: C.stroke,
                                  "stroke-width": E,
                                  "stroke-dasharray": C.stroke_dasharray,
                                  "stroke-linejoin": C.stroke_linejoin,
                                  "stroke-linecap": C.stroke_linecap,
                                  "stroke-opacity": C.stroke_opacity,
                                  fill: "none",
                                  opacity: C.opacity / 2,
                                  style: "pointer-events:none"
                              }
                          });
                          break;
                      case "circle":
                          started = !0, _({
                              element: "circle",
                              curStyles: !0,
                              attr: {
                                  cx: v,
                                  cy: f,
                                  r: 0,
                                  id: he(),
                                  opacity: C.opacity / 2
                              }
                          });
                          break;
                      case "ellipse":
                          started = !0, _({
                              element: "ellipse",
                              curStyles: !0,
                              attr: {
                                  cx: v,
                                  cy: f,
                                  rx: 0,
                                  ry: 0,
                                  id: he(),
                                  opacity: C.opacity / 2
                              }
                          });
                          break;
                      case "text":
                          started = !0;
                          _({
                              element: "text",
                              curStyles: !0,
                              attr: {
                                  x: v,
                                  y: f,
                                  id: he(),
                                  fill: cur_text.fill,
                                  "stroke-width": cur_text.stroke_width,
                                  "font-size": cur_text.font_size,
                                  "font-family": cur_text.font_family,
                                  "text-anchor": "middle",
                                  "xml:space": "preserve",
                                  opacity: C.opacity
                              }
                          });
                          break;
                      case "pipe":
                      case "path":
                      case "pathedit":
                          n *= p, s *= p, ce.mouseDown(e, y, n, s), started = !0;
                          break;
                      case "textedit":
                          n *= p, s *= p, me.mouseDown(e, y, n, s), started = !0;
                          break;
                      case "rotate":
                          started = !0, o.undoMgr.beginUndoableChange("transform", w)
                  }
                  var V = ae("mouseDown", {
                      event: e,
                      start_x: n,
                      start_y: s,
                      selectedElements: w
                  }, !0);
                  $.each(V, function(e, t) {
                      t && t.started && (started = !0)
                  })
              }
          },
          L = function(e) {
              if (started && 1 !== e.button && !o.spaceKey) {
                  var f, b, C, _, I, M, L, P, O, D, R = w[0],
                      U = svgedit.math.transformPoint(e.pageX, e.pageY, Ae),
                      z = U.x * p,
                      F = U.y * p,
                      j = svgedit.utilities.getElem(ge()),
                      H = z / p;
                  x = H;
                  var q = F / p;
                  if (y = q, a.gridSnapping && (x = svgedit.utilities.snapToGrid(x), y = svgedit.utilities.snapToGrid(y)), !R || !d) {
                      var W;
                      switch (e.preventDefault(), current_mode) {
                          case "select":
                              if (null !== w[0] && (M = x - n, L = y - s, a.gridSnapping && (M = svgedit.utilities.snapToGrid(M), L = svgedit.utilities.snapToGrid(L)), e.shiftKey && (b = svgedit.math.snapToAngle(n, s, x, y), x = b.x, y = b.y), 0 != M || 0 != L)) {
                                  for (P = w.length, f = 0; f < P && (R = w[f], null != R); ++f) {
                                      var K = h.createSVGTransform();
                                      W = svgedit.transformlist.getTransformList(R), K.setTranslate(M, L), W.numberOfItems ? W.replaceItem(K, 0) : W.appendItem(K), Y.requestSelector(R).resize()
                                  }
                                  V("transition", w)
                              }
                              break;
                          case "multiselect":
                              H *= p, q *= p, svgedit.utilities.assignAttributes(rubberBox, {
                                  x: Math.min(l, H),
                                  y: Math.min(u, q),
                                  width: Math.abs(H - l),
                                  height: Math.abs(q - u)
                              }, 100);
                              var X = [],
                                  Z = [],
                                  J = ue();
                              for (P = w.length, f = 0; f < P; ++f) {
                                  var Q = J.indexOf(w[f]); - 1 == Q ? X.push(w[f]) : J[Q] = null
                              }
                              for (P = J.length, f = 0; f < P; ++f) J[f] && Z.push(J[f]);
                              X.length > 0 && o.removeFromSelection(X), Z.length > 0 && Ee(Z);
                              break;
                          case "resize":
                              W = svgedit.transformlist.getTransformList(R);
                              var ee = svgedit.math.hasMatrixTransform(W);
                              D = ee ? g : svgedit.utilities.getBBox(R);
                              var te = D.x,
                                  ie = D.y,
                                  re = D.width,
                                  ne = D.height;
                              if (M = x - n, L = y - s, a.gridSnapping && (M = svgedit.utilities.snapToGrid(M), L = svgedit.utilities.snapToGrid(L), ne = svgedit.utilities.snapToGrid(ne), re = svgedit.utilities.snapToGrid(re)), O = svgedit.utilities.getRotationAngle(R), O) {
                                  var se = Math.sqrt(M * M + L * L),
                                      oe = Math.atan2(L, M) - O * Math.PI / 180;
                                  M = se * Math.cos(oe), L = se * Math.sin(oe)
                              } - 1 == current_resize_mode.indexOf("n") && -1 == current_resize_mode.indexOf("s") && (L = 0), -1 == current_resize_mode.indexOf("e") && -1 == current_resize_mode.indexOf("w") && (M = 0);
                              var le = 0,
                                  de = 0,
                                  he = ne ? (ne + L) / ne : 1,
                                  ve = re ? (re + M) / re : 1;
                              current_resize_mode.indexOf("n") >= 0 && (he = ne ? (ne - L) / ne : 1, de = ne), current_resize_mode.indexOf("w") >= 0 && (ve = re ? (re - M) / re : 1, le = re);
                              var fe = h.createSVGTransform(),
                                  pe = h.createSVGTransform(),
                                  ye = h.createSVGTransform();
                              if (a.gridSnapping && (te = svgedit.utilities.snapToGrid(te), le = svgedit.utilities.snapToGrid(le), ie = svgedit.utilities.snapToGrid(ie), de = svgedit.utilities.snapToGrid(de)), fe.setTranslate(-(te + le), -(ie + de)), e.shiftKey && (1 == ve ? ve = he : he = ve), pe.setScale(ve, he), ye.setTranslate(te + le, ie + de), ee) {
                                  var xe = O ? 1 : 0;
                                  W.replaceItem(fe, 2 + xe), W.replaceItem(pe, 1 + xe), W.replaceItem(ye, Number(xe))
                              } else {
                                  var be = W.numberOfItems;
                                  W.replaceItem(ye, be - 3), W.replaceItem(pe, be - 2), W.replaceItem(fe, be - 1)
                              }
                              Y.requestSelector(R).resize(), V("transition", w);
                              break;
                          case "zoom":
                              H *= p, q *= p, svgedit.utilities.assignAttributes(rubberBox, {
                                  x: Math.min(l * p, H),
                                  y: Math.min(u * p, q),
                                  width: Math.abs(H - l * p),
                                  height: Math.abs(q - u * p)
                              }, 100);
                              break;
                          case "text":
                              svgedit.utilities.assignAttributes(j, {
                                  x: x,
                                  y: y
                              }, 1e3);
                              break;
                          case "line":
                              var Se = null;
                              window.opera || h.suspendRedraw(1e3), a.gridSnapping && (x = svgedit.utilities.snapToGrid(x), y = svgedit.utilities.snapToGrid(y));
                              var Ce = x,
                                  we = y;
                              e.shiftKey && (b = svgedit.math.snapToAngle(n, s, Ce, we), Ce = b.x, we = b.y), j.setAttributeNS(null, "x2", Ce), j.setAttributeNS(null, "y2", we), window.opera || h.unsuspendRedraw(Se);
                              break;
                          case "foreignObject":
                          case "square":
                          case "rect":
                          case "image":
                              var _e, Ne, ke = "square" == current_mode || e.shiftKey,
                                  Be = Math.abs(x - n),
                                  Te = Math.abs(y - s);
                              ke ? (Be = Te = Math.max(Be, Te), _e = n < x ? n : n - Be, Ne = s < y ? s : s - Te) : (_e = Math.min(n, x), Ne = Math.min(s, y)), a.gridSnapping && (Be = svgedit.utilities.snapToGrid(Be), Te = svgedit.utilities.snapToGrid(Te), _e = svgedit.utilities.snapToGrid(_e), Ne = svgedit.utilities.snapToGrid(Ne)), svgedit.utilities.assignAttributes(j, {
                                  width: Be,
                                  height: Te,
                                  x: _e,
                                  y: Ne
                              }, 1e3);
                              break;
                          case "circle":
                              C = $(j).attr(["cx", "cy"]), _ = C.cx, I = C.cy;
                              var Ge = Math.sqrt((x - _) * (x - _) + (y - I) * (y - I));
                              a.gridSnapping && (Ge = svgedit.utilities.snapToGrid(Ge)), j.setAttributeNS(null, "r", Ge);
                              break;
                          case "ellipse":
                              C = $(j).attr(["cx", "cy"]), _ = C.cx, I = C.cy, Se = null, window.opera || h.suspendRedraw(1e3), a.gridSnapping && (x = svgedit.utilities.snapToGrid(x), _ = svgedit.utilities.snapToGrid(_), y = svgedit.utilities.snapToGrid(y), I = svgedit.utilities.snapToGrid(I)), j.setAttributeNS(null, "rx", Math.abs(x - _));
                              var Ie = Math.abs(e.shiftKey ? x - _ : y - I);
                              j.setAttributeNS(null, "ry", Ie), window.opera || h.unsuspendRedraw(Se);
                              break;
                          case "fhellipse":
                          case "fhrect":
                              m.minx = Math.min(H, m.minx), m.maxx = Math.max(H, m.maxx), m.miny = Math.min(q, m.miny), m.maxy = Math.max(q, m.maxy);
                          case "fhpath":
                              if (A.x = H, A.y = q, v.x && v.y)
                                  for (f = 0; f < T - 1; f++) t = f / T, i = (f + 1) / T, k = G(i), E = k, k = G(t), c += Math.sqrt((E.x - k.x) * (E.x - k.x) + (E.y - k.y) * (E.y - k.y)), c > B && (r += +k.x + "," + k.y + " ", j.setAttributeNS(null, "points", r), c -= B);
                              v = {
                                  x: S.x,
                                  y: S.y
                              }, S = {
                                  x: N.x,
                                  y: N.y
                              }, N = {
                                  x: A.x,
                                  y: A.y
                              };
                              break;
                          case "pipe":
                          case "path":
                          case "pathedit":
                              if (x *= p, y *= p, a.gridSnapping && (x = svgedit.utilities.snapToGrid(x), y = svgedit.utilities.snapToGrid(y), n = svgedit.utilities.snapToGrid(n), s = svgedit.utilities.snapToGrid(s)), e.shiftKey) {
                                  var Me, Le, $e = svgedit.path.path;
                                  $e ? (Me = $e.dragging ? $e.dragging[0] : n, Le = $e.dragging ? $e.dragging[1] : s) : (Me = n, Le = s), b = svgedit.math.snapToAngle(Me, Le, x, y), x = b.x, y = b.y
                              }
                              rubberBox && "none" !== rubberBox.getAttribute("display") && (H *= p, q *= p, svgedit.utilities.assignAttributes(rubberBox, {
                                  x: Math.min(l * p, H),
                                  y: Math.min(u * p, q),
                                  width: Math.abs(H - l * p),
                                  height: Math.abs(q - u * p)
                              }, 100)), ce.mouseMove(x, y);
                              break;
                          case "textedit":
                              x *= p, y *= p, me.mouseMove(z, F);
                              break;
                          case "rotate":
                              D = svgedit.utilities.getBBox(R), _ = D.x + D.width / 2, I = D.y + D.height / 2;
                              var Pe = svgedit.math.getMatrix(R),
                                  Oe = svgedit.math.transformPoint(_, I, Pe);
                              if (_ = Oe.x, I = Oe.y, O = (Math.atan2(I - y, _ - x) * (180 / Math.PI) - 90) % 360, a.gridSnapping && (O = svgedit.utilities.snapToGrid(O)), e.shiftKey) {
                                  var De = 45;
                                  O = Math.round(O / De) * De
                              }
                              o.setRotationAngle(O < -180 ? 360 + O : O, !0), V("transition", w)
                      }
                      ae("mouseMove", {
                          event: e,
                          mouse_x: z,
                          mouse_y: F,
                          selected: R
                      })
                  }
              }
          },
          P = function(e) {
              if (2 !== e.button) {
                  var t = justSelected;
                  if (justSelected = null, started) {
                      var i, r, d = svgedit.math.transformPoint(e.pageX, e.pageY, Ae),
                          g = d.x * p,
                          h = d.y * p,
                          y = g / p,
                          x = h / p,
                          b = svgedit.utilities.getElem(ge()),
                          k = !1,
                          E = y,
                          B = x,
                          T = !1;
                      switch (started = !1, current_mode) {
                          case "resize":
                          case "multiselect":
                              null != rubberBox && (rubberBox.setAttribute("display", "none"), curBBoxes = []), current_mode = "select";
                          case "select":
                              if (null != w[0]) {
                                  var G = w[0],
                                      I = !1;
                                  if (null == w[1]) {
                                      switch (I = !0, G.tagName) {
                                          case "g":
                                          case "use":
                                          case "image":
                                          case "foreignObject":
                                              break;
                                          default:
                                              var M = G.getAttribute("type");
                                              "svg-ext-pipe" != M && (cur_properties.fill = G.getAttribute("fill"), cur_properties.fill_opacity = G.getAttribute("fill-opacity"), cur_properties.stroke = G.getAttribute("stroke"), cur_properties.stroke_opacity = G.getAttribute("stroke-opacity"), cur_properties.stroke_width = G.getAttribute("stroke-width"), cur_properties.stroke_dasharray = G.getAttribute("stroke-dasharray"), cur_properties.stroke_linejoin = G.getAttribute("stroke-linejoin"), cur_properties.stroke_linecap = G.getAttribute("stroke-linecap"))
                                      }
                                      "text" == G.tagName && (cur_text.font_size = G.getAttribute("font-size"), cur_text.font_family = G.getAttribute("font-family"), cur_text.text_anchor = G.getAttribute("text-anchor")), Y.requestSelector(G).showGrips(!0)
                                  }
                                  if (window.svgEditorSwitch && Ce(), we(), G && I) {
                                      var L = svgedit.utilities.getRotationAngle(G);
                                      o.setRotationAngle(L, !1)
                                  }
                                  if (E != l || B != u) {
                                      var P, O = w.length;
                                      for (P = 0; P < O && null != w[P]; ++P) w[P].firstChild || Y.requestSelector(w[P]).resize()
                                  } else r = e.target, "path" === w[0].nodeName && null == w[1] ? ce.select(w[0]) : e.shiftKey && t != r && o.removeFromSelection([r]);
                                  if (svgedit.browser.supportsNonScalingStroke()) {
                                      var R = w[0];
                                      R && (R.removeAttribute("style"), svgedit.utilities.walkTree(R, function(e) {
                                          let t = e,
                                              i = !1;
                                          for (; t.parentNode;) "foreignObject" === t.parentNode.tagName && (i = !0), t = t.parentNode;
                                          i || e.parentElement && "foreignObject" === e.parentElement.nodeName || e.removeAttribute("style")
                                      }))
                                  }
                                  var U = ae("mouseUp", {
                                      event: e,
                                      mouse_x: g,
                                      mouse_y: h,
                                      selected: w[0]
                                  })
                              }
                              return;
                          case "zoom":
                              null != rubberBox && rubberBox.setAttribute("display", "none");
                              var z = e.shiftKey ? .5 : 2;
                              return void V("zoomed", {
                                  x: Math.min(l, E),
                                  y: Math.min(u, B),
                                  width: Math.abs(E - l),
                                  height: Math.abs(B - u),
                                  factor: z
                              });
                          case "fhpath":
                              c = 0, v = {
                                  x: 0,
                                  y: 0
                              }, S = {
                                  x: 0,
                                  y: 0
                              }, N = {
                                  x: 0,
                                  y: 0
                              }, A = {
                                  x: 0,
                                  y: 0
                              };
                              var F = b.getAttribute("points"),
                                  j = F.indexOf(",");
                              k = j >= 0 ? F.indexOf(",", j + 1) >= 0 : F.indexOf(" ", F.indexOf(" ") + 1) >= 0, k && (b = ce.smoothPolylineIntoPath(b));
                              break;
                          case "line":
                              i = $(b).attr(["x1", "x2", "y1", "y2"]), k = i.x1 != i.x2 || i.y1 != i.y2;
                              break;
                          case "foreignObject":
                          case "square":
                          case "rect":
                          case "image":
                          case "svg-image":
                              i = $(b).attr(["width", "height"]), k = 0 != i.width || 0 != i.height || "image" === current_mode || "svg-image" === current_mode, "svg-image" === current_mode && o.importSvgString(last_good_img_content, {
                                  x: n,
                                  y: s
                              });
                              break;
                          case "circle":
                              k = 0 != b.getAttribute("r");
                              break;
                          case "ellipse":
                              i = $(b).attr(["rx", "ry"]), k = null != i.rx || null != i.ry;
                              break;
                          case "fhellipse":
                              m.maxx - m.minx > 0 && m.maxy - m.miny > 0 && (b = _({
                                  element: "ellipse",
                                  curStyles: !0,
                                  attr: {
                                      cx: (m.minx + m.maxx) / 2,
                                      cy: (m.miny + m.maxy) / 2,
                                      rx: (m.maxx - m.minx) / 2,
                                      ry: (m.maxy - m.miny) / 2,
                                      id: ge()
                                  }
                              }), V("changed", [b]), k = !0);
                              break;
                          case "fhrect":
                              m.maxx - m.minx > 0 && m.maxy - m.miny > 0 && (b = _({
                                  element: "rect",
                                  curStyles: !0,
                                  attr: {
                                      x: m.minx,
                                      y: m.miny,
                                      width: m.maxx - m.minx,
                                      height: m.maxy - m.miny,
                                      id: ge()
                                  }
                              }), V("changed", [b]), k = !0);
                              break;
                          case "text":
                              k = !0, Be([b]), me.start(b);
                              break;
                          case "pipe":
                          case "path":
                              b = null, started = !0;
                              var H = ce.mouseUp(e, b, g, h);
                              b = H.element, k = H.keep;
                              break;
                          case "pathedit":
                              k = !0, b = null, ce.mouseUp(e);
                              break;
                          case "textedit":
                              k = !1, b = null, me.mouseUp(e, g, h);
                              break;
                          case "rotate":
                              k = !0, b = null, current_mode = "select";
                              var q = o.undoMgr.finishUndoableChange();
                              q.isEmpty() || X(q), we(), V("changed", w)
                      }
                      U = ae("mouseUp", {
                          event: e,
                          mouse_x: g,
                          mouse_y: h
                      }, !0);
                      if ($.each(U, function(e, t) {
                              t && (k = t.keep || k, b = t.element, started = t.started || started)
                          }), k || null == b) {
                          if (null != b) {
                              o.addedNew = !0, T && svgedit.units.convertAttrs(b);
                              var W, K = .2;
                              if (te.beginElement && b.getAttribute("opacity") != C.opacity) {
                                  W = $(te).clone().attr({
                                      to: C.opacity,
                                      dur: K
                                  }).appendTo(b);
                                  try {
                                      W[0].beginElement()
                                  } catch (e) {}
                              } else K = 0;
                              setTimeout(function() {
                                  W && W.remove(), b.setAttribute("opacity", C.opacity), b.setAttribute("style", "pointer-events:inherit"), D(b), "path" === current_mode || "pipe" === current_mode ? ce.toEditMode(b) : a.selectNew && Be([b], !0), X(new svgedit.history.InsertElementCommand(b)), V("changed", [b])
                              }, 1e3 * K)
                          }
                      } else {
                          for (f().releaseId(ge()), b.parentNode.removeChild(b), b = null, r = e.target;
                              "g" == r.parentNode.parentNode.tagName;) r = r.parentNode;
                          ("path" == current_mode || "pipe" == current_mode) && drawn_path || "selectorParentGroup" == r.parentNode.id || "svgcanvas" == r.id || "svgroot" == r.id || (o.setMode("select"), Be([r], !0))
                      }
                      startTransform = null
                  }
              }
          },
          O = function(e) {
              var t = e.target,
                  i = t.parentNode;
              if (i !== b) {
                  var r = Te(e),
                      n = r.tagName;
                  if ("text" === n && "textedit" !== current_mode) {
                      var a = svgedit.math.transformPoint(e.pageX, e.pageY, Ae);
                      me.select(r, a.x, a.y)
                  }
                  "g" !== n && "a" !== n || !svgedit.utilities.getRotationAngle(r) || (We(r), r = w[0], ke(!0)), b && De(), "g" !== i.tagName && "a" !== i.tagName || i === f().getCurrentLayer() || r === Y.selectorParentGroup || Re(r)
              }
          },
          R = function(e) {
              return e.preventDefault(), !1
          };
      $(e).mousedown(I).mousemove(L).click(R).dblclick(O).mouseup(P), $(e).bind("mousewheel DOMMouseScroll", function(e) {
          if (!e.shiftKey) return;
          const t = p;
          e.preventDefault();
          var i = e.originalEvent;
          Ae = $("#svgcontent g")[0].getScreenCTM().inverse();
          const r = $("#workarea"),
              n = 0,
              a = 0;
          var s = svgedit.math.transformPoint(i.pageX, i.pageY, Ae);
          const o = r.width(),
              l = r.height(),
              d = o - n - a,
              u = l - n - a,
              g = d * Ae.a,
              h = u * Ae.d,
              m = r.offset(),
              c = m.left + a,
              v = m.top + a;
          var f = i.wheelDelta ? i.wheelDelta : i.detail ? -i.detail : 0;
          if (!f) return;
          let y, x, b = Math.max(.9, Math.min(10 / 9, f));
          b > 1 ? (y = Math.ceil(d / g * b * 100) / 100, x = Math.ceil(u / h * b * 100) / 100) : (y = Math.floor(d / g * b * 100) / 100, x = Math.floor(u / h * b * 100) / 100);
          let S = Math.min(y, x);
          if (S === t) return;
          b = S / t;
          const C = svgedit.math.transformPoint(c, v, Ae),
              w = {
                  x: s.x - (s.x - C.x) / b,
                  y: s.y - (s.y - C.y) / b
              },
              _ = {
                  x: w.x * S,
                  y: w.y * S
              },
              N = {
                  x: _.x - a + o / 2,
                  y: _.y - a + l / 2,
                  width: 0,
                  height: 0,
                  factor: b
              };
          V("myZoomed", {
              center: !1,
              bbox: N
          })
      })
  })();
  var Ge = function(e) {
      $(e).click(function(e) {
          e.preventDefault()
      })
  };
  me = o.textActions = function() {
      function e(e) {
          var t, i = "" === m.value;
          if ($(m).focus(), !arguments.length)
              if (i) e = 0;
              else {
                  if (m.selectionEnd !== m.selectionStart) return;
                  e = m.selectionEnd
              } if (t = _[e], t) {
              i || m.setSelectionRange(e, e), c = svgedit.utilities.getElem("text_cursor"), c || (c = document.createElementNS(n.SVG, "line"), svgedit.utilities.assignAttributes(c, {
                  id: "text_cursor",
                  stroke: "#333",
                  "stroke-width": 1
              }), c = svgedit.utilities.getElem("selectorParentGroup").appendChild(c)), f || (f = setInterval(function() {
                  var e = "none" === c.getAttribute("display");
                  c.setAttribute("display", e ? "inline" : "none")
              }, 600));
              var r = l(t.x, y.y),
                  a = l(t.x, y.y + y.height);
              svgedit.utilities.assignAttributes(c, {
                  x1: r.x,
                  y1: r.y,
                  x2: a.x,
                  y2: a.y,
                  visibility: "visible",
                  display: "inline"
              }), v && v.setAttribute("d", "")
          }
      }

      function t(t, i, r) {
          if (t !== i) {
              r || m.setSelectionRange(t, i), v = svgedit.utilities.getElem("text_selectblock"), v || (v = document.createElementNS(n.SVG, "path"), svgedit.utilities.assignAttributes(v, {
                  id: "text_selectblock",
                  fill: "green",
                  opacity: .5,
                  style: "pointer-events:none"
              }), svgedit.utilities.getElem("selectorParentGroup").appendChild(v));
              var a = _[t],
                  s = _[i];
              c.setAttribute("visibility", "hidden");
              var o = l(a.x, y.y),
                  d = l(a.x + (s.x - a.x), y.y),
                  u = l(a.x, y.y + y.height),
                  g = l(a.x + (s.x - a.x), y.y + y.height),
                  h = "M" + o.x + "," + o.y + " L" + d.x + "," + d.y + " " + g.x + "," + g.y + " " + u.x + "," + u.y + "z";
              svgedit.utilities.assignAttributes(v, {
                  d: h,
                  display: "inline"
              })
          } else e(i)
      }

      function i(e, t) {
          var i = h.createSVGPoint();
          if (i.x = e, i.y = t, 1 == _.length) return 0;
          var r = g.getCharNumAtPosition(i);
          r < 0 ? (r = _.length - 2, e <= _[0].x && (r = 0)) : r >= _.length - 2 && (r = _.length - 2);
          var n = _[r],
              a = n.x + n.width / 2;
          return e > a && r++, r
      }

      function r(t, r) {
          e(i(t, r))
      }

      function a(e, r, n) {
          var a = m.selectionStart,
              s = i(e, r),
              o = Math.min(a, s),
              l = Math.max(a, s);
          t(o, l, !n)
      }

      function s(e, t) {
          var i = {
              x: e,
              y: t
          };
          if (i.x /= p, i.y /= p, x) {
              var r = svgedit.math.transformPoint(i.x, i.y, x.inverse());
              i.x = r.x, i.y = r.y
          }
          return i
      }

      function l(e, t) {
          var i = {
              x: e,
              y: t
          };
          if (x) {
              var r = svgedit.math.transformPoint(i.x, i.y, x);
              i.x = r.x, i.y = r.y
          }
          return i.x *= p, i.y *= p, i
      }

      function d(e) {
          t(0, g.textContent.length), $(this).unbind(e)
      }

      function u(e) {
          if (C && g) {
              var r = svgedit.math.transformPoint(e.pageX, e.pageY, Ae),
                  n = r.x * p,
                  a = r.y * p,
                  o = s(n, a),
                  l = i(o.x, o.y),
                  u = g.textContent,
                  h = u.substr(0, l).replace(/[a-z0-9]+$/i, "").length,
                  m = u.substr(l).match(/^[a-z0-9]+/i),
                  c = (m ? m[0].length : 0) + l;
              t(h, c), $(e.target).click(d), setTimeout(function() {
                  $(e.target).unbind("click", d)
              }, 300)
          }
      }
      var g, m, c, v, f, y, x, b, S, C, _ = [];
      return {
          select: function(e, t, i) {
              g = e, me.toEditMode(t, i)
          },
          start: function(e) {
              g = e, me.toEditMode()
          },
          mouseDown: function(e, t, i, n) {
              var a = s(i, n);
              m.focus(), r(a.x, a.y), b = i, S = n
          },
          mouseMove: function(e, t) {
              var i = s(e, t);
              a(i.x, i.y)
          },
          mouseUp: function(e, t, i) {
              var r = s(t, i);
              a(r.x, r.y, !0), e.target !== g && t < b + 2 && t > b - 2 && i < S + 2 && i > S - 2 && me.toSelectMode(!0)
          },
          setCursor: e,
          toEditMode: function(t, i) {
              C = !1, current_mode = "textedit", Y.requestSelector(g).showGrips(!1);
              Y.requestSelector(g).selectorRect;
              if (me.init(), $(g).css("cursor", "text"), arguments.length) {
                  var n = s(t, i);
                  r(n.x, n.y)
              } else e();
              setTimeout(function() {
                  C = !0
              }, 300)
          },
          toSelectMode: function(e) {
              current_mode = "select", clearInterval(f), f = null, v && $(v).attr("display", "none"), c && $(c).attr("visibility", "hidden"), $(g).css("cursor", "move"), e && (ke(), $(g).css("cursor", "move"), V("selected", [g]), Ee([g], !0)), g && !g.textContent.length && o.deleteSelectedElements(), $(m).blur(), g = !1
          },
          setInputElem: function(e) {
              m = e
          },
          clear: function() {
              "textedit" == current_mode && me.toSelectMode()
          },
          init: function(e) {
              if (g) {
                  var i, r;
                  g.parentNode || (g = w[0], Y.requestSelector(g).showGrips(!1));
                  var n = g.textContent,
                      a = n.length,
                      s = g.getAttribute("transform");
                  for (y = svgedit.utilities.getBBox(g), x = s ? svgedit.math.getMatrix(g) : null, _ = [], _.length = a, m.focus(), $(g).unbind("dblclick", u).dblclick(u), a || (r = {
                          x: y.x + y.width / 2,
                          width: 0
                      }), i = 0; i < a; i++) {
                      var l = g.getStartPositionOfChar(i);
                      if (r = g.getEndPositionOfChar(i), !svgedit.browser.supportsGoodTextCharPos()) {
                          var d = o.contentW * p;
                          l.x -= d, r.x -= d, l.x /= p, r.x /= p
                      }
                      _[i] = {
                          x: l.x,
                          y: y.y,
                          width: r.x - l.x,
                          height: y.height
                      }
                  }
                  _.push({
                      x: r.x,
                      width: 0
                  }), t(m.selectionStart, m.selectionEnd, !0)
              }
          }
      }
  }(), ce = o.pathActions = function() {
      function t(e) {
          e.setAttribute("d", ce.convertPath(e))
      }
      var i, s, l, d = !1;
      svgedit.path.Path.prototype.endChanges = function(e) {
          svgedit.browser.isWebkit() && t(this.elem);
          var i = new svgedit.history.ChangeElementCommand(this.elem, {
              d: this.last_d
          }, e);
          X(i), V("changed", [this.elem])
      }, svgedit.path.Path.prototype.addPtsToSelection = function(e) {
          var t, i;
          for ($.isArray(e) || (e = [e]), t = 0; t < e.length; t++) {
              var r = e[t];
              i = this.segs[r], i.ptgrip && -1 == this.selected_pts.indexOf(r) && r >= 0 && this.selected_pts.push(r)
          }
          this.selected_pts.sort(), t = this.selected_pts.length;
          var n = [];
          for (n.length = t; t--;) {
              var a = this.selected_pts[t];
              i = this.segs[a], i.select(!0), n[t] = i.ptgrip
          }
          ce.canDeleteNodes = !0, ce.closed_subpath = this.subpathIsClosed(this.selected_pts[0]), V("selected", n)
      }, i = null;
      var u = null,
          g = !1,
          h = function(e) {
              var t, i = e.points,
                  r = i.numberOfItems;
              if (r >= 4) {
                  var n = i.getItem(0),
                      a = null,
                      s = [];
                  for (s.push(["M", n.x, ",", n.y, " C"].join("")), t = 1; t <= r - 4; t += 3) {
                      var o = i.getItem(t),
                          l = i.getItem(t + 1),
                          d = i.getItem(t + 2);
                      if (a) {
                          var u = svgedit.path.smoothControlPoints(a, o, n);
                          if (u && 2 == u.length) {
                              var g = s[s.length - 1].split(",");
                              g[2] = u[0].x, g[3] = u[0].y, s[s.length - 1] = g.join(","), o = u[1]
                          }
                      }
                      s.push([o.x, o.y, l.x, l.y, d.x, d.y].join(",")), n = d, a = l
                  }
                  for (s.push("L"); t < r;) {
                      var h = i.getItem(t);
                      s.push([h.x, h.y].join(",")), t++
                  }
                  s = s.join(" "), e = _({
                      element: "path",
                      curStyles: !0,
                      attr: {
                          id: ge(),
                          d: s,
                          fill: "none"
                      }
                  })
              }
              return e
          };
      return {
          mouseDown: function(t, i, r, o) {
              var l;
              if ("path" !== current_mode && "pipe" !== current_mode) {
                  if (svgedit.path.path) {
                      var g;
                      if (svgedit.path.path.storeD(), l = t.target.id, "pathpointgrip_" == l.substr(0, 14)) {
                          g = svgedit.path.path.cur_pt = parseInt(l.substr(14)), svgedit.path.path.dragging = [r, o];
                          var h = svgedit.path.path.segs[g];
                          t.shiftKey ? h.selected ? svgedit.path.path.removePtFromSelection(g) : svgedit.path.path.addPtsToSelection(g) : ((svgedit.path.path.selected_pts.length <= 1 || !h.selected) && svgedit.path.path.clearSelection(), svgedit.path.path.addPtsToSelection(g))
                      } else if (0 == l.indexOf("ctrlpointgrip_")) {
                          svgedit.path.path.dragging = [r, o];
                          var m = l.split("_")[1].split("c");
                          g = Number(m[0]);
                          var c = Number(m[1]);
                          svgedit.path.path.selectPt(g, c)
                      }
                      svgedit.path.path.dragging || (null == rubberBox && (rubberBox = Y.getRubberBandBox()), svgedit.utilities.assignAttributes(rubberBox, {
                          x: r * p,
                          y: o * p,
                          width: 0,
                          height: 0,
                          display: "inline"
                      }, 100))
                  }
              } else {
                  mouse_x = r, mouse_y = o;
                  var v = mouse_x / p,
                      f = mouse_y / p,
                      y = svgedit.utilities.getElem("path_stretch_line");
                  s = [v, f], a.gridSnapping && (v = svgedit.utilities.snapToGrid(v), f = svgedit.utilities.snapToGrid(f), mouse_x = svgedit.utilities.snapToGrid(mouse_x), mouse_y = svgedit.utilities.snapToGrid(mouse_y)), y || (y = document.createElementNS(n.SVG, "path"), svgedit.utilities.assignAttributes(y, {
                      id: "path_stretch_line",
                      stroke: "#22C",
                      "stroke-width": "0.5",
                      fill: "none"
                  }), y = svgedit.utilities.getElem("selectorParentGroup").appendChild(y)), y.setAttribute("display", "inline");
                  var x, b = null;
                  if (u) {
                      for (var S = u.pathSegList, w = S.numberOfItems, N = 6 / p, A = !1; w;) {
                          w--;
                          var k = S.getItem(w),
                              E = k.x,
                              B = k.y;
                          if (v >= E - N && v <= E + N && f >= B - N && f <= B + N) {
                              A = !0;
                              break
                          }
                      }
                      l = ge(), svgedit.path.removePath_(l);
                      var T, G, I = svgedit.utilities.getElem(l),
                          M = S.numberOfItems;
                      if (A) {
                          if (w <= 1 && M >= 2 && "pipe" !== current_mode) {
                              var L = S.getItem(0).x,
                                  P = S.getItem(0).y;
                              G = y.pathSegList.getItem(1), T = 4 === G.pathSegType ? u.createSVGPathSegLinetoAbs(L, P) : u.createSVGPathSegCurvetoCubicAbs(L, P, G.x1 / p, G.y1 / p, L, P);
                              var O = u.createSVGPathSegClosePath();
                              S.appendItem(T), S.appendItem(O)
                          } else if (M < 3 && "pipe" !== current_mode) return b = !1, b;
                          if ($(y).remove(), element = I, u = null, started = !1, d) {
                              svgedit.path.path.matrix && svgedit.coords.remapElement(I, {}, svgedit.path.path.matrix.inverse());
                              var D = I.getAttribute("d"),
                                  R = $(svgedit.path.path.elem).attr("d");
                              return $(svgedit.path.path.elem).attr("d", R + D), $(I).remove(), svgedit.path.path.matrix && svgedit.path.recalcRotatedPath(), svgedit.path.path.init(), ce.toEditMode(svgedit.path.path.elem), svgedit.path.path.selectPt(), !1
                          }
                      } else {
                          if (!$.contains(e, Te(t))) return console.log("Clicked outside canvas"), !1;
                          var V = u.pathSegList.numberOfItems,
                              U = u.pathSegList.getItem(V - 1),
                              z = U.x,
                              F = U.y;
                          if (t.shiftKey) {
                              var j = svgedit.math.snapToAngle(z, F, v, f);
                              v = j.x, f = j.y
                          }
                          G = y.pathSegList.getItem(1), T = 4 === G.pathSegType ? u.createSVGPathSegLinetoAbs(de(v), de(f)) : u.createSVGPathSegCurvetoCubicAbs(de(v), de(f), G.x1 / p, G.y1 / p, G.x2 / p, G.y2 / p), u.pathSegList.appendItem(T), v *= p, f *= p, y.setAttribute("d", ["M", v, f, v, f].join(" ")), x = V, d && (x += svgedit.path.path.segs.length), svgedit.path.addPointGrip(x, v, f)
                      }
                  } else {
                      if (d_attr = "M" + v + "," + f + " ", path_attr = {
                              d: d_attr,
                              id: he(),
                              opacity: C.opacity / 2
                          }, "pipe" === current_mode) {
                          var H = he().replace("svg_", "PIE_");
                          path_attr = {
                              d: d_attr,
                              id: H,
                              type: "svg-ext-pipe",
                              fill: "rgba(0,0,0,0)",
                              stroke: "rgba(41,171,226,1)",
                              "stroke-width": 10,
                              opacity: C.opacity / 2
                          }
                      }
                      u = _({
                          element: "path",
                          curStyles: !0,
                          attr: path_attr
                      }), y.setAttribute("d", ["M", mouse_x, mouse_y, mouse_x, mouse_y].join(" ")), x = d ? svgedit.path.path.segs.length : 0, svgedit.path.addPointGrip(x, mouse_x, mouse_y)
                  }
              }
          },
          mouseMove: function(e, t) {
              if (g = !0, "path" !== current_mode && "pipe" !== current_mode)
                  if (svgedit.path.path.dragging) {
                      var i = svgedit.path.getPointFromGrip({
                              x: svgedit.path.path.dragging[0],
                              y: svgedit.path.path.dragging[1]
                          }, svgedit.path.path),
                          r = svgedit.path.getPointFromGrip({
                              x: e,
                              y: t
                          }, svgedit.path.path),
                          n = r.x - i.x,
                          a = r.y - i.y;
                      svgedit.path.path.dragging = [e, t], svgedit.path.path.dragctrl ? svgedit.path.path.moveCtrl(n, a) : svgedit.path.path.movePts(n, a)
                  } else svgedit.path.path.selected_pts = [], svgedit.path.path.eachSeg(function(e) {
                      var t = this;
                      if (t.next || t.prev) {
                          t.item;
                          var i = rubberBox.getBBox(),
                              r = svgedit.path.getGripPt(t),
                              n = {
                                  x: r.x,
                                  y: r.y,
                                  width: 0,
                                  height: 0
                              },
                              a = svgedit.math.rectsIntersect(i, n);
                          this.select(a), a && svgedit.path.path.selected_pts.push(t.index)
                      }
                  });
              else {
                  if (!u) return;
                  var o = u.pathSegList,
                      d = o.numberOfItems - 1;
                  if (s) {
                      var h = svgedit.path.addCtrlGrip("1c1"),
                          m = svgedit.path.addCtrlGrip("0c2");
                      h.setAttribute("cx", e), h.setAttribute("cy", t), h.setAttribute("display", "inline");
                      var c = s[0],
                          v = s[1],
                          f = (o.getItem(d), e / p),
                          y = t / p,
                          x = c + (c - f),
                          b = v + (v - y);
                      m.setAttribute("cx", x * p), m.setAttribute("cy", b * p), m.setAttribute("display", "inline");
                      var S = svgedit.path.getCtrlLine(1);
                      if (svgedit.utilities.assignAttributes(S, {
                              x1: e,
                              y1: t,
                              x2: x * p,
                              y2: b * p,
                              display: "inline"
                          }), 0 === d) l = [e, t];
                      else {
                          var C = o.getItem(d - 1),
                              w = C.x,
                              _ = C.y;
                          6 === C.pathSegType ? (w += w - C.x2, _ += _ - C.y2) : l && (w = l[0] / p, _ = l[1] / p), svgedit.path.replacePathSeg(6, d, [c, v, w, _, x, b], u)
                      }
                  } else {
                      var N = svgedit.utilities.getElem("path_stretch_line");
                      if (N) {
                          var A = o.getItem(d);
                          if (6 === A.pathSegType) {
                              var k = A.x + (A.x - A.x2),
                                  E = A.y + (A.y - A.y2);
                              svgedit.path.replacePathSeg(6, 1, [e, t, k * p, E * p, e, t], N)
                          } else l ? svgedit.path.replacePathSeg(6, 1, [e, t, l[0], l[1], e, t], N) : svgedit.path.replacePathSeg(4, 1, [e, t], N)
                      }
                  }
              }
          },
          mouseUp: function(e, t, i, r) {
              if ("path" === current_mode || "pipe" === current_mode) {
                  if (s = null, !u) {
                      var n = ge();
                      "pipe" === current_mode && (n = n.replace("svg_", "PIE_")), t = svgedit.utilities.getElem(n), started = !1, l = null
                  }
                  return {
                      keep: !0,
                      element: t
                  }
              }
              if (svgedit.path.path.dragging) {
                  var a = svgedit.path.path.cur_pt;
                  svgedit.path.path.dragging = !1, svgedit.path.path.dragctrl = !1, svgedit.path.path.update(), g && svgedit.path.path.endChanges("Move path point(s)"), e.shiftKey || g || svgedit.path.path.selectPt(a)
              } else rubberBox && "none" != rubberBox.getAttribute("display") ? (rubberBox.setAttribute("display", "none"), rubberBox.getAttribute("width") <= 2 && rubberBox.getAttribute("height") <= 2 && ce.toSelectMode(e.target)) : ce.toSelectMode(e.target);
              g = !1
          },
          toEditMode: function(e) {
              svgedit.path.path = svgedit.path.getPath_(e), current_mode = "pathedit", ke(), svgedit.path.path.show(!0).update(), svgedit.path.path.oldbbox = svgedit.utilities.getBBox(svgedit.path.path.elem), d = !1
          },
          toSelectMode: function(e) {
              var t = e == svgedit.path.path.elem;
              current_mode = "select", svgedit.path.path.show(!1), i = !1, ke(), svgedit.path.path.matrix && svgedit.path.recalcRotatedPath(), t && (V("selected", [e]), Ee([e], !0))
          },
          addSubPath: function(e) {
              e ? (current_mode = "path", d = !0) : (ce.clear(!0), ce.toEditMode(svgedit.path.path.elem))
          },
          select: function(e) {
              i === e ? (ce.toEditMode(e), current_mode = "pathedit") : i = e
          },
          reorient: function() {
              var e = w[0];
              if (e) {
                  var t = svgedit.utilities.getRotationAngle(e);
                  if (0 != t) {
                      var i = new svgedit.history.BatchCommand("Reorient path"),
                          r = {
                              d: e.getAttribute("d"),
                              transform: e.getAttribute("transform")
                          };
                      i.addSubCommand(new svgedit.history.ChangeElementCommand(e, r)), ke(), this.resetOrientation(e), X(i), svgedit.path.getPath_(e).show(!1).matrix = null, this.clear(), Ee([e], !0), V("changed", w)
                  }
              }
          },
          clear: function(e) {
              if (i = null, u) {
                  var t = svgedit.utilities.getElem(ge());
                  $(svgedit.utilities.getElem("path_stretch_line")).remove(), $(t).remove(), $(svgedit.utilities.getElem("pathpointgrip_container")).find("*").attr("display", "none"), u = l = null, started = !1
              } else "pathedit" == current_mode && this.toSelectMode();
              svgedit.path.path && svgedit.path.path.init().show(!1)
          },
          resetOrientation: function(e) {
              if (null == e || "path" != e.nodeName) return !1;
              var t = svgedit.transformlist.getTransformList(e),
                  i = svgedit.math.transformListToTransform(t).matrix;
              t.clear(), e.removeAttribute("transform");
              var n, a = e.pathSegList,
                  s = a.numberOfItems;
              for (n = 0; n < s; ++n) {
                  var o = a.getItem(n),
                      l = o.pathSegType;
                  if (1 != l) {
                      var d = [];
                      $.each(["", 1, 2], function(e, t) {
                          var r = o["x" + t],
                              n = o["y" + t];
                          if (void 0 !== r && void 0 !== n) {
                              var a = svgedit.math.transformPoint(r, n, i);
                              d.splice(d.length, 0, a.x, a.y)
                          }
                      }), svgedit.path.replacePathSeg(l, n, d, e)
                  }
              }
              r(e, i)
          },
          zoomChange: function() {
              "pathedit" == current_mode && svgedit.path.path.update()
          },
          getNodePoint: function() {
              var e = svgedit.path.path.selected_pts.length ? svgedit.path.path.selected_pts[0] : 1,
                  t = svgedit.path.path.segs[e];
              return {
                  x: t.item.x,
                  y: t.item.y,
                  type: t.type
              }
          },
          linkControlPoints: function(e) {
              svgedit.path.setLinkControlPoints(e)
          },
          clonePathNode: function() {
              svgedit.path.path.storeD();
              for (var e = svgedit.path.path.selected_pts, t = (svgedit.path.path.segs, e.length), i = []; t--;) {
                  var r = e[t];
                  svgedit.path.path.addSeg(r), i.push(r + t), i.push(r + t + 1)
              }
              svgedit.path.path.init().addPtsToSelection(i), svgedit.path.path.endChanges("Clone path node(s)")
          },
          opencloseSubPath: function() {
              var e = svgedit.path.path.selected_pts;
              if (1 === e.length) {
                  var t = svgedit.path.path.elem,
                      i = t.pathSegList,
                      r = (i.numberOfItems, e[0]),
                      n = null,
                      a = null;
                  if (svgedit.path.path.eachSeg(function(e) {
                          return 2 === this.type && e <= r && (a = this.item), e <= r || (2 === this.type ? (n = e, !1) : 1 === this.type ? (n = !1, !1) : void 0)
                      }), null == n && (n = svgedit.path.path.segs.length - 1), !1 !== n) {
                      var s = t.createSVGPathSegLinetoAbs(a.x, a.y),
                          o = t.createSVGPathSegClosePath();
                      return n == svgedit.path.path.segs.length - 1 ? (i.appendItem(s), i.appendItem(o)) : (svgedit.path.insertItemBefore(t, o, n), svgedit.path.insertItemBefore(t, s, n)), void svgedit.path.path.init().selectPt(n + 1)
                  }
                  var l, d, u, g = svgedit.path.path.segs[r];
                  if (g.mate) return i.removeItem(r), i.removeItem(r), void svgedit.path.path.init().selectPt(r - 1);
                  for (l = 0; l < i.numberOfItems; l++) {
                      var h = i.getItem(l);
                      if (2 === h.pathSegType) d = l;
                      else if (l === r) i.removeItem(d);
                      else if (1 === h.pathSegType && r < l) {
                          u = l - 1, i.removeItem(l);
                          break
                      }
                  }
                  for (var m = r - d - 1; m--;) svgedit.path.insertItemBefore(t, i.getItem(d), u);
                  var c = i.getItem(d);
                  svgedit.path.replacePathSeg(2, d, [c.x, c.y]), l = r, svgedit.path.path.init().selectPt(0)
              }
          },
          deletePathNode: function() {
              if (ce.canDeleteNodes) {
                  svgedit.path.path.storeD();
                  for (var e = svgedit.path.path.selected_pts, t = e.length; t--;) {
                      var i = e[t];
                      svgedit.path.path.deleteSeg(i)
                  }
                  var r = function() {
                      var e = svgedit.path.path.elem.pathSegList,
                          t = e.numberOfItems,
                          i = function(t, i) {
                              for (; i--;) e.removeItem(t)
                          };
                      if (t <= 1) return !0;
                      for (; t--;) {
                          var n = e.getItem(t);
                          if (1 === n.pathSegType) {
                              var a = e.getItem(t - 1),
                                  s = e.getItem(t - 2);
                              if (2 === a.pathSegType) {
                                  i(t - 1, 2), r();
                                  break
                              }
                              if (2 === s.pathSegType) {
                                  i(t - 2, 3), r();
                                  break
                              }
                          } else if (2 === n.pathSegType && t > 0) {
                              var o = e.getItem(t - 1).pathSegType;
                              if (2 === o) {
                                  i(t - 1, 1), r();
                                  break
                              }
                              if (1 === o && e.numberOfItems - 1 === t) {
                                  i(t, 1), r();
                                  break
                              }
                          }
                      }
                      return !1
                  };
                  if (r(), svgedit.path.path.elem.pathSegList.numberOfItems <= 1) return ce.toSelectMode(svgedit.path.path.elem), void o.deleteSelectedElements();
                  if (svgedit.path.path.init(), svgedit.path.path.clearSelection(), window.opera) {
                      var n = $(svgedit.path.path.elem);
                      n.attr("d", n.attr("d"))
                  }
                  svgedit.path.path.endChanges("Delete path node(s)")
              }
          },
          smoothPolylineIntoPath: h,
          setSegType: function(e) {
              svgedit.path.path.setSegType(e)
          },
          moveNode: function(e, t) {
              var i = svgedit.path.path.selected_pts;
              if (i.length) {
                  svgedit.path.path.storeD();
                  var r = svgedit.path.path.segs[i[0]],
                      n = {
                          x: 0,
                          y: 0
                      };
                  n[e] = t - r.item[e], r.move(n.x, n.y), svgedit.path.path.endChanges("Move path point")
              }
          },
          fixEnd: function(e) {
              var i, r, n = e.pathSegList,
                  a = n.numberOfItems;
              for (i = 0; i < a; ++i) {
                  var s = n.getItem(i);
                  if (2 === s.pathSegType && (r = s), 1 === s.pathSegType) {
                      var o = n.getItem(i - 1);
                      if (o.x != r.x || o.y != r.y) {
                          var l = e.createSVGPathSegLinetoAbs(r.x, r.y);
                          svgedit.path.insertItemBefore(e, l, i), ce.fixEnd(e);
                          break
                      }
                  }
              }
              svgedit.browser.isWebkit() && t(e)
          },
          convertPath: function(e, t) {
              var i, r = e.pathSegList,
                  n = 0;
              r ? n = r.numberOfItems : console.error(`Problem with path conversion. segList is empty!' ${e}`);
              var a = 0,
                  s = 0,
                  o = "",
                  l = null;
              for (i = 0; i < n; ++i) {
                  var d = r.getItem(i),
                      u = d.x || 0,
                      g = d.y || 0,
                      h = d.x1 || 0,
                      m = d.y1 || 0,
                      c = d.x2 || 0,
                      v = d.y2 || 0,
                      f = d.pathSegType,
                      p = _e[f]["to" + (t ? "Lower" : "Upper") + "Case"](),
                      y = function(e, t, i) {
                          t = t ? " " + t.join(" ") : "", i = i ? " " + svgedit.units.shortFloat(i) : "", $.each(e, function(t, i) {
                              e[t] = svgedit.units.shortFloat(i)
                          }), o += p + e.join(" ") + t + i
                      };
                  switch (f) {
                      case 1:
                          o += "z";
                          break;
                      case 12:
                          u -= a;
                      case 13:
                          t ? (a += u, p = "l") : (u += a, a = u, p = "L"), y([
                              [u, s]
                          ]);
                          break;
                      case 14:
                          g -= s;
                      case 15:
                          t ? (s += g, p = "l") : (g += s, s = g, p = "L"), y([
                              [a, g]
                          ]);
                          break;
                      case 2:
                      case 4:
                      case 18:
                          u -= a, g -= s;
                      case 5:
                      case 3:
                          l && 1 === r.getItem(i - 1).pathSegType && !t && (a = l[0], s = l[1]);
                      case 19:
                          t ? (a += u, s += g) : (u += a, g += s, a = u, s = g), 3 === f && (l = [a, s]), y([
                              [u, g]
                          ]);
                          break;
                      case 6:
                          u -= a, h -= a, c -= a, g -= s, m -= s, v -= s;
                      case 7:
                          t ? (a += u, s += g) : (u += a, h += a, c += a, g += s, m += s, v += s, a = u, s = g), y([
                              [h, m],
                              [c, v],
                              [u, g]
                          ]);
                          break;
                      case 8:
                          u -= a, h -= a, g -= s, m -= s;
                      case 9:
                          t ? (a += u, s += g) : (u += a, h += a, g += s, m += s, a = u, s = g), y([
                              [h, m],
                              [u, g]
                          ]);
                          break;
                      case 10:
                          u -= a, g -= s;
                      case 11:
                          t ? (a += u, s += g) : (u += a, g += s, a = u, s = g), y([
                              [d.r1, d.r2]
                          ], [d.angle, d.largeArcFlag ? 1 : 0, d.sweepFlag ? 1 : 0], [u, g]);
                          break;
                      case 16:
                          u -= a, c -= a, g -= s, v -= s;
                      case 17:
                          t ? (a += u, s += g) : (u += a, c += a, g += s, v += s, a = u, s = g), y([
                              [c, v],
                              [u, g]
                          ])
                  }
              }
              return o
          }
      }
  }();
  var Ie = this.removeUnusedDefElems = function() {
      var e = m.getElementsByTagNameNS(n.SVG, "defs");
      if (!e || !e.length) return 0;
      var t, i, r = [],
          a = 0,
          s = ["fill", "stroke", "filter", "marker-start", "marker-mid", "marker-end"],
          o = s.length,
          l = m.getElementsByTagNameNS(n.SVG, "*"),
          d = l.length;
      for (t = 0; t < d; t++) {
          var u = l[t];
          for (i = 0; i < o; i++) {
              var g = svgedit.utilities.getUrlFromAttr(u.getAttribute(s[i]));
              g && r.push(g.substr(1))
          }
          var h = I(u);
          h && 0 === h.indexOf("#") && r.push(h.substr(1))
      }
      var c = $(e).find("linearGradient, radialGradient, filter, marker, svg, symbol");
      for (t = c.length; t--;) {
          var v = c[t],
              f = v.id;
          r.indexOf(f) < 0 && (removedElements[f] = v, v.parentNode.removeChild(v), a++)
      }
      return a
  };
  this.svgCanvasToString = function() {
      for (; Ie() > 0;);
      ce.clear(!0), $.each(m.childNodes, function(e, t) {
          e && 8 === t.nodeType && t.data.indexOf("Created with") >= 0 && m.insertBefore(t, m.firstChild)
      }), b && (De(), Be([b]));
      var e = [];
      $(m).find("g:data(gsvg)").each(function() {
          var t, i = this.attributes,
              r = i.length;
          for (t = 0; t < r; t++) "id" != i[t].nodeName && "style" != i[t].nodeName || r--;
          if (r <= 0) {
              var n = this.firstChild;
              e.push(n), $(this).replaceWith(n)
          }
      });
      var t = this.svgToString(m, 0);
      return e.length && $(e).each(function() {
          xe(this)
      }), t
  }, this.svgToString = function(e, t) {
      var i = [],
          r = svgedit.utilities.toXml,
          s = a.baseUnit,
          o = new RegExp("^-?[\\d\\.]+" + s + "$"),
          l = ["ngx-dygraphs"];
      if (e) {
          if (l.indexOf(e.nodeName.toLowerCase()) >= 0) return i.join("");
          D(e);
          var d, u, g = e.attributes,
              h = e.childNodes;
          for (u = 0; u < t; u++) i.push(" ");
          if (i.push("<"), i.push(e.nodeName), "svgcontent" === e.id) {
              var m = Ve(),
                  c = "";
              "px" !== s && (m.w = svgedit.units.convertUnit(m.w, s) + s, m.h = svgedit.units.convertUnit(m.h, s) + s), i.push(' width="' + m.w + '" height="' + m.h + '"' + c + ' xmlns="' + n.SVG + '"');
              var v = {};
              $(e).find("*").andSelf().each(function() {
                  var e = this.namespaceURI;
                  e && !v[e] && z[e] && "xmlns" !== z[e] && "xml" !== z[e] && (v[e] = !0, i.push(" xmlns:" + z[e] + '="' + e + '"')), $.each(this.attributes, function(e, t) {
                      var r = t.namespaceURI;
                      r && !v[r] && "xmlns" !== z[r] && "xml" !== z[r] && (v[r] = !0, i.push(" xmlns:" + z[r] + '="' + r + '"'))
                  })
              }), u = g.length;
              for (var f = ["width", "height", "xmlns", "x", "y", "viewBox", "id", "overflow"]; u--;) {
                  d = g.item(u);
                  var p = r(d.value);
                  0 !== d.nodeName.indexOf("xmlns:") && ("" != p && -1 == f.indexOf(d.localName) && (d.namespaceURI && !z[d.namespaceURI] || (i.push(" "), i.push(d.nodeName), i.push('="'), i.push(p), i.push('"'))))
              }
          } else {
              if ("defs" === e.nodeName && !e.firstChild) return;
              var y = ["-moz-math-font-style", "_moz-math-font-style"];
              for (u = g.length - 1; u >= 0; u--) {
                  d = g.item(u);
                  p = r(d.value);
                  if (!(y.indexOf(d.localName) >= 0) && "" != p) {
                      if (0 === p.indexOf("pointer-events")) continue;
                      if ("class" === d.localName && 0 === p.indexOf("se_")) continue;
                      if (i.push(" "), "d" === d.localName && (p = ce.convertPath(e, !1)), isNaN(p) ? o.test(p) && (p = svgedit.units.shortFloat(p) + s) : p = svgedit.units.shortFloat(p), save_options.apply && "image" === e.nodeName && "href" === d.localName && save_options.images && "embed" === save_options.images) {
                          var x = re[p];
                          x && (p = x)
                      }
                      d.namespaceURI && d.namespaceURI != n.SVG && !z[d.namespaceURI] || (i.push(d.nodeName), i.push('="'), i.push(p), i.push('"'))
                  }
              }
          }
          if (e.hasChildNodes()) {
              i.push(">"), t++;
              var b = !1;
              for (u = 0; u < h.length; u++) {
                  var S = h.item(u);
                  switch (S.nodeType) {
                      case 1:
                          i.push("\n"), i.push(this.svgToString(h.item(u), t));
                          break;
                      case 3:
                          var C = S.nodeValue.replace(/^\s+|\s+$/g, "");
                          "" != C && (b = !0, i.push(String(r(C))));
                          break;
                      case 4:
                          i.push("\n"), i.push(new Array(t + 1).join(" ")), i.push("<![CDATA["), i.push(S.nodeValue), i.push("]]>");
                          break;
                      case 8:
                          i.push("\n"), i.push(new Array(t + 1).join(" ")), i.push("<!--"), i.push(S.data), i.push("-->")
                  }
              }
              if (t--, !b)
                  for (i.push("\n"), u = 0; u < t; u++) i.push(" ");
              i.push("</"), i.push(e.nodeName), i.push(">")
          } else "div" === e.nodeName.toLowerCase() || "span" === e.nodeName.toLowerCase() ? (i.push(">"), i.push("</"), i.push(e.nodeName), i.push(">")) : i.push("/>")
      }
      return i.join("")
  }, this.embedImage = function(e, t) {
      $(new Image).load(function() {
          var i = document.createElement("canvas");
          i.width = this.width, i.height = this.height, i.getContext("2d").drawImage(this, 0, 0);
          try {
              var r = ";svgedit_url=" + encodeURIComponent(e);
              r = i.toDataURL().replace(";base64", r + ";base64"), re[e] = r
          } catch (t) {
              re[e] = !1
          }
          ne = e, t && t(re[e])
      }).attr("src", e)
  }, this.setGoodImage = function(e) {
      ne = e
  }, this.setGoodSvgImageContent = function(e) {
      last_good_img_content = e
  }, this.open = function() {}, this.save = function(e) {
      ke(), e && $.extend(save_options, e), save_options.apply = !0;
      var t = this.svgCanvasToString();
      V("saved", t)
  }, this.rasterExport = function(e, t, r) {
      var n = "image/" + e.toLowerCase(),
          a = i(),
          s = this.svgCanvasToString();
      svgedit.utilities.buildCanvgCallback(function() {
          var i = e || "PNG";
          $("#export_canvas").length || $("<canvas>", {
              id: "export_canvas"
          }).hide().appendTo("body");
          var o = $("#export_canvas")[0];
          o.width = svgCanvas.contentW, o.height = svgCanvas.contentH, canvg(o, s, {
              renderCallback: function() {
                  var l = ("ICO" === i ? "BMP" : i).toLowerCase(),
                      d = t ? o.toDataURL("image/" + l, t) : o.toDataURL("image/" + l);
                  V("exported", {
                      datauri: d,
                      svg: s,
                      issues: a,
                      type: e,
                      mimeType: n,
                      quality: t,
                      exportWindowName: r
                  })
              }
          })
      })()
  }, this.exportPDF = function(e, t) {
      var r = this;
      svgedit.utilities.buildJSPDFCallback(function() {
          var n = Ve(),
              a = n.w > n.h ? "landscape" : "portrait",
              s = "pt",
              o = jsPDF({
                  orientation: a,
                  unit: s,
                  format: [n.w, n.h]
              }),
              l = Ue();
          o.setProperties({
              title: l
          });
          var d = i(),
              u = r.svgCanvasToString();
          o.addSVG(u, 0, 0);
          var g = {
                  svg: u,
                  issues: d,
                  exportWindowName: e
              },
              h = t || "dataurlstring";
          g[h] = o.output(h), V("exportedPDF", g)
      })()
  }, this.lockSelection = function(e) {
      d = e
  }, this.getSvgString = function() {
      return save_options.apply = !1, this.svgCanvasToString()
  }, this.randomizeIds = function(e) {
      arguments.length > 0 && 0 == e ? svgedit.draw.randomizeIds(!1, f()) : svgedit.draw.randomizeIds(!0, f())
  };
  var Me = this.uniquifyElems = function(e) {
          var t, i = {},
              r = ["filter", "linearGradient", "pattern", "radialGradient", "symbol", "textPath", "use"];
          for (t in svgedit.utilities.walkTree(e, function(e) {
                  if (1 == e.nodeType) {
                      e.id && (e.id in i || (i[e.id] = {
                          elem: null,
                          attrs: [],
                          hrefs: []
                      }), i[e.id].elem = e), $.each(Q, function(t, r) {
                          var n = e.getAttributeNode(r);
                          if (n) {
                              var a = svgedit.utilities.getUrlFromAttr(n.value),
                                  s = a ? a.substr(1) : null;
                              s && (s in i || (i[s] = {
                                  elem: null,
                                  attrs: [],
                                  hrefs: []
                              }), i[s].attrs.push(n))
                          }
                      });
                      var t = svgedit.utilities.getHref(e);
                      if (t && r.indexOf(e.nodeName) >= 0) {
                          var n = t.substr(1);
                          n && (n in i || (i[n] = {
                              elem: null,
                              attrs: [],
                              hrefs: []
                          }), i[n].hrefs.push(e))
                      }
                  }
              }), i)
              if (t) {
                  var n = i[t].elem;
                  if (n) {
                      var a = he();
                      n.id = a;
                      for (var s = i[t].attrs, o = s.length; o--;) {
                          var l = s[o];
                          l.ownerElement.setAttribute(l.name, "url(#" + a + ")")
                      }
                      for (var d = i[t].hrefs, u = d.length; u--;) {
                          var g = d[u];
                          svgedit.utilities.setHref(g, "#" + a)
                      }
                  }
              }
      },
      Le = this.setUseData = function(e) {
          var t = $(e);
          "use" !== e.tagName && (t = t.find("use")), t.each(function() {
              var e = I(this).substr(1),
                  t = svgedit.utilities.getElem(e);
              t && ($(this).data("ref", t), "symbol" != t.tagName && "svg" != t.tagName || $(this).data("symbol", t).data("ref", t))
          })
      },
      $e = this.convertGradients = function(e) {
          var t = $(e).find("linearGradient, radialGradient");
          !t.length && svgedit.browser.isWebkit() && (t = $(e).find("*").filter(function() {
              return this.tagName.indexOf("Gradient") >= 0
          })), t.each(function() {
              var e = this;
              if ("userSpaceOnUse" === $(e).attr("gradientUnits")) {
                  var t = $(m).find('[fill="url(#' + e.id + ')"],[stroke="url(#' + e.id + ')"]');
                  if (!t.length) return;
                  var i = svgedit.utilities.getBBox(t[0]);
                  if (!i) return;
                  if ("linearGradient" === e.tagName) {
                      var r = $(e).attr(["x1", "y1", "x2", "y2"]),
                          n = e.gradientTransform.baseVal;
                      if (n && n.numberOfItems > 0) {
                          var a = svgedit.math.transformListToTransform(n).matrix,
                              s = svgedit.math.transformPoint(r.x1, r.y1, a),
                              o = svgedit.math.transformPoint(r.x2, r.y2, a);
                          r.x1 = s.x, r.y1 = s.y, r.x2 = o.x, r.y2 = o.y, e.removeAttribute("gradientTransform")
                      }
                      $(e).attr({
                          x1: (r.x1 - i.x) / i.width,
                          y1: (r.y1 - i.y) / i.height,
                          x2: (r.x2 - i.x) / i.width,
                          y2: (r.y2 - i.y) / i.height
                      }), e.removeAttribute("gradientUnits")
                  }
              }
          })
      },
      Pe = this.convertToGroup = function(e) {
          e || (e = w[0]);
          var t, i = $(e),
              r = new svgedit.history.BatchCommand;
          if (i.data("gsvg")) {
              var a = e.firstChild,
                  s = $(a).attr(["x", "y"]);
              $(e.firstChild.firstChild).unwrap(), $(e).removeData("gsvg");
              var o = svgedit.transformlist.getTransformList(e),
                  l = h.createSVGTransform();
              l.setTranslate(s.x, s.y), o.appendItem(l), svgedit.recalculate.recalculateDimensions(e), V("selected", [e])
          } else if (i.data("symbol")) {
              e = i.data("symbol"), t = i.attr("transform");
              var d = i.attr(["x", "y"]),
                  u = e.getAttribute("viewBox");
              if (u) {
                  var c = u.split(" ");
                  d.x -= +c[0], d.y -= +c[1]
              }
              t += " translate(" + (d.x || 0) + "," + (d.y || 0) + ")";
              var v = i.prev();
              r.addSubCommand(new svgedit.history.RemoveElementCommand(i[0], i[0].nextSibling, i[0].parentNode)), i.remove();
              var f, p = $(m).find("use:data(symbol)").length,
                  y = g.createElementNS(n.SVG, "g"),
                  x = e.childNodes;
              for (f = 0; f < x.length; f++) y.appendChild(x[f].cloneNode(!0));
              if (svgedit.browser.isGecko()) {
                  var b = $(svgedit.utilities.findDefs()).children("linearGradient,radialGradient,pattern").clone();
                  $(y).append(b)
              }
              t && y.setAttribute("transform", t);
              var S = e.parentNode;
              if (Me(y), svgedit.browser.isGecko() && $(T()).append($(y).find("linearGradient,radialGradient,pattern")), y.id = he(), v.after(y), S) {
                  if (!p) {
                      var C = e.nextSibling;
                      S.removeChild(e), r.addSubCommand(new svgedit.history.RemoveElementCommand(e, C, S))
                  }
                  r.addSubCommand(new svgedit.history.InsertElementCommand(y))
              }
              Le(y), svgedit.browser.isGecko() ? $e(svgedit.utilities.findDefs()) : $e(y), svgedit.utilities.walkTreePost(y, function(e) {
                  try {
                      svgedit.recalculate.recalculateDimensions(e)
                  } catch (e) {
                      console.log(e)
                  }
              }), $(y).find(J).each(function() {
                  this.id || (this.id = he())
              }), Be([y]);
              var _ = We(y, !0);
              _ && r.addSubCommand(_), X(r)
          } else console.log("Unexpected element to ungroup:", e)
      };
  this.setSvgString = function(e) {
      try {
          var t = svgedit.utilities.text2xml(e);
          this.prepareSvg(t);
          var i = new svgedit.history.BatchCommand("Change Source"),
              r = m.nextSibling,
              s = h.removeChild(m);
          i.addSubCommand(new svgedit.history.RemoveElementCommand(s, r, h)), m = g.adoptNode ? g.adoptNode(t.documentElement) : g.importNode(t.documentElement, !0), h.appendChild(m);
          var l = $(m);
          o.current_drawing_ = new svgedit.draw.Drawing(m, v);
          var d = f().getNonce();
          d ? V("setnonce", d) : V("unsetnonce"), l.find("image").each(function() {
              var e = this;
              Ge(e);
              var t = I(this);
              if (t) {
                  if (0 === t.indexOf("data:")) {
                      var i = t.match(/svgedit_url=(.*?);/);
                      if (i) {
                          var r = decodeURIComponent(i[1]);
                          $(new Image).load(function() {
                              e.setAttributeNS(n.XLINK, "xlink:href", r)
                          }).attr("src", r)
                      }
                  }
                  o.embedImage(t)
              }
          }), l.find("svg").each(function() {
              if (!$(this).closest("defs").length) {
                  Me(this);
                  var e = this.parentNode;
                  1 === e.childNodes.length && "g" === e.nodeName ? ($(e).data("gsvg", this), e.id = e.id || he()) : xe(this)
              }
          }), svgedit.browser.isGecko() && l.find("linearGradient, radialGradient, pattern").appendTo(svgedit.utilities.findDefs()), Le(l), $e(l[0]), svgedit.utilities.walkTreePost(m, function(e) {
              try {
                  svgedit.recalculate.recalculateDimensions(e)
              } catch (e) {
                  console.log(e)
              }
          });
          var u = {
                  id: "svgcontent",
                  overflow: a.show_outside_canvas ? "visible" : "hidden"
              },
              c = !1;
          if (l.attr("viewBox")) {
              var y = l.attr("viewBox").split(" ");
              u.width = y[2], u.height = y[3]
          } else $.each(["width", "height"], function(e, t) {
              var i = l.attr(t);
              i || (i = "100%"), "%" === String(i).substr(-1) ? c = !0 : u[t] = svgedit.units.convertToNum(t, i)
          });
          if (Oe(), l.children().find(J).each(function() {
                  this.id || (this.id = he())
              }), c) {
              var x = getStrokedBBox();
              u.width = x.width + x.x, u.height = x.height + x.y
          }
          u.width <= 0 && (u.width = 100), u.height <= 0 && (u.height = 100), l.attr(u), this.contentW = u.width, this.contentH = u.height, i.addSubCommand(new svgedit.history.InsertElementCommand(m));
          var b = l.attr(["width", "height"]);
          i.addSubCommand(new svgedit.history.ChangeElementCommand(h, b)), p = 1, svgedit.transformlist.resetListMap(), ke(), svgedit.path.clearData(), h.appendChild(Y.selectorParentGroup), X(i), V("changed", [m])
      } catch (e) {
          return console.log(e), !1
      }
      return !0
  }, this.importSvgString = function(e, t) {
      var i, r;
      try {
          var a = (new Date).getTime(),
              s = !1;
          import_ids[a] && $(import_ids[a].symbol).parents("#svgroot").length && (s = !0);
          var o, l = new svgedit.history.BatchCommand("Import Image");
          if (s) o = import_ids[a].symbol, r = import_ids[a].xform, t && t.x > 0 && t.y > 0 && (r = " translate(" + t.x + "," + t.y + ") scale(1) translate(0)");
          else {
              var d, u = svgedit.utilities.text2xml(e);
              this.prepareSvg(u), d = g.adoptNode ? g.adoptNode(u.documentElement) : g.importNode(u.documentElement, !0), Me(d);
              var h = svgedit.units.convertToNum("width", d.getAttribute("width")),
                  c = svgedit.units.convertToNum("height", d.getAttribute("height")),
                  v = d.getAttribute("viewBox"),
                  p = v ? v.split(" ") : [0, 0, h, c];
              for (i = 0; i < 4; ++i) p[i] = Number(p[i]);
              var y = Number(m.getAttribute("height"));
              r = c > h ? "scale(" + y / 3 / p[3] + ")" : "scale(" + y / 3 / p[2] + ")", r = t && t.x > 0 && t.y > 0 ? "translate(" + t.x + "," + t.y + ") scale(1) translate(0)" : "translate(0) scale(1) translate(0)", o = g.createElementNS(n.SVG, "symbol");
              var x = svgedit.utilities.findDefs();
              if ($(d).find("linearGradient, radialGradient, pattern").appendTo(x), !x.firstChild) {
                  var S = g.createElementNS(n.SVG, "symbol");
                  S.id = he(), x.appendChild(S)
              }
              for (; d.firstChild;) {
                  var C = d.firstChild;
                  svgedit.utilities.walkTree(C, function(e) {
                      e.id = he()
                  }), o.appendChild(C)
              }
              o.id = he(), o.setAttribute("type", "svg-ext-shapes-image"), o.childNodes.forEach(e => {
                  e.getAttribute("transform") && e.setAttribute("transform", "matrix(1, 0, 0, 1, 0, 0)")
              }), import_ids[a] = {
                  symbol: o,
                  xform: r
              }, svgedit.utilities.findDefs().appendChild(o), l.addSubCommand(new svgedit.history.InsertElementCommand(o))
          }
          var w = g.createElementNS(n.SVG, "use");
          w.id = he(), w.setAttribute("type", "svg-ext-shapes-image"), M(w, "#" + o.id), (b || f().getCurrentLayer()).appendChild(w), l.addSubCommand(new svgedit.history.InsertElementCommand(w)), ke(), w.setAttribute("transform", r), svgedit.recalculate.recalculateDimensions(w), $(w).data("symbol", o).data("ref", o), Ee([w]), setTimeout(function() {
              Be([w], !0)
          }, 500), X(l), V("changed", [m])
      } catch (e) {
          return console.log(e), !1
      }
      return !0
  };
  var Oe = o.identifyLayers = function() {
      De(), f().identifyLayers()
  };
  this.createLayer = function(e) {
      var t = new svgedit.history.BatchCommand("Create Layer"),
          i = f().createLayer(e);
      t.addSubCommand(new svgedit.history.InsertElementCommand(i)), X(t), ke(), V("changed", [i])
  }, this.cloneLayer = function(e) {
      var t = new svgedit.history.BatchCommand("Duplicate Layer"),
          i = g.createElementNS(n.SVG, "g"),
          r = g.createElementNS(n.SVG, "title");
      r.textContent = e, i.appendChild(r);
      var a = f().getCurrentLayer();
      $(a).after(i);
      var s, l = a.childNodes;
      for (s = 0; s < l.length; s++) {
          var d = l[s];
          "title" != d.localName && i.appendChild(be(d))
      }
      ke(), Oe(), t.addSubCommand(new svgedit.history.InsertElementCommand(i)), X(t), o.setCurrentLayer(e), V("changed", [i])
  }, this.deleteCurrentLayer = function() {
      var e = f().getCurrentLayer(),
          t = e.nextSibling,
          i = e.parentNode;
      if (e = f().deleteCurrentLayer(), e) {
          var r = new svgedit.history.BatchCommand("Delete Layer");
          return r.addSubCommand(new svgedit.history.RemoveElementCommand(e, t, i)), X(r), ke(), V("changed", [i]), !0
      }
      return !1
  }, this.setCurrentLayer = function(e) {
      var t = f().setCurrentLayer(svgedit.utilities.toXml(e));
      return t && ke(), t
  }, this.renameCurrentLayer = function(e) {
      var t, i = f();
      if (i.current_layer) {
          var r = i.current_layer;
          if (!o.setCurrentLayer(e)) {
              var n = new svgedit.history.BatchCommand("Rename Layer");
              for (t = 0; t < i.getNumLayers() && i.all_layers[t][1] != r; ++t);
              var a = i.getLayerName(t);
              i.all_layers[t][0] = svgedit.utilities.toXml(e);
              var s = r.childNodes.length;
              for (t = 0; t < s; ++t) {
                  var l = r.childNodes.item(t);
                  if (l && "title" == l.tagName) {
                      for (; l.firstChild;) l.removeChild(l.firstChild);
                      return l.textContent = e, n.addSubCommand(new svgedit.history.ChangeElementCommand(l, {
                          "#text": a
                      })), X(n), V("changed", [r]), !0
                  }
              }
          }
          i.current_layer = r
      }
      return !1
  }, this.setCurrentLayerPosition = function(e) {
      var t, i = f();
      if (i.current_layer && e >= 0 && e < i.getNumLayers()) {
          for (t = 0; t < i.getNumLayers() && i.all_layers[t][1] != i.current_layer; ++t);
          if (t == i.getNumLayers()) return !1;
          if (t != e) {
              var r = null,
                  n = i.current_layer.nextSibling;
              return e > t ? e < i.getNumLayers() - 1 && (r = i.all_layers[e + 1][1]) : r = i.all_layers[e][1], m.insertBefore(i.current_layer, r), X(new svgedit.history.MoveElementCommand(i.current_layer, n, m)), Oe(), o.setCurrentLayer(i.getLayerName(e)), !0
          }
      }
      return !1
  }, this.setLayerVisibility = function(e, t) {
      var i = f(),
          r = i.getLayerVisibility(e),
          n = i.setLayerVisibility(e, t);
      if (!n) return !1;
      var a = r ? "inline" : "none";
      return X(new svgedit.history.ChangeElementCommand(n, {
          display: a
      }, "Layer Visibility")), n == i.getCurrentLayer() && (ke(), ce.clear()), !0
  }, this.moveSelectedToLayer = function(e) {
      var t, i = null,
          r = f();
      for (t = 0; t < r.getNumLayers(); ++t)
          if (r.getLayerName(t) == e) {
              i = r.all_layers[t][1];
              break
          } if (!i) return !1;
      var n = new svgedit.history.BatchCommand("Move Elements to Layer"),
          a = w;
      for (t = a.length; t--;) {
          var s = a[t];
          if (s) {
              var o = s.nextSibling,
                  l = s.parentNode;
              i.appendChild(s), n.addSubCommand(new svgedit.history.MoveElementCommand(s, o, l))
          }
      }
      return X(n), !0
  }, this.mergeLayer = function(e) {
      var t = new svgedit.history.BatchCommand("Merge Layer"),
          i = f(),
          r = $(i.current_layer).prev()[0];
      if (r) {
          var n = i.current_layer.childNodes,
              a = (n.length, i.current_layer.nextSibling);
          for (t.addSubCommand(new svgedit.history.RemoveElementCommand(i.current_layer, a, m)); i.current_layer.firstChild;) {
              var s = i.current_layer.firstChild;
              if ("title" != s.localName) {
                  var o = s.nextSibling;
                  r.appendChild(s), t.addSubCommand(new svgedit.history.MoveElementCommand(s, o, i.current_layer))
              } else {
                  var l = s.nextSibling;
                  t.addSubCommand(new svgedit.history.RemoveElementCommand(s, l, i.current_layer)), i.current_layer.removeChild(s)
              }
          }
          return m.removeChild(i.current_layer), e || (ke(), Oe(), V("changed", [m]), X(t)), i.current_layer = r, t
      }
  }, this.mergeAllLayers = function() {
      var e = new svgedit.history.BatchCommand("Merge all Layers"),
          t = f();
      for (t.current_layer = t.all_layers[t.getNumLayers() - 1][1]; $(m).children("g").length > 1;) e.addSubCommand(o.mergeLayer(!0));
      ke(), Oe(), V("changed", [m]), X(e)
  };
  var De = this.leaveContext = function() {
          var e, t = disabled_elems.length;
          if (t) {
              for (e = 0; e < t; e++) {
                  var i = disabled_elems[e],
                      r = ee(i, "orig_opac");
                  1 !== r ? i.setAttribute("opacity", r) : i.removeAttribute("opacity"), i.setAttribute("style", "pointer-events: inherit")
              }
              disabled_elems = [], ke(!0), V("contextset", null)
          }
          b = null
      },
      Re = this.setContext = function(e) {
          De(), "string" == typeof e && (e = svgedit.utilities.getElem(e)), b = e, $(e).parentsUntil("#svgcontent").andSelf().siblings().each(function() {
              var e = this.getAttribute("opacity") || 1;
              ee(this, "orig_opac", e), this.setAttribute("opacity", .33 * e), this.setAttribute("style", "pointer-events: none"), disabled_elems.push(this)
          }), ke(), V("contextset", b)
      };
  this.clear = function() {
      ce.clear(), ke(), o.clearSvgContentElement(), o.current_drawing_ = new svgedit.draw.Drawing(m), o.createLayer("Layer 1"), o.undoMgr.resetUndoStack(), Y.initGroup(), rubberBox = Y.getRubberBandBox(), V("cleared")
  }, this.linkControlPoints = ce.linkControlPoints, this.getContentElem = function() {
      return m
  }, this.getRootElem = function() {
      return h
  }, this.getSelectedElems = function() {
      return w
  };
  var Ve = this.getResolution = function() {
      var e = m.getAttribute("width") / p,
          t = m.getAttribute("height") / p;
      return {
          w: e,
          h: t,
          zoom: p
      }
  };
  this.getZoom = function() {
      return p
  }, this.getVersion = function() {
      return "svgcanvas.js ($Rev$)"
  }, this.setUiStrings = function(e) {
      $.extend(Z, e.notification)
  }, this.setConfig = function(e) {
      $.extend(a, e)
  }, this.getTitle = function(e) {
      var t;
      if (e = e || w[0], e) {
          e = $(e).data("gsvg") || $(e).data("symbol") || e;
          var i = e.childNodes;
          for (t = 0; t < i.length; t++)
              if ("title" == i[t].nodeName) return i[t].textContent;
          return ""
      }
  }, this.setGroupTitle = function(e) {
      var t = w[0];
      t = $(t).data("gsvg") || t;
      var i = $(t).children("title"),
          r = new svgedit.history.BatchCommand("Set Label");
      if (e.length)
          if (i.length) {
              var a = i[0];
              r.addSubCommand(new svgedit.history.ChangeElementCommand(a, {
                  "#text": a.textContent
              })), a.textContent = e
          } else a = g.createElementNS(n.SVG, "title"), a.textContent = e, $(t).prepend(a), r.addSubCommand(new svgedit.history.InsertElementCommand(a));
      else {
          var s = i.nextSibling;
          r.addSubCommand(new svgedit.history.RemoveElementCommand(i[0], s, t)), i.remove()
      }
      X(r)
  };
  var Ue = this.getDocumentTitle = function() {
      return o.getTitle(m)
  };
  this.setDocumentTitle = function(e) {
      var t, i = m.childNodes,
          r = !1,
          a = "",
          s = new svgedit.history.BatchCommand("Change Image Title");
      for (t = 0; t < i.length; t++)
          if ("title" == i[t].nodeName) {
              r = i[t], a = r.textContent;
              break
          } r || (r = g.createElementNS(n.SVG, "title"), m.insertBefore(r, m.firstChild)), e.length ? r.textContent = e : r.parentNode.removeChild(r), s.addSubCommand(new svgedit.history.ChangeElementCommand(r, {
          "#text": a
      })), X(s)
  }, this.getEditorNS = function(e) {
      return e && m.setAttribute("xmlns:se", n.SE), n.SE
  }, this.setResolution = function(e, t) {
      var i, r = Ve(),
          n = r.w,
          a = r.h;
      if ("fit" == e) {
          var s = getStrokedBBox();
          if (!s) return !1;
          i = new svgedit.history.BatchCommand("Fit Canvas to Content");
          var l = pe();
          Ee(l);
          var d = [],
              u = [];
          $.each(l, function(e, t) {
              d.push(-1 * s.x), u.push(-1 * s.y)
          });
          var g = o.moveSelectedElements(d, u, !0);
          i.addSubCommand(g), ke(), e = Math.round(s.width), t = Math.round(s.height)
      }
      if (e != n || t != a) {
          var c = h.suspendRedraw(1e3);
          i || (i = new svgedit.history.BatchCommand("Change Image Dimensions")), e = svgedit.units.convertToNum("width", e), t = svgedit.units.convertToNum("height", t), m.setAttribute("width", e), m.setAttribute("height", t), this.contentW = e, this.contentH = t, i.addSubCommand(new svgedit.history.ChangeElementCommand(m, {
              width: n,
              height: a
          })), m.setAttribute("viewBox", [0, 0, e / p, t / p].join(" ")), i.addSubCommand(new svgedit.history.ChangeElementCommand(m, {
              viewBox: ["0 0", n, a].join(" ")
          })), X(i), h.unsuspendRedraw(c), V("changed", [m])
      }
      return !0
  }, this.getOffset = function() {
      return $(m).attr(["x", "y"])
  }, this.setBBoxZoom = function(e, t, i) {
      var r, n = .85,
          a = function(e) {
              if (!e) return !1;
              var r = Math.round(t / e.width * 100 * n) / 100,
                  a = Math.round(i / e.height * 100 * n) / 100,
                  s = Math.min(r, a);
              return o.setZoom(s), {
                  zoom: s,
                  bbox: e
              }
          };
      if ("object" == typeof e) {
          if (r = e, 0 == r.width || 0 == r.height) {
              var s = r.zoom ? r.zoom : p * r.factor;
              return o.setZoom(s), {
                  zoom: p,
                  bbox: r
              }
          }
          return a(r)
      }
      switch (e) {
          case "selection":
              if (!w[0]) return;
              var l = $.map(w, function(e) {
                  if (e) return e
              });
              r = getStrokedBBox(l);
              break;
          case "canvas":
              var d = Ve();
              n = .95, r = {
                  width: d.w,
                  height: d.h,
                  x: 0,
                  y: 0
              };
              break;
          case "content":
              r = getStrokedBBox();
              break;
          case "layer":
              r = getStrokedBBox(pe(f().getCurrentLayer()));
              break;
          default:
              return
      }
      return a(r)
  }, this.setZoom = function(e) {
      var t = Ve();
      m.setAttribute("viewBox", "0 0 " + t.w / e + " " + t.h / e), p = e, $.each(w, function(e, t) {
          t && Y.requestSelector(t).resize()
      }), ce.zoomChange(), ae("zoomChanged", e)
  }, this.getMode = function() {
      return current_mode
  }, this.setMode = function(e) {
      ce.clear(!0), me.clear(), cur_properties = w[0] && "text" == w[0].nodeName ? cur_text : C, current_mode = e
  }, this.getColor = function(e) {
      return cur_properties[e]
  }, this.setColor = function(e, t, i) {
      function r(e) {
          "g" != e.nodeName && n.push(e)
      }
      C[e] = t, cur_properties[e + "_paint"] = {
          type: "solidColor"
      };
      for (var n = [], a = w.length; a--;) {
          var s = w[a];
          if (s)
              if ("g" == s.tagName) {
                  var o = s.id.substr(0, 3);
                  if ("GXP" === o) continue;
                  "MTR" === o ? svgedit.utilities.walkTree(s, function(t) {
                      t.hasAttribute(e) && "sMTR" != t.id.substr(0, 4) && n.push(t)
                  }) : ["CPS", "VLA", "EHS", "SHE"].includes(o) ? svgedit.utilities.walkTree(s, function(t) {
                      t.hasAttribute(e) && n.push(t)
                  }) : svgedit.utilities.walkTree(s, r)
              } else "fill" == e ? "polyline" != s.tagName && "line" != s.tagName && n.push(s) : n.push(s)
      }
      n.length > 0 && (i ? He(e, t, n) : (je(e, t, n), V("changed", n)))
  };
  var ze = this.setGradient = function(e) {
          if (cur_properties[e + "_paint"] && "solidColor" != cur_properties[e + "_paint"].type) {
              var t = o[e + "Grad"],
                  i = Fe(t),
                  r = svgedit.utilities.findDefs();
              if (i) t = i;
              else {
                  t = r.appendChild(g.importNode(t, !0)), t.id = he()
              }
              o.setColor(e, "url(#" + t.id + ")")
          }
      },
      Fe = function(e) {
          for (var t = svgedit.utilities.findDefs(), i = $(t).find("linearGradient, radialGradient"), r = i.length, a = ["r", "cx", "cy", "fx", "fy"]; r--;) {
              var s = i[r];
              if ("linearGradient" == e.tagName) {
                  if (e.getAttribute("x1") != s.getAttribute("x1") || e.getAttribute("y1") != s.getAttribute("y1") || e.getAttribute("x2") != s.getAttribute("x2") || e.getAttribute("y2") != s.getAttribute("y2")) continue
              } else {
                  var o = $(e).attr(a),
                      l = $(s).attr(a),
                      d = !1;
                  if ($.each(a, function(e, t) {
                          o[t] != l[t] && (d = !0)
                      }), d) continue
              }
              var u = e.getElementsByTagNameNS(n.SVG, "stop"),
                  g = s.getElementsByTagNameNS(n.SVG, "stop");
              if (u.length == g.length) {
                  for (var h = u.length; h--;) {
                      var m = u[h],
                          c = g[h];
                      if (m.getAttribute("offset") != c.getAttribute("offset") || m.getAttribute("stop-opacity") != c.getAttribute("stop-opacity") || m.getAttribute("stop-color") != c.getAttribute("stop-color")) break
                  }
                  if (-1 == h) return s
              }
          }
          return null
      };
  this.setPaint = function(e, t) {
          var i = new $.jGraduate.Paint(t);
          switch (this.setPaintOpacity(e, i.alpha / 100, !0), cur_properties[e + "_paint"] = i, i.type) {
              case "solidColor":
                  -1 === i.solidColor.indexOf("rgb") ? this.setColor(e, "none" != i.solidColor ? "#" + i.solidColor : "none") : this.setColor(e, i.solidColor);
                  break;
              case "linearGradient":
              case "radialGradient":
                  o[e + "Grad"] = i[i.type], ze(e)
          }
      }, this.setStrokePaint = function(e) {
          this.setPaint("stroke", e)
      }, this.setFillPaint = function(e) {
          this.setPaint("fill", e)
      }, this.getStrokeWidth = function() {
          return cur_properties.stroke_width
      }, this.setStrokeWidth = function(e) {
          function t(e) {
              "g" != e.nodeName && i.push(e)
          }
          if (0 == e && ["line", "path"].indexOf(current_mode) >= 0) o.setStrokeWidth(1);
          else {
              cur_properties.stroke_width = e;
              for (var i = [], r = w.length; r--;) {
                  var n = w[r];
                  n && ("g" == n.tagName ? svgedit.utilities.walkTree(n, t) : i.push(n))
              }
              i.length > 0 && (je("stroke-width", e, i), V("changed", w))
          }
      }, this.setStrokeAttr = function(e, t) {
          C[e.replace("-", "_")] = t;
          for (var i = [], r = w.length; r--;) {
              var n = w[r];
              n && ("g" == n.tagName ? svgedit.utilities.walkTree(n, function(e) {
                  "g" != e.nodeName && i.push(e)
              }) : i.push(n))
          }
          i.length > 0 && (je(e, t, i), V("changed", w))
      }, this.getStyle = function() {
          return C
      }, this.getOpacity = function() {
          return C.opacity
      }, this.setOpacity = function(e) {
          C.opacity = e, je("opacity", e)
      }, this.getFillOpacity = function() {
          return C.fill_opacity
      }, this.getStrokeOpacity = function() {
          return C.stroke_opacity
      }, this.setPaintOpacity = function(e, t, i) {
          C[e + "_opacity"] = t, i ? He(e + "-opacity", t) : je(e + "-opacity", t)
      }, this.getPaintOpacity = function(e) {
          return "fill" === e ? this.getFillOpacity() : this.getStrokeOpacity()
      }, this.getBlur = function(e) {
          var t = 0;
          if (e) {
              var i = e.getAttribute("filter");
              if (i) {
                  var r = svgedit.utilities.getElem(e.id + "_blur");
                  r && (t = r.firstChild.getAttribute("stdDeviation"))
              }
          }
          return t
      },
      function() {
          function e() {
              var e = o.undoMgr.finishUndoableChange();
              t.addSubCommand(e), X(t), t = null, i = null
          }
          var t = null,
              i = null,
              r = !1;
          o.setBlurNoUndo = function(e) {
              if (i)
                  if (0 === e) He("filter", ""), r = !0;
                  else {
                      var t = w[0];
                      r && He("filter", "url(#" + t.id + "_blur)"), svgedit.browser.isWebkit() && (console.log("e", t), t.removeAttribute("filter"), t.setAttribute("filter", "url(#" + t.id + "_blur)")), He("stdDeviation", e, [i.firstChild]), o.setBlurOffsets(i, e)
                  }
              else o.setBlur(e)
          }, o.setBlurOffsets = function(e, t) {
              t > 3 ? svgedit.utilities.assignAttributes(e, {
                  x: "-50%",
                  y: "-50%",
                  width: "200%",
                  height: "200%"
              }, 100) : svgedit.browser.isWebkit() || (e.removeAttribute("x"), e.removeAttribute("y"), e.removeAttribute("width"), e.removeAttribute("height"))
          }, o.setBlur = function(r, n) {
              if (t) e();
              else {
                  var a = w[0],
                      s = a.id;
                  i = svgedit.utilities.getElem(s + "_blur"), r -= 0;
                  var l = new svgedit.history.BatchCommand;
                  if (i) 0 === r && (i = null);
                  else {
                      var d = _({
                          element: "feGaussianBlur",
                          attr: {
                              in: "SourceGraphic",
                              stdDeviation: r
                          }
                      });
                      i = _({
                          element: "filter",
                          attr: {
                              id: s + "_blur"
                          }
                      }), i.appendChild(d), svgedit.utilities.findDefs().appendChild(i), l.addSubCommand(new svgedit.history.InsertElementCommand(i))
                  }
                  var u = {
                      filter: a.getAttribute("filter")
                  };
                  if (0 === r) return a.removeAttribute("filter"), void l.addSubCommand(new svgedit.history.ChangeElementCommand(a, u));
                  je("filter", "url(#" + s + "_blur)"), l.addSubCommand(new svgedit.history.ChangeElementCommand(a, u)), o.setBlurOffsets(i, r), t = l, o.undoMgr.beginUndoableChange("stdDeviation", [i ? i.firstChild : null]), n && (o.setBlurNoUndo(r), e())
              }
          }
      }(), this.getBold = function() {
          var e = w[0];
          return null != e && "text" == e.tagName && null == w[1] && "bold" == e.getAttribute("font-weight")
      }, this.setBold = function(e) {
          var t = w[0];
          null != t && "text" == t.tagName && null == w[1] && je("font-weight", e ? "bold" : "normal"), w[0].textContent || me.setCursor()
      }, this.getItalic = function() {
          var e = w[0];
          return null != e && "text" == e.tagName && null == w[1] && "italic" == e.getAttribute("font-style")
      }, this.setItalic = function(e) {
          var t = w[0];
          null != t && "text" == t.tagName && null == w[1] && je("font-style", e ? "italic" : "normal"), w[0].textContent || me.setCursor()
      }, this.getFontFamily = function() {
          return cur_text.font_family
      }, this.setFontFamily = function(e) {
          cur_text.font_family = e, je("font-family", e), w[0] && !w[0].textContent && me.setCursor(), ae("setFontAttribute", {
              elem: w[0],
              attr: "font-family",
              value: e
          })
      }, this.setTextAlign = function(e) {
          cur_text.text_anchor = e, je("text-anchor", e), w[0] && !w[0].textContent && me.setCursor(), ae("setFontAttribute", {
              elem: w[0],
              attr: "text-anchor",
              value: e
          })
      }, this.setFontColor = function(e) {
          cur_text.fill = e, je("fill", e)
      }, this.getFontColor = function() {
          return cur_text.fill
      }, this.getFontSize = function() {
          return cur_text.font_size
      }, this.setFontSize = function(e) {
          w[0] && (cur_text.font_size = e, je("font-size", e), w[0].textContent || me.setCursor(), ae("setFontAttribute", {
              elem: w[0],
              attr: "font-size",
              value: e + "px"
          }))
      }, this.getExtensionFont = function(e) {
          return oe("getFontAttribute", {
              elem: e
          })
      }, this.getText = function() {
          var e = w[0];
          return null == e ? "" : e.textContent
      }, this.setTextContent = function(e) {
          je("#text", e), me.init(e), me.setCursor()
      }, this.setImageURL = function(e) {
          var t = w[0];
          if (t) {
              var i = $(t).attr(["width", "height"]),
                  r = !i.width || !i.height,
                  n = I(t);
              if (n !== e) r = !0;
              else if (!r) return;
              var a = new svgedit.history.BatchCommand("Change Image URL");
              M(t, e), a.addSubCommand(new svgedit.history.ChangeElementCommand(t, {
                  "#href": n
              })), r ? $(new Image).load(function() {
                  var e = $(t).attr(["width", "height"]);
                  $(t).attr({
                      width: this.width,
                      height: this.height
                  }), Y.requestSelector(t).resize(), a.addSubCommand(new svgedit.history.ChangeElementCommand(t, e)), X(a), V("changed", [t])
              }).attr("src", e) : X(a)
          }
      }, this.setLinkURL = function(e) {
          var t = w[0];
          if (t) {
              if ("a" !== t.tagName) {
                  var i = $(t).parents("a");
                  if (!i.length) return;
                  t = i[0]
              }
              var r = I(t);
              if (r !== e) {
                  var n = new svgedit.history.BatchCommand("Change Link URL");
                  M(t, e), n.addSubCommand(new svgedit.history.ChangeElementCommand(t, {
                      "#href": r
                  })), X(n)
              }
          }
      }, this.setRectRadius = function(e) {
          var t = w[0];
          if (null != t && "rect" == t.tagName) {
              var i = t.getAttribute("rx");
              i != e && (t.setAttribute("rx", e), t.setAttribute("ry", e), X(new svgedit.history.ChangeElementCommand(t, {
                  rx: i,
                  ry: i
              }, "Radius")), V("changed", [t]))
          }
      }, this.convertToPath = function(e, t) {
          if (null != e) {
              if (!t) var i = new svgedit.history.BatchCommand("Convert element to Path");
              var r = t ? {} : {
                  fill: C.fill,
                  "fill-opacity": C.fill_opacity,
                  stroke: C.stroke,
                  "stroke-width": C.stroke_width,
                  "stroke-dasharray": C.stroke_dasharray,
                  "stroke-linejoin": C.stroke_linejoin,
                  "stroke-linecap": C.stroke_linecap,
                  "stroke-opacity": C.stroke_opacity,
                  opacity: C.opacity,
                  visibility: "hidden"
              };
              $.each(["marker-start", "marker-end", "marker-mid", "filter", "clip-path"], function() {
                  e.getAttribute(this) && (r[this] = e.getAttribute(this))
              });
              var n = _({
                      element: "path",
                      attr: r
                  }),
                  a = e.getAttribute("transform");
              a && n.setAttribute("transform", a);
              var s = e.id,
                  l = e.parentNode;
              e.nextSibling ? l.insertBefore(n, e) : l.appendChild(n);
              var d, u, g = "",
                  h = function(e) {
                      $.each(e, function(e, t) {
                          var i, r = t[0],
                              n = t[1];
                          for (g += r, i = 0; i < n.length; i += 2) g += n[i] + "," + n[i + 1] + " "
                      })
                  },
                  m = 1.81;
              switch (e.tagName) {
                  case "ellipse":
                  case "circle":
                      d = $(e).attr(["rx", "ry", "cx", "cy"]);
                      var c = d.cx,
                          v = d.cy;
                      u = d.rx, ry = d.ry, "circle" == e.tagName && (u = ry = $(e).attr("r")), h([
                          ["M", [c - u, v]],
                          ["C", [c - u, v - ry / m, c - u / m, v - ry, c, v - ry]],
                          ["C", [c + u / m, v - ry, c + u, v - ry / m, c + u, v]],
                          ["C", [c + u, v + ry / m, c + u / m, v + ry, c, v + ry]],
                          ["C", [c - u / m, v + ry, c - u, v + ry / m, c - u, v]],
                          ["Z", []]
                      ]);
                      break;
                  case "path":
                      g = e.getAttribute("d");
                      break;
                  case "line":
                      d = $(e).attr(["x1", "y1", "x2", "y2"]), g = "M" + d.x1 + "," + d.y1 + "L" + d.x2 + "," + d.y2;
                      break;
                  case "polyline":
                  case "polygon":
                      g = "M" + e.getAttribute("points");
                      break;
                  case "rect":
                      var f = $(e).attr(["rx", "ry"]);
                      u = f.rx, ry = f.ry;
                      var p = e.getBBox(),
                          y = p.x,
                          x = p.y,
                          b = p.width,
                          S = p.height;
                      m = 4 - m, u || ry ? h([
                          ["M", [y, x + ry]],
                          ["C", [y, x + ry / m, y + u / m, x, y + u, x]],
                          ["L", [y + b - u, x]],
                          ["C", [y + b - u / m, x, y + b, x + ry / m, y + b, x + ry]],
                          ["L", [y + b, x + S - ry]],
                          ["C", [y + b, x + S - ry / m, y + b - u / m, x + S, y + b - u, x + S]],
                          ["L", [y + u, x + S]],
                          ["C", [y + u / m, x + S, y, x + S - ry / m, y, x + S - ry]],
                          ["L", [y, x + ry]],
                          ["Z", []]
                      ]) : h([
                          ["M", [y, x]],
                          ["L", [y + b, x]],
                          ["L", [y + b, x + S]],
                          ["L", [y, x + S]],
                          ["L", [y, x]],
                          ["Z", []]
                      ]);
                      break;
                  default:
                      n.parentNode.removeChild(n)
              }
              if (g && n.setAttribute("d", g), t) {
                  ce.resetOrientation(n);
                  var N = !1;
                  try {
                      N = n.getBBox()
                  } catch (e) {}
                  return n.parentNode.removeChild(n), N
              }
              if (a) {
                  var A = svgedit.transformlist.getTransformList(n);
                  svgedit.math.hasMatrixTransform(A) && ce.resetOrientation(n)
              }
              var k = e.nextSibling;
              i.addSubCommand(new svgedit.history.RemoveElementCommand(e, k, l)), i.addSubCommand(new svgedit.history.InsertElementCommand(n)), ke(), e.parentNode.removeChild(e), n.setAttribute("id", s), n.removeAttribute("visibility"), Ee([n], !0), X(i)
          } else {
              $.each(w, function(e, t) {
                  t && o.convertToPath(t)
              })
          }
      }, this.makeHyperlink = function(e) {
          o.groupSelectedElements("a", e)
      }, this.removeHyperlink = function() {
          o.ungroupSelectedElement()
      }, this.setSegType = function(e) {
          ce.setSegType(e)
      };
  var je = this.changeSelectedAttribute = function(e, t, i) {
          i = i || w, 1 === i.length && l && i[0] && l.indexOf(i[0].id.substr(0, 4)) >= 0 && (i = i[0].childNodes), o.undoMgr.beginUndoableChange(e, i);
          i.length;
          He(e, t, i);
          var r = o.undoMgr.finishUndoableChange();
          r.isEmpty() || X(r)
      },
      He = function(e, t, i) {
          var r = h.suspendRedraw(1e3);
          "pathedit" == current_mode && ce.moveNode(e, t), i = i || w;
          for (var n = i.length, a = ["g", "polyline", "path"], s = ["transform", "opacity", "filter"]; n--;) {
              var l = i[n];
              if (null != l)
                  if (("x" === e || "y" === e) && a.indexOf(l.tagName) >= 0) {
                      var d = getStrokedBBox([l]),
                          u = "x" === e ? t - d.x : 0,
                          g = "y" === e ? t - d.y : 0;
                      o.moveSelectedElements(u * p, g * p, !0)
                  } else {
                      "g" === l.tagName && s.indexOf(e);
                      var m = "#text" === e ? l.textContent : l.getAttribute(e);
                      if (null == m && (m = ""), m !== String(t)) {
                          if ("#text" == e) {
                              svgedit.utilities.getBBox(l).width;
                              l.textContent = t, /rotate/.test(l.getAttribute("transform")) && (l = Se(l))
                          } else "#href" == e ? M(l, t) : (l.setAttribute(e, t), ae("setGaugeAttribute", {
                              elem: l,
                              attr: e,
                              value: t
                          }));
                          "textedit" === current_mode && "#text" !== e && l.textContent.length && me.toSelectMode(l), svgedit.browser.isGecko() && "text" === l.nodeName && /rotate/.test(l.getAttribute("transform")) && (0 === String(t).indexOf("url") || ["font-size", "font-family", "x", "y"].indexOf(e) >= 0 && l.textContent) && (l = Se(l)), w.indexOf(l) >= 0 && setTimeout(function() {
                              l.parentNode && Y.requestSelector(l).resize()
                          }, 0);
                          var c = svgedit.utilities.getRotationAngle(l);
                          if (0 != c && "transform" != e)
                              for (var v = svgedit.transformlist.getTransformList(l), f = v.numberOfItems; f--;) {
                                  var y = v.getItem(f);
                                  if (4 == y.type) {
                                      v.removeItem(f);
                                      var x = svgedit.utilities.getBBox(l),
                                          b = svgedit.math.transformPoint(x.x + x.width / 2, x.y + x.height / 2, svgedit.math.transformListToTransform(v).matrix),
                                          S = b.x,
                                          C = b.y,
                                          _ = h.createSVGTransform();
                                      _.setRotate(c, S, C), v.insertItemBefore(_, f);
                                      break
                                  }
                              }
                      }
                  }
          }
          h.unsuspendRedraw(r)
      };
  this.deleteSelectedElements = function() {
      var e, t = new svgedit.history.BatchCommand("Delete Elements"),
          i = w.length,
          r = [];
      for (e = 0; e < i; ++e) {
          var n = w[e];
          if (null == n) break;
          var a = n.parentNode,
              s = n;
          Y.releaseSelector(s), svgedit.path.removePath_(s.id), "a" === a.tagName && 1 === a.childNodes.length && (s = a, a = a.parentNode);
          var o = s.nextSibling,
              l = a.removeChild(s);
          r.push(n), w[e] = null, t.addSubCommand(new q(l, o, a))
      }
      return t.isEmpty() || X(t), V("changed", r), ke(), r
  }, this.cutSelectedElements = function() {
      var e, t = new svgedit.history.BatchCommand("Cut Elements"),
          i = w.length,
          r = [];
      for (e = 0; e < i; ++e) {
          var n = w[e];
          if (null == n) break;
          var a = n.parentNode,
              s = n;
          Y.releaseSelector(s), svgedit.path.removePath_(s.id);
          var l = s.nextSibling,
              d = a.removeChild(s);
          r.push(n), w[e] = null, t.addSubCommand(new q(d, l, a))
      }
      t.isEmpty() || X(t), V("changed", r), ke(), o.clipBoard = r
  }, this.pasteElements = function(e, t, i) {
      var r = o.clipBoard,
          n = r.length;
      if (n) {
          for (var a = [], s = new svgedit.history.BatchCommand("Paste elements"); n--;) {
              var l = r[n];
              if (l)
                  if (l.symbols && l.symbols.length) {
                      var d = svgedit.utilities.findDefs();
                      l.symbols.forEach(e => {
                          var t = svgedit.utilities.getElem(e.id);
                          t || d.appendChild(e)
                      }), l.defs && l.defs.appendTo(d)
                  } else {
                      var u = be(l);
                      a.push(u), (b || f().getCurrentLayer()).appendChild(u), s.addSubCommand(new svgedit.history.InsertElementCommand(u))
                  }
          }
          if (Be(a), "in_place" !== e) {
              var g, h;
              e ? "point" === e && (g = t, h = i) : (g = lastClickPoint.x, h = lastClickPoint.y);
              var m = getStrokedBBox(a),
                  c = g - (m.x + m.width / 2),
                  v = h - (m.y + m.height / 2),
                  p = [],
                  y = [];
              $.each(a, function(e, t) {
                  p.push(c), y.push(v)
              });
              var x = o.moveSelectedElements(p, y, !1);
              s.addSubCommand(x)
          }
          X(s), V("onGaugeCopyPaste", {
              copy: r,
              past: a.reverse()
          }), V("changed", a)
      }
  }, this.copySelectedElements = function() {
      o.clipBoard = $.merge([], w), qe()
  };
  var qe = function() {
      for (var e = {
              symbols: [],
              defs: null
          }, t = 0; t < o.clipBoard.length; t++) {
          var i = o.clipBoard[t];
          if (i) {
              var r = [];
              svgedit.utilities.walkTree(i, function(e) {
                  "use" === e.tagName && r.push(e)
              })
          }
          r.forEach(t => {
              var i = svgedit.utilities.getElem(I(t).substr(1)),
                  r = i.getAttribute("type"),
                  n = t.getAttribute("type");
              !n && r && t.setAttribute("type", r), e.symbols.find(e => e.id === i.id) || e.symbols.push(i)
          })
      }
      if (e.symbols.length) {
          const t = svgedit.utilities.findDefs();
          e.defs = $(t).find("linearGradient, radialGradient, pattern"), o.clipBoard.push(e)
      }
  };
  this.groupSelectedElements = function(e, t) {
      e || (e = "g");
      var i = "";
      switch (e) {
          case "a":
              i = "Make hyperlink";
              var r = "";
              arguments.length > 1 && (r = t);
              break;
          default:
              e = "g", i = "Group Elements"
      }
      var n = new svgedit.history.BatchCommand(i),
          a = _({
              element: e,
              attr: {
                  id: he(),
                  target: "_blank",
                  type: "svg-ext-shapes-group"
              }
          });
      "a" === e && M(a, r), n.addSubCommand(new svgedit.history.InsertElementCommand(a));
      for (var s = w.length; s--;) {
          var o = w[s];
          if (null != o) {
              "a" === o.parentNode.tagName && 1 === o.parentNode.childNodes.length && (o = o.parentNode);
              var l = o.nextSibling,
                  d = o.parentNode;
              a.appendChild(o), n.addSubCommand(new svgedit.history.MoveElementCommand(o, l, d))
          }
      }
      n.isEmpty() || X(n), Be([a], !0)
  };
  var We = this.pushGroupProperties = function(e, t) {
      var i, r, n, a = e.childNodes,
          s = a.length,
          l = e.getAttribute("transform"),
          d = svgedit.transformlist.getTransformList(e),
          u = svgedit.math.transformListToTransform(d).matrix,
          g = new svgedit.history.BatchCommand("Push group properties"),
          m = 0,
          c = svgedit.utilities.getRotationAngle(e),
          v = $(e).attr(["filter", "opacity"]);
      for (m = 0; m < s; m++) {
          var f = a[m];
          if (1 === f.nodeType) {
              if (null !== v.opacity && 1 !== v.opacity) {
                  f.getAttribute("opacity");
                  var p = Math.round((f.getAttribute("opacity") || 1) * v.opacity * 100) / 100;
                  je("opacity", p, [f])
              }
              if (v.filter) {
                  var y = this.getBlur(f),
                      x = y;
                  r || (r = this.getBlur(e)), y ? y = Number(r) + Number(y) : 0 === y && (y = r), x ? i = svgedit.utilities.getRefElem(f.getAttribute("filter")) : i ? (i = be(i), svgedit.utilities.findDefs().appendChild(i)) : i = svgedit.utilities.getRefElem(v.filter);
                  var b = "feGaussianBlur" === i.firstChild.tagName ? "blur" : "filter";
                  i.id = f.id + "_" + b, je("filter", "url(#" + i.id + ")", [f]), y && (je("stdDeviation", y, [i.firstChild]), o.setBlurOffsets(i, y))
              }
              var S = svgedit.transformlist.getTransformList(f);
              if (~f.tagName.indexOf("Gradient") && (S = null), S && "defs" !== f.tagName && d.numberOfItems) {
                  if (c && 1 == d.numberOfItems) {
                      var C = d.getItem(0).matrix,
                          w = h.createSVGMatrix(),
                          _ = svgedit.utilities.getRotationAngle(f);
                      _ && (w = S.getItem(0).matrix);
                      var N = svgedit.utilities.getBBox(f),
                          A = svgedit.math.transformListToTransform(S).matrix,
                          k = svgedit.math.transformPoint(N.x + N.width / 2, N.y + N.height / 2, A),
                          E = c + _,
                          B = h.createSVGTransform();
                      B.setRotate(E, k.x, k.y);
                      var T = svgedit.math.matrixMultiply(C, w, B.matrix.inverse());
                      if (_ && S.removeItem(0), E && (S.numberOfItems ? S.insertItemBefore(B, 0) : S.appendItem(B)), T.e || T.f) {
                          var G = h.createSVGTransform();
                          G.setTranslate(T.e, T.f), S.numberOfItems ? S.insertItemBefore(G, 0) : S.appendItem(G)
                      }
                  } else {
                      var I = f.getAttribute("transform");
                      n = {}, n.transform = I || "";
                      var M = h.createSVGTransform(),
                          L = svgedit.math.transformListToTransform(S).matrix,
                          P = L.inverse(),
                          O = svgedit.math.matrixMultiply(P, u, L);
                      M.setMatrix(O), S.appendItem(M)
                  }
                  var D = svgedit.recalculate.recalculateDimensions(f);
                  D && g.addSubCommand(D)
              }
          }
      }
      if (l && (n = {}, n.transform = l, e.setAttribute("transform", ""), e.removeAttribute("transform"), g.addSubCommand(new svgedit.history.ChangeElementCommand(e, n))), t && !g.isEmpty()) return g
  };
  this.ungroupSelectedElement = function() {
      var e = w[0];
      if (e)
          if ($(e).data("gsvg") || $(e).data("symbol")) Pe(e);
          else {
              if ("use" === e.tagName) {
                  var t = svgedit.utilities.getElem(I(e).substr(1));
                  return $(e).data("symbol", t).data("ref", t), void Pe(e)
              }
              var i = $(e).parents("a");
              if (i.length && (e = i[0]), "g" === e.tagName || "a" === e.tagName) {
                  var r = new svgedit.history.BatchCommand("Ungroup Elements"),
                      n = We(e, !0);
                  n && r.addSubCommand(n);
                  for (var a = e.parentNode, s = e.nextSibling, o = new Array(e.childNodes.length), l = 0; e.firstChild;) {
                      var d = e.firstChild,
                          u = d.nextSibling,
                          g = d.parentNode;
                      if ("title" !== d.tagName) o[l++] = d = a.insertBefore(d, s), r.addSubCommand(new svgedit.history.MoveElementCommand(d, u, g));
                      else {
                          var h = d.nextSibling;
                          r.addSubCommand(new svgedit.history.RemoveElementCommand(d, h, g)), g.removeChild(d)
                      }
                  }
                  ke();
                  var m = e.nextSibling;
                  e = a.removeChild(e), r.addSubCommand(new svgedit.history.RemoveElementCommand(e, m, a)), r.isEmpty() || X(r), Ee(o)
              }
          }
  }, this.moveToTopSelectedElement = function() {
      var e = w[0];
      if (null != e) {
          var t = e,
              i = t.parentNode,
              r = t.nextSibling;
          t = t.parentNode.appendChild(t), r != t.nextSibling && (X(new svgedit.history.MoveElementCommand(t, r, i, "top")), V("changed", [t]))
      }
  }, this.moveToBottomSelectedElement = function() {
      var e = w[0];
      if (null != e) {
          var t = e,
              i = t.parentNode,
              r = t.nextSibling,
              n = t.parentNode.firstChild;
          "title" == n.tagName && (n = n.nextSibling), "defs" == n.tagName && (n = n.nextSibling), t = t.parentNode.insertBefore(t, n), r != t.nextSibling && (X(new svgedit.history.MoveElementCommand(t, r, i, "bottom")), V("changed", [t]))
      }
  }, this.moveUpDownSelected = function(e) {
      var t = w[0];
      if (t) {
          var i, r;
          curBBoxes = [];
          var n = $(ue(getStrokedBBox([t]))).toArray();
          if ("Down" == e && n.reverse(), $.each(n, function() {
                  if (r) return i = this, !1;
                  this == t && (r = !0)
              }), i) {
              var a = t,
                  s = a.parentNode,
                  o = a.nextSibling;
              $(i)["Down" == e ? "before" : "after"](a), o != a.nextSibling && (X(new svgedit.history.MoveElementCommand(a, o, s, "Move " + e)), V("changed", [a]))
          }
      }
  }, this.moveSelectedElements = function(e, t, i) {
      e.constructor != Array && (e /= p, t /= p), i = i || !0;
      for (var r = new svgedit.history.BatchCommand("position"), n = w.length; n--;) {
          var a = w[n];
          if (null != a) {
              var s = h.createSVGTransform(),
                  o = svgedit.transformlist.getTransformList(a);
              e.constructor == Array ? s.setTranslate(e[n], t[n]) : s.setTranslate(e, t), o.numberOfItems ? o.insertItemBefore(s, 0) : o.appendItem(s);
              var l = svgedit.recalculate.recalculateDimensions(a);
              l && r.addSubCommand(l), Y.requestSelector(a).resize()
          }
      }
      if (!r.isEmpty()) return i && X(r), V("changed", w), r
  }, this.setFilterShadow = function(e) {
      if (!(w.length <= 0)) {
          var t = w[0];
          if (e) {
              var i = svgedit.utilities.findDefs();
              if (i) {
                  var r = $(i).find("filter");
                  r && r.length || (r = g.createElementNS(n.SVG, "filter"), i.appendChild(r), r.setAttribute("id", "shadow-box"));
                  var a = $(r).find("feDropShadow");
                  a && a.length || (a = g.createElementNS(n.SVG, "feDropShadow"), a.setAttribute("dx", "2"), a.setAttribute("dy", "2"), a.setAttribute("stdDeviation", "2"), r.appendChild(a)), t.setAttribute("filter", "url(#shadow-box)")
              }
          } else t.removeAttribute("filter")
      }
  }, this.cloneSelectedElements = function(e, t) {
      function i(e, t) {
          return $(t).index() - $(e).index()
      }
      var r, n, a = new svgedit.history.BatchCommand("Clone Elements"),
          s = w.length;
      for (w.sort(i), r = 0; r < s && (n = w[r], null != n); ++r);
      var o = w.slice(0, r);
      for (this.clearSelection(!0), r = o.length; r--;) n = o[r] = be(o[r]), (b || f().getCurrentLayer()).appendChild(n), a.addSubCommand(new svgedit.history.InsertElementCommand(n));
      a.isEmpty() || (Ee(o.reverse()), this.moveSelectedElements(e, t, !1), X(a)), V("onGaugeCopyPaste", {
          copy: w,
          past: o
      })
  }, this.alignSelectedElements = function(e, t) {
      var i, r, n = [],
          a = Number.MAX_VALUE,
          s = Number.MIN_VALUE,
          l = Number.MAX_VALUE,
          d = Number.MIN_VALUE,
          u = Number.MIN_VALUE,
          g = Number.MIN_VALUE,
          h = w.length;
      if (h) {
          for (i = 0; i < h && null != w[i]; ++i) switch (r = w[i], n[i] = getStrokedBBox([r]), t) {
              case "smallest":
                  (("l" == e || "c" == e || "r" == e) && (u == Number.MIN_VALUE || u > n[i].width) || ("t" == e || "m" == e || "b" == e) && (g == Number.MIN_VALUE || g > n[i].height)) && (a = n[i].x, l = n[i].y, s = n[i].x + n[i].width, d = n[i].y + n[i].height, u = n[i].width, g = n[i].height);
                  break;
              case "largest":
                  (("l" == e || "c" == e || "r" == e) && (u == Number.MIN_VALUE || u < n[i].width) || ("t" == e || "m" == e || "b" == e) && (g == Number.MIN_VALUE || g < n[i].height)) && (a = n[i].x, l = n[i].y, s = n[i].x + n[i].width, d = n[i].y + n[i].height, u = n[i].width, g = n[i].height);
                  break;
              default:
                  n[i].x < a && (a = n[i].x), n[i].y < l && (l = n[i].y), n[i].x + n[i].width > s && (s = n[i].x + n[i].width), n[i].y + n[i].height > d && (d = n[i].y + n[i].height)
          }
          "page" == t && (a = 0, l = 0, s = o.contentW, d = o.contentH);
          var m = new Array(h),
              c = new Array(h);
          for (i = 0; i < h && null != w[i]; ++i) {
              r = w[i];
              var v = n[i];
              switch (m[i] = 0, c[i] = 0, e) {
                  case "l":
                      m[i] = a - v.x;
                      break;
                  case "c":
                      m[i] = (a + s) / 2 - (v.x + v.width / 2);
                      break;
                  case "r":
                      m[i] = s - (v.x + v.width);
                      break;
                  case "t":
                      c[i] = l - v.y;
                      break;
                  case "m":
                      c[i] = (l + d) / 2 - (v.y + v.height / 2);
                      break;
                  case "b":
                      c[i] = d - (v.y + v.height)
              }
          }
          this.moveSelectedElements(m, c)
      }
  }, this.divideSelectedElements = function(e) {
      var t, i, r = [],
          n = Number.MAX_VALUE,
          a = Number.MIN_VALUE,
          s = Number.MAX_VALUE,
          o = Number.MIN_VALUE,
          l = 0,
          d = 0,
          u = 0,
          g = w.length;
      if (g && !(g < 3)) {
          for (t = 0; t < g && null != w[t]; ++t) i = w[t], u++, r[t] = getStrokedBBox([i]), r[t].index = t, r[t].x < n && (n = r[t].x), r[t].y < s && (s = r[t].y), r[t].x + r[t].width > a && (a = r[t].x + r[t].width), r[t].y + r[t].height > o && (o = r[t].y + r[t].height), d += r[t].height, l += r[t].width;
          "h" === e ? r.sort((e, t) => e.x > t.x ? 1 : -1) : "v" === e && r.sort((e, t) => e.y > t.y ? 1 : -1), u--;
          var h = new Array(r.length),
              m = new Array(r.length),
              c = (a - n - l) / u,
              v = (o - s - d) / u,
              f = n,
              p = s;
          for (t = 0; t < r.length; ++t) {
              var y = r[t];
              switch (h[t] = {
                      x: y.x,
                      i: y.index
                  }, m[t] = {
                      y: y.y,
                      i: y.index
                  }, e) {
                  case "h":
                      h[t].x = t > 0 ? f > y.x ? f - y.x : -(y.x - f) : 0, f += y.width + c, m[t].y = 0;
                      break;
                  case "v":
                      m[t].y = t > 0 ? p > y.y ? p - y.y : -(y.y - p) : 0, p += y.height + v, h[t].x = 0
              }
          }
          h.sort((e, t) => e.i > t.i ? 1 : -1), m.sort((e, t) => e.i > t.i ? 1 : -1), h = h.map(e => Math.round(100 * e.x) / 100), m = m.map(e => Math.round(100 * e.y) / 100), this.moveSelectedElements(h, m)
      }
  }, this.contentW = Ve().w, this.contentH = Ve().h, this.updateCanvas = function(e, t) {
      h.setAttribute("width", e), h.setAttribute("height", t);
      var i = $("#canvasBackground")[0],
          r = m.getAttribute("x"),
          n = m.getAttribute("y"),
          a = e / 2 - this.contentW * p / 2,
          s = t / 2 - this.contentH * p / 2;
      svgedit.utilities.assignAttributes(m, {
          width: this.contentW * p,
          height: this.contentH * p,
          x: a,
          y: s,
          viewBox: "0 0 " + this.contentW + " " + this.contentH
      }), svgedit.utilities.assignAttributes(i, {
          width: m.getAttribute("width"),
          height: m.getAttribute("height"),
          x: a,
          y: s
      });
      var o = svgedit.utilities.getElem("background_image");
      return o && svgedit.utilities.assignAttributes(o, {
          width: "100%",
          height: "100%"
      }), Y.selectorParentGroup.setAttribute("transform", "translate(" + a + "," + s + ")"), ae("canvasUpdated", {
          new_x: a,
          new_y: s,
          old_x: r,
          old_y: n,
          d_x: a - r,
          d_y: s - n
      }), {
          x: a,
          y: s,
          old_x: r,
          old_y: n,
          d_x: a - r,
          d_y: s - n
      }
  }, this.setBackground = function(e, t) {
      var i = svgedit.utilities.getElem("canvasBackground"),
          r = $(i).find("rect")[0],
          a = svgedit.utilities.getElem("background_image");

      if (t) {
          // 有背景圖片時，rect 設為透明
          r.setAttribute("fill", "none");

          if (!a) {
              a = g.createElementNS(n.SVG, "image");
              svgedit.utilities.assignAttributes(a, {
                  id: "background_image",
                  width: "100%",
                  height: "100%",
                  x: "0",
                  y: "0",
                  preserveAspectRatio: "none",
                  style: "pointer-events:none"
              });
              // 插入到 rect 之後，確保圖片在背景色之上
              var rect = $(i).find("rect")[0];
              if (rect && rect.nextSibling) {
                  i.insertBefore(a, rect.nextSibling);
              } else {
                  i.appendChild(a);
              }
          }
          // 同時設置 href 和 xlink:href 以確保兼容性
          M(a, t);
          a.setAttribute("href", t);
      } else {
          // 沒有背景圖片時，設置背景色
          r.setAttribute("fill", e || "#ffffff");

          if (a && a.parentNode) {
              a.parentNode.removeChild(a);
          }
      }
  }, this.cycleElement = function(e) {
      var t, i = w[0],
          r = !1,
          n = pe(b || f().getCurrentLayer());
      if (n.length) {
          if (null == i) t = e ? n.length - 1 : 0, r = n[t];
          else
              for (var a = n.length; a--;)
                  if (n[a] == i) {
                      t = e ? a - 1 : a + 1, t >= n.length ? t = 0 : t < 0 && (t = n.length - 1), r = n[t];
                      break
                  } Be([r], !0), V("selected", w)
      }
  }, this.clear(), this.getExtensionMember = function(e, t) {
      var i = [];
      return $.each(extensions, function(r, n) {
          n && e in n && i.push(n[e](t))
      }), i
  }, this.getPrivateMethods = function() {
      var e = {
          addCommandToHistory: X,
          setGradient: ze,
          addSvgElementFromJson: _,
          addSvgGroupFromJson: N,
          assignAttributes: O,
          BatchCommand: K,
          call: V,
          ChangeElementCommand: W,
          copyElem: be,
          ffClone: Se,
          findDefs: T,
          findDuplicateGradient: Fe,
          getElem: P,
          getId: ge,
          getIntersectionList: ue,
          getMouseTarget: Te,
          getNextId: he,
          getPathBBox: L,
          getUrlFromAttr: G,
          hasMatrixTransform: E,
          identifyLayers: Oe,
          InsertElementCommand: H,
          isIdentity: svgedit.math.isIdentity,
          logMatrix: Ne,
          matrixMultiply: k,
          MoveElementCommand: j,
          preventClickDefault: Ge,
          recalculateAllSelectedDimensions: we,
          recalculateDimensions: U,
          remapElement: R,
          RemoveElementCommand: q,
          removeUnusedDefElems: Ie,
          round: de,
          runExtensions: ae,
          setSpecialsIds: se,
          runGetExtensions: oe,
          runExtension: le,
          sanitizeSvg: F,
          SVGEditTransformList: svgedit.transformlist.SVGTransformList,
          toString: toString,
          transformBox: svgedit.math.transformBox,
          transformListToTransform: B,
          transformPoint: A,
          walkTree: svgedit.utilities.walkTree
      };
      return e
  }
};
var mysvgeditor = {
  initSvgEditor: function(e, t, n, o, i, a, r, l, s) {
      window.svgEditor = function(e) {
          function c(t, n) {
              var o = !1 !== d.setSvgString(t);
              n = n || e.noop, o ? n(!0) : e.alert(uiStrings.notification.errorLoadingSVG, function() {
                  n(!1)
              })
          }
          var u = {};
          console.log("editor v2.9.9-166"), e(document).unbind("keydown"), u.tool_scale = 1, u.exportWindowCt = 0, u.langChanged = !1, u.showSaveWarning = !1, u.storagePromptClosed = !1, u.extensionLoadedCallback = n, u.onSelectedElement = t, u.changeColor = o, u.onGaugeAdded = i, u.onGaugeResized = r, u.onGaugeRemoved = a, u.onGaugeCopyPaste = l, u.onGroupChanged = s, u.currentExtensionsInteractivityType = [], u.currentExtensionsPrefixIdType = [], u.shapesGrps = {}, u.shapesList = [], u.baseSvgTags = ["path", "line", "rect", "circle", "ellipse", "text", "image"];
          var d, f, p = ["VAL_", "HXI_", "HXB_", "HXS_"],
              g = ["HXI_", "HXB_", "HXS_", "GXP_", "HXC_", "BAG_", "SLI_", "HXT_"],
              v = ["SHE_"],
              h = svgedit.utilities,
              m = svgedit.shapes;
          return isReady = !1, customExportImage = !1, customExportPDF = !1, callbacks = [], defaultPrefs = {
              lang: "",
              iconsize: "",
              bkgd_color: "#FFF",
              bkgd_url: "",
              img_save: "embed",
              save_notice_done: !1,
              export_notice_done: !1
          }, curPrefs = {}, curConfig = {
              extensions: [],
              allowedOrigins: []
          }, defaultExtensions = ["ext-overview_window.js", "ext-markers.js", "ext-connector.js", "ext-eyedropper.js", "ext-imagelib.js", "ext-grid.js", "ext-polygon.js", "ext-panning.js", "ext-storage.js"], defaultConfig = {
              canvasName: "default",
              canvas_expansion: 3,
              initFill: {
                  color: "FF0000",
                  opacity: 1
              },
              initStroke: {
                  width: 1,
                  color: "000000",
                  opacity: 1
              },
              initOpacity: 1,
              colorPickerCSS: null,
              initTool: "select",
              exportWindowType: "new",
              wireframe: !1,
              showlayers: !1,
              no_save_warning: !1,
              imgPath: "images/",
              langPath: "locale/",
              extPath: "extensions/",
              jGraduatePath: "jgraduate/images/",
              shapesPath: "assets/lib/svgeditor/shapes/",
              dimensions: [640, 480],
              gridSnapping: !0,
              gridColor: "#000",
              baseUnit: "px",
              snappingStep: 2,
              showRulers: !0,
              preventAllURLConfig: !1,
              preventURLContentLoading: !1,
              lockExtensions: !1,
              noDefaultExtensions: !1,
              showGrid: !1,
              noStorageOnLoad: !1,
              forceStorage: !1,
              emptyStorageOnDecline: !1
          }, uiStrings = u.uiStrings = {
              common: {
                  ok: "OK",
                  cancel: "Cancel",
                  key_up: "Up",
                  key_down: "Down",
                  key_backspace: "Backspace",
                  key_del: "Del"
              },
              layers: {
                  layer: "Layer"
              },
              notification: {
                  invalidAttrValGiven: "Invalid value given",
                  noContentToFitTo: "No content to fit to",
                  dupeLayerName: "There is already a layer named that!",
                  enterUniqueLayerName: "Please enter a unique layer name",
                  enterNewLayerName: "Please enter the new layer name",
                  layerHasThatName: "Layer already has that name",
                  QmoveElemsToLayer: "Move selected elements to layer '%s'?",
                  QwantToClear: "Do you want to clear the drawing?\nThis will also erase your undo history!",
                  QwantToOpen: "Do you want to open a new file?\nThis will also erase your undo history!",
                  QerrorsRevertToSource: "There were parsing errors in your SVG source.\nRevert back to original SVG source?",
                  QignoreSourceChanges: "Ignore changes made to SVG source?",
                  featNotSupported: "Feature not supported",
                  enterNewImgURL: "Enter the new image URL",
                  defsFailOnSave: "NOTE: Due to a bug in your browser, this image may appear wrong (missing gradients or elements). It will however appear correct once actually saved.",
                  loadingImage: "Loading image, please wait...",
                  saveFromBrowser: "Select 'Save As...' in your browser to save this image as a %s file.",
                  noteTheseIssues: "Also note the following issues: ",
                  unsavedChanges: "There are unsaved changes.",
                  enterNewLinkURL: "Enter the new hyperlink URL",
                  errorLoadingSVG: "Error: Unable to load SVG data",
                  URLloadFail: "Unable to load from URL",
                  retrieving: "Retrieving '%s' ..."
              }
          }, e.pref = function(e, t) {
              return t ? (curPrefs[e] = t, void(u.curPrefs = curPrefs)) : e in curPrefs ? curPrefs[e] : defaultPrefs[e]
          }, u.loadContentAndPrefs = function() {
              if (curConfig.forceStorage || !curConfig.noStorageOnLoad && document.cookie.match(/(?:^|;\s*)store=(?:prefsAndContent|prefsOnly)/)) {
                  if (u.storage && (curConfig.forceStorage || !curConfig.noStorageOnLoad && document.cookie.match(/(?:^|;\s*)store=prefsAndContent/))) {
                      var e = "svgedit-" + curConfig.canvasName,
                          t = u.storage.getItem(e);
                      t && u.loadFromString(t)
                  }
                  var n;
                  for (n in defaultPrefs)
                      if (defaultPrefs.hasOwnProperty(n)) {
                          var o = "web-edit-" + n;
                          if (u.storage) {
                              var i = u.storage.getItem(o);
                              i && (defaultPrefs[n] = String(i))
                          } else if (window.widget) defaultPrefs[n] = widget.preferenceForKey(o);
                          else {
                              var a = document.cookie.match(new RegExp("(?:^|;\\s*)" + h.preg_quote(encodeURIComponent(o)) + "=([^;]+)"));
                              defaultPrefs[n] = a ? decodeURIComponent(a[1]) : ""
                          }
                      }
              }
          }, u.setConfig = function(t, n) {
              function o(t, n, o) {
                  t[n] && "object" == typeof t[n] ? e.extend(!0, t[n], o) : t[n] = o
              }
              n = n || {}, e.each(t, function(i, a) {
                  if (t.hasOwnProperty(i))
                      if (defaultPrefs.hasOwnProperty(i)) {
                          if (!1 === n.overwrite && (curConfig.preventAllURLConfig || curPrefs.hasOwnProperty(i))) return;
                          !0 === n.allowInitialUserOverride ? defaultPrefs[i] = a : e.pref(i, a)
                      } else if (["extensions", "allowedOrigins"].indexOf(i) > -1) {
                      if (!1 === n.overwrite && (curConfig.preventAllURLConfig || "allowedOrigins" === i || "extensions" === i && curConfig.lockExtensions)) return;
                      curConfig[i] = curConfig[i].concat(a)
                  } else if (defaultConfig.hasOwnProperty(i)) {
                      if (!1 === n.overwrite && (curConfig.preventAllURLConfig || curConfig.hasOwnProperty(i))) return;
                      if (curConfig.hasOwnProperty(i)) {
                          if (!1 === n.overwrite) return;
                          o(curConfig, i, a)
                      } else !0 === n.allowInitialUserOverride ? o(defaultConfig, i, a) : defaultConfig[i] && "object" == typeof defaultConfig[i] ? (curConfig[i] = {}, e.extend(!0, curConfig[i], a)) : curConfig[i] = a
                  }
              }), u.curConfig = curConfig
          }, u.setCustomHandlers = function(t) {
              u.ready(function() {
                  t.open && (e('#tool_open > input[type="file"]').remove(), e("#tool_open").show(), d.open = t.open), t.save && (u.showSaveWarning = !1, d.bind("saved", t.save)), t.exportImage && (customExportImage = t.exportImage, d.bind("exported", customExportImage)), t.exportPDF && (customExportPDF = t.exportPDF, d.bind("exportedPDF", customExportPDF))
              })
          }, u.randomizeIds = function() {
              d.randomizeIds(arguments)
          }, u.init = function(t) {
              function n() {
                  curPrefs = e.extend(!0, {}, defaultPrefs, curPrefs), u.curPrefs = curPrefs
              }

              function o() {
                  curConfig = e.extend(!0, {}, defaultConfig, curConfig), curConfig.noDefaultExtensions || (curConfig.extensions = curConfig.extensions.concat(defaultExtensions)), e.each(["extensions", "allowedOrigins"], function(t, n) {
                      curConfig[n] = e.grep(curConfig[n], function(e, t) {
                          return t === curConfig[n].indexOf(e)
                      })
                  }), u.curConfig = curConfig
              }

              function i(t, n) {
                  var o = t.id,
                      i = o.split("_"),
                      a = i[0],
                      r = i[1];
                  n && d.setStrokeAttr("stroke-" + a, r), pe(), P("#cur_" + a, o, 20), e(t).addClass("current").siblings().removeClass("current")
              }

              function r(t, n) {
                  e.pref("bkgd_color", t), e.pref("bkgd_url", n), d.setBackground(t, n)
              }

              function l() {
                  var t = d.getHref(K);
                  if (t = 0 === t.indexOf("data:") ? "" : t, u.promptImgURLcallback) {
                      var n = u.promptImgURLcallback;
                      n && he(n)
                  } else e.prompt(uiStrings.notification.enterNewImgURL, t, function(e) {
                      e && he(e)
                  })
              }

              function s(t, n) {
                  var o, i;
                  n || (n = d.getZoom()), t || (t = e("#svgcanvas"));
                  var a = 3e4,
                      r = d.getContentElem(),
                      l = svgedit.units.getTypeMap(),
                      s = l[curConfig.baseUnit];
                  for (o = 0; o < 2; o++) {
                      var c = 0 === o,
                          u = c ? "x" : "y",
                          f = c ? "width" : "height",
                          p = Number(r.getAttribute(u)),
                          g = e("#ruler_" + u + " canvas:first"),
                          v = g.clone();
                      g.replaceWith(v);
                      var h = v[0],
                          m = t[f](),
                          _ = m;
                      h.parentNode.style[f] = _ + "px";
                      var w, y, b, C = 0,
                          x = h.getContext("2d");
                      if (x.fillStyle = "#666666", x.fillRect(0, 0, h.width, h.height), v.siblings().remove(), m >= a) {
                          var k;
                          for (b = parseInt(m / a, 10) + 1, w = [], w[0] = x, i = 1; i < b; i++) h[f] = a, k = h.cloneNode(!0), h.parentNode.appendChild(k), w[i] = k.getContext("2d");
                          k[f] = m % a, m = a
                      }
                      h[f] = m;
                      var S = s * n,
                          E = 50 / S,
                          F = 1;
                      for (i = 0; i < re.length && (y = re[i], F = y, !(E <= y)); i++);
                      var P = F * S;
                      x.font = "8px sans-serif";
                      for (var A = p / S % F * S, T = A - P; A < _;) {
                          T += P, x.fillStyle = "#CACACA";
                          var L, D = Math.round(A) + .5;
                          if (c ? (x.moveTo(D, 15), x.lineTo(D, 0)) : (x.moveTo(15, D), x.lineTo(0, D)), y = (T - p) / S, F >= 1) L = Math.round(y);
                          else {
                              var I = String(F).split(".")[1].length;
                              L = y.toFixed(I)
                          }
                          if (0 !== L && 1e3 !== L && L % 1e3 == 0 && (L = L / 1e3 + "K"), c) x.fillText(L, A + 2, 8);
                          else {
                              var N = String(L).split("");
                              for (i = 0; i < N.length; i++) x.fillText(N[i], 1, A + 9 + 9 * i)
                          }
                          var B = P / 10;
                          for (i = 1; i < 10; i++) {
                              var O = Math.round(A + B * i) + .5;
                              if (w && O > m) {
                                  if (C++, x.stroke(), C >= b) {
                                      i = 10, A = _;
                                      continue
                                  }
                                  x = w[C], A -= a, O = Math.round(A + B * i) + .5
                              }
                              var U = i % 2 ? 12 : 10;
                              c ? (x.moveTo(O, 15), x.lineTo(O, U)) : (x.moveTo(15, O), x.lineTo(U, O))
                          }
                          A += P
                      }
                      x.strokeStyle = "#666666", x.stroke()
                  }
              }

              function _() {
                  d.deleteCurrentLayer() && (ye(), se(), e("#layerlist tr.layer").removeClass("layersel"), e("#layerlist tr.layer:first").addClass("layersel"))
              }

              function w() {
                  var t = d.getCurrentDrawing().getCurrentLayerName() + " copy";
                  e.prompt(uiStrings.notification.enterUniqueLayerName, t, function(t) {
                      t && (d.getCurrentDrawing().hasLayer(t) ? e.alert(uiStrings.notification.dupeLayerName) : (d.cloneLayer(t), ye(), se()))
                  })
              }

              function y() {
                  e("#layerlist tr.layersel").index() != d.getCurrentDrawing().getNumLayers() - 1 && (d.mergeLayer(), ye(), se())
              }

              function b(t) {
                  var n = e("#layerlist tr.layersel").index(),
                      o = d.getCurrentDrawing().getNumLayers();
                  (n > 0 || n < o - 1) && (n += t, d.setCurrentLayerPosition(o - n - 1), se())
              }

              function C(e, t) {
                  var n = Number(e.value),
                      o = n + t,
                      i = o >= n;
                  return 0 === t ? n : n >= 24 ? i ? Math.round(1.1 * n) : Math.round(n / 1.1) : n <= 1 ? i ? 2 * n : n / 2 : o
              }

              function x(e, t) {
                  var n = Number(e.value);
                  if (0 === n) return 100;
                  var o = n + t;
                  return 0 === t ? n : n >= 100 ? o : o >= n ? 2 * n : n / 2
              }

              function k(e) {
                  e.stopPropagation(), e.preventDefault()
              }

              function S(e) {
                  e.stopPropagation(), e.preventDefault()
              }

              function E(e) {
                  e.stopPropagation(), e.preventDefault()
              }
              try {
                  "localStorage" in window && (u.storage = localStorage)
              } catch (e) {}
              var F = [];
              e("#lang_select option").each(function() {
                      F.push(this.value)
                  }),
                  function() {
                      var t, i;
                      if (f = e.deparam.querystring(!0), e.isEmptyObject(f)) o(), u.loadContentAndPrefs(), n();
                      else {
                          if (f.dimensions && (f.dimensions = f.dimensions.split(",")), f.bkgd_color && (f.bkgd_color = "#" + f.bkgd_color), f.extensions && (f.extensions = f.extensions.match(/[:\/\\]/) ? "" : f.extensions.split(",")), e.each(["extPath", "imgPath", "langPath", "jGraduatePath"], function(e) {
                                  f[e] && delete f[e]
                              }), u.setConfig(f, {
                                  overwrite: !1
                              }), o(), !curConfig.preventURLContentLoading) {
                              if (t = f.source, i = e.param.querystring(), t || i.indexOf("source=data:") >= 0 && (t = i.match(/source=(data:[^&]*)/)[1]), t) return void(0 === t.indexOf("data:") ? u.loadFromDataURI(t) : u.loadFromString(t));
                              if (f.url) return void u.loadFromURL(f.url)
                          }
                          f.noStorageOnLoad && !curConfig.forceStorage || u.loadContentAndPrefs(), n()
                      }
                  }(),
                  function() {
                      var e, n = window.opener;
                      if (n) try {
                          e = n.document.createEvent("Event"), e.initEvent("svgEditorReady", !0, !0), n.document.documentElement.dispatchEvent(e)
                      } catch (e) {}
                      t && setTimeout(t, 2e3)
                  }();
              var P = u.setIcon = function(t, n, o) {
                      var i = "string" == typeof n ? e.getSvgIcon(n, !0) : n.clone();
                      i && e(t).empty().append(i)
                  },
                  A = function() {
                      window.extOverview && window.extOverview(), window.extMarkers && window.extMarkers(), window.extEyedropper && window.extEyedropper(), window.extImagelib && window.extImagelib(), window.extGrid && window.extGrid(), window.extPanning && window.extPanning(), window.extStorage && window.extStorage(), window.extSwitch && window.extSwitch(), window.extValue && window.extValue(), window.extHtmlInput && window.extHtmlInput(), window.extHtmlChart && window.extHtmlChart(), window.extHtmlGraph && window.extHtmlGraph(), window.extHtmlSelect && window.extHtmlSelect(), window.extHtmlButton && window.extHtmlButton(), window.extGaugeProgress && window.extGaugeProgress(), window.extGaugeSemaphore && window.extGaugeSemaphore(), window.extHtmlBag && window.extHtmlBag(), window.extLinear && window.extLinear(), window.extPipe && window.extPipe(), window.extHtmlSlider && window.extHtmlSlider(), window.extHtmlSwitch && window.extHtmlSwitch(), window.extOwnCtrl && window.extOwnCtrl(), u.putLocale && u.putLocale(null, F)
                  },
                  T = function(e) {
                      m.load(curConfig.shapesPath, function() {
                          Object.values(u.shapesGrps).forEach(e => {
                              for (var t = 0; t < e.length; t++) u.shapesList.push(e[t])
                          }), window.extShapes && window.extShapes(), e && e()
                      })
                  };
              "file:" === document.location.protocol && setTimeout(A, 100), u.canvas = d = new e.SvgCanvas(document.getElementById("svgcanvas"), curConfig);
              var L, D, I, N, B = ["#FFFFFF", "#000000", "#333333", "#4D4D4D", "#666666", "#808080", "#999999", "#B3B3B3", "#CCCCCC", "#E6E6E6", "#ECECEC", "#F9F9F9", "#05285B", "#073984", "#094BAC", "#0B5CD5", "#0D6EFD", "#3485FD", "#5A9CFE", "#81B4FE", "#A8CBFE", "#250657", "#35087E", "#450BA5", "#560DCB", "#6610F2", "#7E36F4", "#975CF6", "#AF83F8", "#C8A9FA", "#281845", "#3A2264", "#4B2D83", "#5D37A2", "#6F42C1", "#8660CB", "#9D7ED5", "#B49DDF", "#CBBBE9", "#4D1230", "#6F1B45", "#92235A", "#B42B6F", "#D63384", "#DD5498", "#E374AB", "#EA95BF", "#F0B6D3", "#4F1319", "#721C24", "#96242F", "#B92D3A", "#DC3545", "#E25563", "#E77681", "#ED969E", "#F2B6BC", "#5B2D07", "#84420A", "#AC560E", "#D56A11", "#FD7E14", "#FD933A", "#FEA75F", "#FEBC85", "#FED1AA", "#5C4503", "#856404", "#AD8305", "#D6A206", "#FFC107", "#FFCB2F", "#FFD556", "#FFDF7E", "#FFE9A6", "#0E3C19", "#155724", "#1B722F", "#228C3A", "#28A745", "#4AB563", "#6DC381", "#8FD19E", "#B2DFBC", "#0C4836", "#11694F", "#168967", "#1BA97F", "#20C997", "#44D2A8", "#67DAB8", "#8BE3C9", "#AFECDA", "#083A42", "#0C5460", "#106E7D", "#13889B", "#17A2B8", "#3CB1C3", "#61C0CF", "#86CFDA", "#ABDEE5"],
                  O = svgedit.browser.isMac() ? "meta+" : "ctrl+",
                  U = d.pathActions,
                  R = d.undoMgr,
                  M = curConfig.imgPath + "logo.png",
                  G = e("#workarea"),
                  z = e("#cmenu_canvas"),
                  j = null,
                  H = "crosshair",
                  W = "crosshair",
                  V = "toolbars",
                  X = "",
                  Z = {
                      fill: null,
                      stroke: null
                  };
              (function() {
                  e("#dialog_container").draggable({
                      cancel: "#dialog_content, #dialog_buttons *",
                      containment: "window"
                  });
                  var t = e("#dialog_box"),
                      n = e("#dialog_buttons"),
                      o = e("#dialog_content"),
                      i = function(i, a, r, l, s, c, u) {
                          var d, f, p;
                          if (o.html("<p>" + a.replace(/\n/g, "</p><p>") + "</p>").toggleClass("prompt", "prompt" == i), n.empty(), d = e('<input type="button" value="' + uiStrings.common.ok + '">').appendTo(n), "alert" !== i && e('<input type="button" value="' + uiStrings.common.cancel + '">').appendTo(n).click(function() {
                                  t.hide(), r && r(!1)
                              }), "prompt" === i) f = e('<input type="text">').prependTo(n), f.val(l || ""), f.bind("keydown", "return", function() {
                              d.click()
                          });
                          else if ("select" === i) {
                              var g = e('<div style="text-align:center;">');
                              if (f = e("<select>").appendTo(g), u) {
                                  var v = e("<label>").text(u.label);
                                  p = e('<input type="checkbox">').appendTo(v), p.val(u.value), u.tooltip && v.attr("title", u.tooltip), p.prop("checked", !!u.checked), g.append(e("<div>").append(v))
                              }
                              e.each(s || [], function(t, n) {
                                  "object" == typeof n ? f.append(e("<option>").val(n.value).html(n.text)) : f.append(e("<option>").html(n))
                              }), o.append(g), l && f.val(l), c && f.bind("change", "return", c), f.bind("keydown", "return", function() {
                                  d.click()
                              })
                          } else "process" === i && d.hide();
                          t.show(), d.click(function() {
                              t.hide();
                              var e = "prompt" !== i && "select" !== i || f.val();
                              r && (p ? r(e, p.prop("checked")) : r(e))
                          }).focus(), "prompt" !== i && "select" !== i || f.focus()
                      };
                  e.alert = function(e, t) {
                      i("alert", e, t)
                  }, e.confirm = function(e, t) {
                      i("confirm", e, t)
                  }, e.process_cancel = function(e, t) {
                      i("process", e, t)
                  }, e.prompt = function(e, t, n) {
                      i("prompt", e, n, t)
                  }, e.select = function(e, t, n, o, a, r) {
                      i("select", e, n, a, t, o, r)
                  }
              })();
              var q, Q = function() {
                      var t = e(".tool_button_current");
                      t.length && "tool_select" !== t[0].id && (t.removeClass("tool_button_current").addClass("tool_button"), e("#tool_select").addClass("tool_button_current").removeClass("tool_button"), e("#styleoverrides").text("#svgcanvas svg *{cursor:move;pointer-events:all} #svgcanvas svg{cursor:default}")), d.setMode("select"), G.css("cursor", "auto")
                  },
                  K = null,
                  Y = !1,
                  J = !1,
                  $ = !1,
                  ee = !1,
                  te = !1,
                  ne = !1,
                  oe = !1,
                  ie = "",
                  ae = e("title:first").text(),
                  re = [];
              for (q = .1; q < 1e5; q *= 10) re.push(q), re.push(2 * q), re.push(5 * q);
              var le = function(e) {
                      var t, n = [],
                          o = d.getCurrentDrawing().getNumLayers();
                      for (t = 0; t < o; t++) n[t] = d.getCurrentDrawing().getLayerName(t);
                      if (e)
                          for (t = 0; t < o; ++t) n[t] != e && d.getCurrentDrawing().setLayerOpacity(n[t], .5);
                      else
                          for (t = 0; t < o; ++t) d.getCurrentDrawing().setLayerOpacity(n[t], 1)
                  },
                  se = function() {
                      d.clearSelection();
                      for (var t = e("#layerlist tbody").empty(), n = e("#selLayerNames").empty(), o = d.getCurrentDrawing(), i = o.getCurrentLayerName(), a = d.getCurrentDrawing().getNumLayers(), r = e.getSvgIcon("eye"); a--;) {
                          var l = o.getLayerName(a),
                              s = e('<tr class="layer">').toggleClass("layersel", l === i),
                              c = e('<td class="layervis">').toggleClass("layerinvis", !o.getLayerVisibility(l)),
                              u = e('<td class="layername">' + l + "</td>");
                          t.append(s.append(c, u)), n.append('<option value="' + l + '">' + l + "</option>")
                      }
                      if (void 0 !== r) {
                          var f = r.clone();
                          e("td.layervis", t).append(f), e.resizeSvgIcons({
                              "td.layervis .svg_icon": 14
                          })
                      }
                      e("#layerlist td.layername").mouseup(function(t) {
                          e("#layerlist tr.layer").removeClass("layersel"), e(this.parentNode).addClass("layersel"), d.setCurrentLayer(this.textContent), t.preventDefault()
                      }).mouseover(function() {
                          le(this.textContent)
                      }).mouseout(function() {
                          le()
                      }), e("#layerlist td.layervis").click(function() {
                          var t = e(this.parentNode).prevAll().length,
                              n = e("#layerlist tr.layer:eq(" + t + ") td.layername").text(),
                              o = e(this).hasClass("layerinvis");
                          d.setLayerVisibility(n, o), e(this).toggleClass("layerinvis")
                      });
                      for (var p = 5 - e("#layerlist tr.layer").size(); p-- > 0;) t.append('<tr><td style="color:white">_</td><td/></tr>')
                  },
                  ce = function(t, n) {
                      te || (te = !0, X = d.getSvgString(), e("#save_output_btns").toggle(!!n), e("#tool_source_back").toggle(!n), e("#svg_source_textarea").val(X), e("#svg_source_editor").fadeIn(), e("#svg_source_textarea").focus())
                  },
                  ue = function(t, n) {
                      e("#path_node_panel").toggle(t), e("#tools_bottom_2,#tools_bottom_3").toggle(!t), t ? (e(".tool_button_current").removeClass("tool_button_current").addClass("tool_button"), e("#tool_select").addClass("tool_button_current").removeClass("tool_button"), P("#tool_select", "select_node"), Y = !1, J = !1, n.length && (K = n[0])) : setTimeout(function() {
                          P("#tool_select", "select")
                      }, 1e3)
                  },
                  de = function(t, n) {
                      if (u.showSaveWarning = !1, n = '<?xml version="1.0"?>\n' + n, svgedit.browser.isIE()) ce(0, !0);
                      else {
                          var o = t.open("data:image/svg+xml;base64," + h.encode64(n)),
                              i = e.pref("save_notice_done");
                          if ("all" !== i) {
                              var a = uiStrings.notification.saveFromBrowser.replace("%s", "SVG");
                              svgedit.browser.isGecko() ? -1 !== n.indexOf("<defs") ? (a += "\n\n" + uiStrings.notification.defsFailOnSave, e.pref("save_notice_done", "all"), i = "all") : e.pref("save_notice_done", "part") : e.pref("save_notice_done", "all"), "part" !== i && o.alert(a)
                          }
                      }
                  },
                  fe = function(t, n) {
                      var o = n.issues,
                          i = n.exportWindowName;
                      i && (j = window.open("", i)), j.location.href = n.datauri;
                      var a = e.pref("export_notice_done");
                      if ("all" !== a) {
                          var r = uiStrings.notification.saveFromBrowser.replace("%s", n.type);
                          if (o.length) {
                              var l = "\n • ";
                              r += "\n\n" + uiStrings.notification.noteTheseIssues + l + o.join(l)
                          }
                          e.pref("export_notice_done", "all"), j.alert(r)
                      }
                  },
                  pe = function() {
                      window.opera && e("<p/>").hide().appendTo("body").remove()
                  },
                  ge = u.toolButtonClick = function(t, n) {
                      if (e(t).hasClass("disabled")) return !1;
                      if (e(t).parent().hasClass("tools_flyout")) return !0;
                      var o = "normal";
                      return n || e(".tools_flyout").fadeOut(o), e("#styleoverrides").text(""), G.css("cursor", "auto"), e(".tool_button_current").removeClass("tool_button_current").addClass("tool_button"), e(t).addClass("tool_button_current").removeClass("tool_button"), !0
                  },
                  ve = u.clickSelect = function() {
                      ge("#tool_select") && (d.setMode("select"), e("#styleoverrides").text("#svgcanvas svg *{cursor:move;pointer-events:all}, #svgcanvas svg{cursor:default}"))
                  },
                  he = u.setImageURL = function(t) {
                      t || (t = M), d.setImageURL(t), e("#image_url").val(t), 0 === t.indexOf("data:") ? (e("#image_url").hide(), e("#change_image_url").hide()) : (d.embedImage(t, function(n) {
                          e("#url_notice").toggle(!n), M = t
                      }), e("#image_url").hide(), e("#change_image_url").hide())
                  };
              u.promptImgURLcallback = null;
              var me = u.updateCanvas = function(t, n) {
                      var o = G.width(),
                          i = G.height(),
                          a = o,
                          r = i,
                          l = d.getZoom(),
                          c = G,
                          p = e("#svgcanvas"),
                          g = {
                              x: c[0].scrollLeft + a / 2,
                              y: c[0].scrollTop + r / 2
                          },
                          v = curConfig.canvas_expansion;
                      o = Math.max(a, d.contentW * l * v), i = Math.max(r, d.contentH * l * v), o == a && i == r ? G.css("overflow", "hidden") : G.css("overflow", "scroll");
                      var h = p.height() / 2,
                          m = p.width() / 2;
                      p.width(o).height(i);
                      var _ = i / 2,
                          w = o / 2,
                          y = d.updateCanvas(o, i),
                          b = w / m,
                          C = o / 2 - a / 2,
                          x = i / 2 - r / 2;
                      if (n) n.x += y.x, n.y += y.y;
                      else {
                          var k = g.x - m,
                              S = w + k * b,
                              E = g.y - h,
                              F = _ + E * b;
                          n = {
                              x: S,
                              y: F
                          }
                      }
                      t ? d.contentW > c.width() ? (G[0].scrollLeft = y.x - 10, G[0].scrollTop = y.y - 10) : (c[0].scrollLeft = C, c[0].scrollTop = x) : (c[0].scrollLeft = n.x - a / 2, c[0].scrollTop = n.y - r / 2), curConfig.showRulers && (s(p, l), G.scroll()), !0 === f.storagePrompt || u.storagePromptClosed || e("#dialog_box").hide()
                  },
                  _e = function() {
                      var t, n, o = "none" == d.getColor("fill"),
                          i = "none" == d.getColor("stroke"),
                          a = ["#tool_fhpath", "#tool_line"],
                          r = ["#tools_rect .tool_button", "#tools_ellipse .tool_button", "#tool_text", "#tool_path"];
                      if (i)
                          for (t in a) n = a[t], e(n).hasClass("tool_button_current") && ve(), e(n).addClass("disabled");
                      else
                          for (t in a) n = a[t], e(n).removeClass("disabled");
                      if (i && o)
                          for (t in r) n = r[t], e(n).hasClass("tool_button_current") && ve(), e(n).addClass("disabled");
                      else
                          for (t in r) n = r[t], e(n).removeClass("disabled");
                      d.runExtensions("toolButtonStateUpdate", {
                          nofill: o,
                          nostroke: i
                      }), e(".tools_flyout").each(function() {
                          var t = e("#" + this.id + "_show"),
                              n = !1;
                          e(this).children().each(function() {
                              e(this).hasClass("disabled") || (n = !0)
                          }), t.toggleClass("disabled", !n)
                      }), pe()
                  },
                  we = function() {
                      var t, n;
                      if (null != K) switch (K.tagName) {
                          case "use":
                          case "image":
                          case "foreignObject":
                              break;
                          case "g":
                          case "a":
                              var o = null,
                                  a = K.getElementsByTagName("*");
                              for (t = 0, n = a.length; t < n; t++) {
                                  var r = a[t].getAttribute("stroke-width");
                                  0 === t ? o = r : o !== r && (o = null)
                              }
                              e("#stroke_width").val(null === o ? "1" : o), Z.fill.update(!0);
                              break;
                          default:
                              Z.fill.update(!0), Z.stroke.update(!0);
                              var l = K.getAttribute("stroke-width");
                              e("#stroke_width").val(null === l || "null" === l ? "1" : l), e("#stroke_style").val(K.getAttribute("stroke-dasharray") || "none");
                              var s = K.getAttribute("stroke-linejoin") || "miter";
                              0 != e("#linejoin_" + s).length && i(e("#linejoin_" + s)[0]), s = K.getAttribute("stroke-linecap") || "butt", 0 != e("#linecap_" + s).length && i(e("#linecap_" + s)[0])
                      }
                      if (null != K) {
                          var c = 100 * (K.getAttribute("opacity") || 1);
                          e("#group_opacity").val(c), e("#opac_slider").slider("option", "value", c), e("#elem_id").val(K.id), e("#elem_class").val(K.getAttribute("class"))
                      }
                      _e()
                  },
                  ye = function() {
                      var t = K;
                      null == t || t.parentNode || (t = null);
                      var n = d.getCurrentDrawing().getCurrentLayerName(),
                          o = d.getMode(),
                          i = "px" !== curConfig.baseUnit ? curConfig.baseUnit : null,
                          a = "pathedit" == o,
                          r = e("#cmenu_canvas li");
                      if (e("#selected_panel, #multiselected_panel, #threemoreselected_panel, #g_panel, #rect_panel, #circle_panel,#ellipse_panel, #line_panel, #text_panel, #image_panel, #container_panel, #use_panel, #a_panel, #xy_panel, #marker_panel, #htmlctrl_panel, #tool_stroke, #tool_angle, #shape_panel").hide(), $ || ee || a || e("#tool_stroke").show(), null != t) {
                          var s = t.nodeName;
                          e("#tool_angle").show();
                          var c = d.getRotationAngle(t);
                          e("#angle").val(c);
                          var f = d.getBlur(t);
                          if (e("#blur").val(f), e("#blur_slider").slider("option", "value", f), d.addedNew && "image" === s && 0 !== d.getHref(t).indexOf("data:") && l(), a || "pathedit" == o) {
                              var v = U.getNodePoint();
                              if (e("#tool_add_subpath").removeClass("push_button_pressed").addClass("tool_button"), e("#tool_node_delete").toggleClass("disabled", !U.canDeleteNodes), P("#tool_openclose_path", U.closed_subpath ? "open_path" : "close_path"), v) {
                                  var h = e("#seg_type");
                                  i && (v.x = svgedit.units.convertUnit(v.x), v.y = svgedit.units.convertUnit(v.y)), e("#path_node_x").val(v.x), e("#path_node_y").val(v.y), v.type ? h.val(v.type).removeAttr("disabled") : h.val(4).attr("disabled", "disabled")
                              }
                              return
                          }
                          if (e("#selected_panel").show(), ["line", "circle", "ellipse"].indexOf(s) >= 0) e("#xy_panel").hide();
                          else {
                              var m, _;
                              if (["g", "polyline", "path"].indexOf(s) >= 0) {
                                  var w = d.getStrokedBBox([t]);
                                  w && (m = w.x, _ = w.y)
                              } else m = t.getAttribute("x"), _ = t.getAttribute("y");
                              if (i && (m = svgedit.units.convertUnit(m), _ = svgedit.units.convertUnit(_)), t.getAttribute("width"), t.getAttribute("heght"), m = Number.parseFloat(m), m = m.toFixed(Number.isInteger(m) ? 0 : 2), _ = Number.parseFloat(_), _ = _.toFixed(Number.isInteger(_) ? 0 : 2), e("#selected_x").val(m || 0), e("#selected_y").val(_ || 0), e("#xy_panel").show(), g.indexOf(t.id.substr(0, 4)) >= 0) {
                                  var y = svgedit.utilities.getBBox(t);
                                  e("#htmlctrl_panel").show(), e("#htmlctrl_width").val(y.width || 0), e("#htmlctrl_height").val(y.height || 0)
                              }
                          }
                          var b = -1 == ["image", "text", "path", "g", "use"].indexOf(s);
                          e("#tool_topath").toggle(b), e("#tool_reorient").toggle("path" === s), e("#tool_reorient").toggleClass("disabled", 0 === c);
                          var C = {
                                  g: [],
                                  a: [],
                                  rect: ["rx", "width", "height"],
                                  image: ["width", "height"],
                                  circle: ["cx", "cy", "r"],
                                  ellipse: ["cx", "cy", "rx", "ry"],
                                  line: ["x1", "y1", "x2", "y2"],
                                  text: [],
                                  use: []
                              },
                              x = t.tagName,
                              k = null;
                          "a" === x && (k = d.getHref(t), e("#g_panel").show()), "a" === t.parentNode.tagName && (e(t).siblings().length || (e("#a_panel").show(), k = d.getHref(t.parentNode))), e("#tool_make_link, #tool_make_link").toggle(!k), k && e("#link_url").val(k);
                          var S = !1;
                          if (C[x]) {
                              var E = C[x],
                                  F = t.getAttribute("type");
                              F && 0 === F.indexOf("svg-ext") ? "svg-ext-shapes-group" !== F && (S = !0) : e("#" + x + "_panel").show(), e.each(E, function(n, o) {
                                  var i = t.getAttribute(o);
                                  if ("px" !== curConfig.baseUnit && t[o]) {
                                      var a = t[o].baseVal.value;
                                      i = svgedit.units.convertUnit(a)
                                  }
                                  e("#" + x + "_" + o).val(i || 0)
                              });
                              var A = "g" === x && p.indexOf(t.id.substr(0, 4)) >= 0;
                              if ("text" == x || A) {
                                  if (e("#text_panel").css("display", "inline"), d.getItalic() ? e("#tool_italic").addClass("push_button_pressed").removeClass("tool_button") : e("#tool_italic").removeClass("push_button_pressed").addClass("tool_button"), d.getBold() ? e("#tool_bold").addClass("push_button_pressed").removeClass("tool_button") : e("#tool_bold").removeClass("push_button_pressed").addClass("tool_button"), e("#font_family").val(t.getAttribute("font-family")), e("#font_size").val(t.getAttribute("font-size")), e("#text_anchor").val(t.getAttribute("text-anchor")), A) {
                                      var T = d.getExtensionFont(t);
                                      T && (T.fontFamily && e("#font_family").val(T.fontFamily), T.fontSize && e("#font_size").val(T.fontSize.replace("px", "")), T.textAnchor && e("#text_anchor").val(T.textAnchor))
                                  }
                                  e("#text").val(t.textContent), d.addedNew && !A && setTimeout(function() {
                                      e("#text").focus().select()
                                  }, 100)
                              } else "image" == x ? he(d.getHref(t)) : "g" === x || "use" === x ? (e("#container_panel").show(), d.getTitle()) : "line" === x && e("#marker_panel").show()
                          }
                          r[("g" === x ? "en" : "dis") + "ableContextMenuItems"]("#ungroup"), r[("g" !== x && Y ? "en" : "dis") + "ableContextMenuItems"]("#group"), S && r.disableContextMenuItems("#ungroup"), "svg-ext-shapes-group" === t.getAttribute("type") && e("#g_panel").show()
                      } else Y ? (e("#multiselected_panel").show(), r.enableContextMenuItems("#group").disableContextMenuItems("#ungroup"), J && e("#threemoreselected_panel").show()) : r.disableContextMenuItems("#interactivity,#editBindOfTags,#delete,#cut,#copy,#group,#ungroup,#move_front,#move_up,#move_down,#move_back");
                      !$ && !ee || Y || (r.disableContextMenuItems("#ungroup"), e("#g_panel").hide()), e("#tool_undo").toggleClass("disabled", 0 === R.getUndoStackSize()), e("#tool_redo").toggleClass("disabled", 0 === R.getRedoStackSize()), d.addedNew = !1, t && !a || Y ? (e("#selLayerNames").removeAttr("disabled").val(n), z.enableContextMenuItems("#delete,#deselect,#cut,#copy,#move_front,#move_up,#move_down,#move_back")) : e("#selLayerNames").attr("disabled", "disabled"), r.disableContextMenuItems("#interactivity,#editBindOfTags"), t && !Y && (F = t.getAttribute("type"), (F && F.startsWith("svg-ext-") || u.baseSvgTags.indexOf(t.tagName) > -1) && r.enableContextMenuItems("#interactivity,#editBindOfTags"))
                  },
                  be = function() {
                      if (!L) {
                          var t = "#workarea.wireframe #svgcontent * { stroke-width: " + 1 / d.getZoom() + "px; }";
                          e("#wireframe_rules").text(G.hasClass("wireframe") ? t : "")
                      }
                  },
                  Ce = function(t) {
                      t = t || d.getDocumentTitle();
                      var n = ae + (t ? ": " + t : "");
                      e("title:first").text(n)
                  },
                  xe = function(e, t) {
                      u.onGaugeAdded && u.onGaugeAdded(t)
                  },
                  ke = function(e, t) {
                      u.onGaugeResized && u.onGaugeResized(t)
                  },
                  Se = function(e, t) {
                      u.onGaugeCopyPaste && u.onGaugeCopyPaste(t)
                  },
                  Ee = function(t, n) {
                      var o = d.getMode();
                      "select" === o && Q();
                      var i = "pathedit" == o;
                      K = 1 === n.length || null == n[1] ? n[0] : null, Y = n.length >= 2 && null != n[1], J = n.length >= 3 && null != n[2], $ = !1, ee = !1;
                      for (var a = 0; a < n.length; a++) n[a] && n[a].id && (0 === n[a].id.indexOf("HX") ? $ = !0 : 0 === n[a].id.indexOf("PIE") && (ee = !0));
                      null != K && (i || ee || we()), ue(i, n), ye(), d.runExtensions("selectedChanged", {
                          elems: n,
                          selectedElement: K,
                          multiselected: Y
                      }), ee && e("#marker_panel").hide();
                      var r = [];
                      if (Y) {
                          for (a = 0; a < n.length; a++) n[a] && r.push({
                              id: n[a].id,
                              type: n[a].getAttribute("type")
                          });
                          u.onSelectedElement(r)
                      } else K ? (r.push({
                          id: K.id,
                          type: K.getAttribute("type")
                      }), u.onSelectedElement(r)) : u.onSelectedElement(null)
                  },
                  Fe = function(t, n) {
                      var o = d.getMode(),
                          i = n[0];
                      if (i) {
                          if (Y = n.length >= 2 && null != n[1], J = n.length >= 3 && null != n[2], !Y) switch (o) {
                              case "rotate":
                                  var a = d.getRotationAngle(i);
                                  e("#angle").val(a), e("#tool_reorient").toggleClass("disabled", 0 === a)
                          }
                          d.runExtensions("elementTransition", {
                              elems: n
                          })
                      }
                  },
                  Pe = function(e, t) {
                      var n, o = d.getMode();
                      for ("select" === o && Q(), n = 0; n < t.length; ++n) {
                          var i = t[n];
                          i && "svg" === i.tagName ? (se(), me()) : i && K && null == K.parentNode && (K = i)
                      }
                      u.showSaveWarning = !0, ye(), K && "select" === o && (Z.fill.update(), Z.stroke.update()), d.runExtensions("elementChanged", {
                          elems: t
                      })
                  },
                  Ae = function() {
                      be()
                  },
                  Te = d.zoomChanged = function(t, n, o) {
                      var i = 0,
                          a = G,
                          r = d.setBBoxZoom(n, a.width() - i, a.height() - i);
                      if (r) {
                          var l = r.zoom,
                              s = r.bbox;
                          l < .001 ? D({
                              value: .1
                          }) : (e("#zoom").val((100 * l).toFixed(1)), o ? me() : me(!1, {
                              x: s.x * l + s.width * l / 2,
                              y: s.y * l + s.height * l / 2
                          }), "zoom" == d.getMode() && s.width && Q(), Ae())
                      }
                  },
                  Le = d.myZoomed = function(t, n) {
                      const o = 0;
                      w_area = G;
                      var i = d.setBBoxZoom(n.bbox, w_area.width() - o, w_area.height() - o);
                      if (i) {
                          var a = i.zoom;
                          a < .001 ? D({
                              value: .1
                          }) : (e("#zoom").val((100 * a).toFixed(1)), n.center ? me() : me(!1, n.bbox), Ae())
                      }
                  };
              D = function(e) {
                  var t = e.value / 100;
                  if (t < .001) e.value = .1;
                  else {
                      var n = d.getZoom(),
                          o = G;
                      Te(window, {
                          width: 0,
                          height: 0,
                          x: (o[0].scrollLeft + o.width() / 2) / n,
                          y: (o[0].scrollTop + o.height() / 2) / n,
                          zoom: t
                      }, !0)
                  }
              }, e("#cur_context_panel").delegate("a", "click", function() {
                  var t = e(this);
                  return t.attr("data-root") ? d.leaveContext() : d.setContext(t.text()), d.clearSelection(), !1
              });
              var De = function(t, n) {
                      var o = "";
                      if (n) {
                          var i = "";
                          o = '<a href="#" data-root="y">' + d.getCurrentDrawing().getCurrentLayerName() + "</a>", e(n).parentsUntil("#svgcontent > g").andSelf().each(function() {
                              this.id && (i += " > " + this.id, o += this !== n ? ' > <a href="#">' + this.id + "</a>" : " > " + this.id)
                          }), ie = i
                      } else ie = null;
                      e("#cur_context_panel").toggle(!!n).html(o), Ce()
                  },
                  Ie = function() {
                      Z.fill.prep(), Z.stroke.prep()
                  },
                  Ne = {},
                  Be = function() {
                      e(".tools_flyout").each(function() {
                          var t = e("#" + this.id + "_show");
                          if (!t.data("isLibrary")) {
                              var n = [];
                              e(this).children().each(function() {
                                  n.push(this.title)
                              }), t[0] && (t[0].title = n.join(" / "))
                          }
                      })
                  },
                  Oe = function() {
                      e(".tools_flyout").each(function() {
                          var t = e("#" + this.id + "_show"),
                              n = t.offset(),
                              o = t.outerWidth();
                          n && e(this).css({
                              left: (n.left + o) * u.tool_scale,
                              top: n.top
                          })
                      })
                  },
                  Ue = function(t) {
                      e.each(t, function(n, o) {
                          var i, a = e(n).children(),
                              r = n + "_show",
                              l = e(r),
                              s = !1;
                          a.addClass("tool_button").unbind("click mousedown mouseup").each(function(n) {
                              var i = o[n];
                              Ne[i.sel] = i.fn, i.isDefault && (s = n);
                              var a = function(n) {
                                  var o, a = i;
                                  if ("keydown" === n.type) {
                                      var s = e(a.parent + "_show").hasClass("tool_button_current"),
                                          c = e(a.parent + "_show").attr("data-curopt");
                                      e.each(t[i.parent], function(e, o) {
                                          o.sel == c && (a = n.shiftKey && s ? t[i.parent][e + 1] || t[i.parent][0] : o)
                                      })
                                  }
                                  if (e(this).hasClass("disabled")) return !1;
                                  ge(r) && a.fn(), o = a.icon ? e.getSvgIcon(a.icon, !0) : e(a.sel).children().eq(0).clone(), o[0].setAttribute("width", l.width()), o[0].setAttribute("height", l.height()), l.children(":not(.flyout_arrow_horiz)").remove(), l.append(o).attr("data-curopt", a.sel)
                              };
                              e(this).mouseup(a), i.key && e(document).bind("keydown", i.key[0] + " shift+" + i.key[0], a)
                          }), s ? l.attr("data-curopt", o[s].sel) : l.attr("data-curopt") || l.attr("data-curopt", o[0].sel);
                          var c = e(r).position();
                          l.mousedown(function(t) {
                              if (l.hasClass("disabled")) return !1;
                              var o = e(n),
                                  a = c.left + 34,
                                  r = -1 * o.width(),
                                  s = o.data("shown_popop") ? 200 : 0;
                              i = setTimeout(function() {
                                  l.data("isLibrary") ? o.css("left", a).show() : o.css("left", r).show().animate({
                                      left: a
                                  }, 150), o.data("shown_popop", !0)
                              }, s), t.preventDefault()
                          }).mouseup(function(t) {
                              clearTimeout(i);
                              var n = e(this).attr("data-curopt");
                              l.data("isLibrary") && e(r.replace("_show", "")).is(":visible") ? ge(r, !0) : ge(r) && Ne[n] && Ne[n]()
                          })
                      }), Be(), Oe()
                  },
                  Re = function(t, n) {
                      var o = e("<div>", {
                          class: "tools_flyout",
                          id: t
                      }).appendTo("#svg_editor").append(n);
                      return o
                  },
                  Me = function() {
                      var e, t = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
                          n = document.getElementsByTagName("script")[0];
                      for (e in n.style)
                          if (t.test(e)) return e.match(t)[0];
                      return "WebkitOpacity" in n.style ? "Webkit" : "KhtmlOpacity" in n.style ? "Khtml" : ""
                  }(),
                  Ge = function(t, n) {
                      var o = ["top", "left", "bottom", "right"];
                      t.each(function() {
                          var t, i = e(this),
                              a = i.outerWidth() * (n - 1),
                              r = i.outerHeight() * (n - 1);
                          for (t = 0; t < 4; t++) {
                              var l = o[t],
                                  s = i.data("orig_margin-" + l);
                              null == s && (s = parseInt(i.css("margin-" + l), 10), i.data("orig_margin-" + l, s));
                              var c = s * n;
                              "right" === l ? c += a : "bottom" === l && (c += r), i.css("margin-" + l, c)
                          }
                      })
                  },
                  ze = u.setIconSize = function(t) {
                      var n = "#tools_top .toolset, #editor_panel > *, #history_panel > *,\t\t\t\t#main_button, #tools_left > *, #path_node_panel > *, #multiselected_panel > *,\t\t\t\t#g_panel > *, #tool_font_size > *, .tools_flyout",
                          o = e(n),
                          i = 1;
                      if ("number" == typeof t) i = t;
                      else {
                          var a = {
                              s: .75,
                              m: 1,
                              l: 1.25,
                              xl: 1.5
                          };
                          i = a[t]
                      }
                      u.tool_scale = i, Oe();
                      var r = o.parents(":hidden");
                      r.css("visibility", "hidden").show(), Ge(o, i), r.css("visibility", "visible").hide(), e.pref("iconsize", t), e("#iconsize").val(t);
                      var l = {
                              "#tools_top": {
                                  left: 50 + e("#main_button").width(),
                                  height: 72
                              },
                              "#tools_left": {
                                  width: 31,
                                  top: 74
                              },
                              "div#workarea": {
                                  left: 38,
                                  top: 74
                              }
                          },
                          s = e("#tool_size_rules");
                      if (s.length ? s.empty() : s = e('<style id="tool_size_rules"></style>').appendTo("head"), "m" !== t) {
                          var c = "";
                          e.each(l, function(n, o) {
                              n = "#svg_editor " + n.replace(/,/g, ", #svg_editor"), c += n + "{", e.each(o, function(e, n) {
                                  var o;
                                  "number" == typeof n ? o = n * i + "px" : (n[t] || n.all) && (o = n[t] || n.all), c += e + ":" + o + ";"
                              }), c += "}"
                          });
                          var d = "-" + Me.toLowerCase() + "-";
                          c += n + "{" + d + "transform: scale(" + i + ");} #svg_editor div.toolset .toolset {" + d + "transform: scale(1); margin: 1px !important;} #svg_editor .ui-slider {" + d + "transform: scale(" + 1 / i + ");}", s.text(c)
                      }
                      Oe()
                  },
                  je = function(t, n, o, i) {
                      var a = e(t);
                      n = e(n);
                      var r = !1,
                          l = i.dropUp;
                      l && e(t).addClass("dropup"), n.find("li").bind("mouseup", function() {
                          i.seticon && (P("#cur_" + a[0].id, e(this).children()), e(this).addClass("current").siblings().removeClass("current")), o.apply(this, arguments)
                      }), e(window).mouseup(function(e) {
                          r || (a.removeClass("down"), n.hide(), n.css({
                              top: 0,
                              left: 0
                          })), r = !1
                      }), a.bind("mousedown", function() {
                          var e = a.offset();
                          l ? (e.top -= n.height(), e.left += 8) : e.top += a.height(), n.offset(e), a.hasClass("down") ? (n.hide(), n.css({
                              top: 0,
                              left: 0
                          })) : (n.show(), r = !0), a.toggleClass("down")
                      }).hover(function() {
                          r = !0
                      }).mouseout(function() {
                          r = !1
                      }), i.multiclick && n.mousedown(function() {
                          r = !0
                      })
                  },
                  He = [],
                  We = function(t, n) {
                      if (n) {
                          var o = !1,
                              i = !0;
                          if (n.langReady)
                              if (u.langChanged) {
                                  var a = e.pref("lang");
                                  n.langReady({
                                      lang: a,
                                      uiStrings: uiStrings
                                  })
                              } else He.push(n);
                          var r = function() {
                                  n.callback && !o && i && (o = !0, n.callback())
                              },
                              l = [];
                          n.context_tools && e.each(n.context_tools, function(t, n) {
                              var o, i = n.container_id ? ' id="' + n.container_id + '"' : "",
                                  a = e("#" + n.panel);
                              switch (a.length || (a = e("<div>", {
                                      id: n.panel
                                  }).appendTo("#tools_top")), n.type) {
                                  case "tool_button":
                                      o = '<div class="tool_button">' + n.id + "</div>";
                                      var r = e(o).appendTo(a);
                                      n.events && e.each(n.events, function(t, n) {
                                          e(r).bind(t, n)
                                      });
                                      break;
                                  case "select":
                                      o = "<label" + i + '><select id="' + n.id + '">', e.each(n.options, function(e, t) {
                                          var i = e == n.defval ? " selected" : "";
                                          o += '<option value="' + e + '"' + i + ">" + t + "</option>"
                                      }), o += "</select></label>";
                                      var s = e(o).appendTo(a).find("select");
                                      e.each(n.events, function(t, n) {
                                          e(s).bind(t, n)
                                      });
                                      break;
                                  case "button-select":
                                      o = '<div id="' + n.id + '" class="dropdown toolset" title="' + n.title + '"><div id="cur_' + n.id + '" class="icon_label"></div><button></button></div>';
                                      var c = e('<ul id="' + n.id + '_opts"></ul>').appendTo("#option_lists");
                                      n.colnum && c.addClass("optcols" + n.colnum), e(o).appendTo(a).children(), l.push({
                                          elem: "#" + n.id,
                                          list: "#" + n.id + "_opts",
                                          title: n.title,
                                          callback: n.events.change,
                                          cur: "#cur_" + n.id
                                      });
                                      break;
                                  case "input":
                                      o = "<label" + i + '><span id="' + n.id + '_label">' + n.label + ':</span><input id="' + n.id + '" title="' + n.title + '" size="' + (n.size || "4") + '" value="' + (n.defval || "") + '" type="text"/></label>';
                                      var u = e(o).appendTo(a).find("input");
                                      n.spindata && u.SpinButton(n.spindata), n.events && e.each(n.events, function(e, t) {
                                          u.bind(e, t)
                                      })
                              }
                          }), n.mySetMarker && (u.setMarker = n.mySetMarker), r()
                      }
                  },
                  Ve = function(t, n, o) {
                      var i = {
                          alpha: n
                      };
                      if (0 === t.indexOf("url(#")) {
                          var a = d.getRefElem(t);
                          a = a ? a.cloneNode(!0) : e("#" + o + "_color defs *")[0], i[a.tagName] = a
                      } else 0 === t.indexOf("#") ? i.solidColor = t.substr(1) : i.solidColor = "none";
                      return new e.jGraduate.Paint(i)
                  };
              e("#text").focus(function() {}), e("#text").blur(function() {}), d.bind("onGaugeAdded", xe), d.bind("onGaugeResized", ke), d.bind("onGaugeCopyPaste", Se), d.bind("selected", Ee), d.bind("transition", Fe), d.bind("changed", Pe), d.bind("saved", de), d.bind("exported", fe), d.bind("exportedPDF", function(e, t) {
                  var n = t.exportWindowName;
                  n && (j = window.open("", n)), j.location.href = t.dataurlstring
              }), d.bind("zoomed", Te), d.bind("myZoomed", Le), d.bind("contextset", De), d.bind("extension_added", We), d.textActions.setInputElem(e("#text")[0]);
              var Xe = '<div class="palette_item" style="background-color:#FFF;color:red;font-size:20px;line-height: 15px;text-align:center;" data-rgb="none">X</div>';
              e.each(B, function(e, t) {
                  Xe += '<div class="palette_item" style="background-color: ' + t + ';" data-rgb="' + t + '"></div>'
              }), e("#palette").append(Xe);
              var Ze = ["#FFF", "#888", "#000"];
              Xe = "", e.each(Ze, function() {
                  Xe += '<div class="color_block" style="background-color:' + this + ';"></div>'
              }), e("#bg_blocks").append(Xe);
              var qe = e("#bg_blocks div"),
                  Qe = "cur_background";
              qe.each(function() {
                  var t = e(this);
                  t.click(function() {
                      qe.removeClass(Qe), e(this).addClass(Qe)
                  })
              }), r(e.pref("bkgd_color"), e.pref("bkgd_url")), e("#image_save_opts input").val([e.pref("img_save")]);
              var Ke = function(e) {
                      d.setRectRadius(e.value)
                  },
                  Ye = function(e) {
                      d.setFontSize(e.value)
                  },
                  Je = function(e) {
                      var t = e.value;
                      0 == t && K && ["line", "polyline"].indexOf(K.nodeName) >= 0 && (t = e.value = 1), d.setStrokeWidth(t)
                  },
                  $e = function(t) {
                      d.setRotationAngle(t.value), e("#tool_reorient").toggleClass("disabled", 0 === parseInt(t.value, 10))
                  },
                  et = function(t, n) {
                      null == n && (n = t.value), e("#group_opacity").val(n), t && t.handle || e("#opac_slider").slider("option", "value", n), d.setOpacity(n / 100)
                  },
                  tt = function(t, n, o) {
                      null == n && (n = t.value), e("#blur").val(n);
                      var i = !1;
                      t && t.handle || (e("#blur_slider").slider("option", "value", n), i = !0), o ? d.setBlurNoUndo(n) : d.setBlur(n, i)
                  };
              e("#stroke_style").change(function() {
                  d.setStrokeAttr("stroke-dasharray", e(this).val()), pe()
              }), e("#stroke_linejoin").change(function() {
                  d.setStrokeAttr("stroke-linejoin", e(this).val()), pe()
              }), e("select").change(function() {
                  e(this).blur()
              });
              var nt = !1;
              e("#selLayerNames").change(function() {
                      var t = this.options[this.selectedIndex].value,
                          n = uiStrings.notification.QmoveElemsToLayer.replace("%s", t),
                          o = function(e) {
                              e && (nt = !0, d.moveSelectedToLayer(t), d.clearSelection(), se())
                          };
                      t && (nt ? o(!0) : e.confirm(n, o))
                  }), e("#font_family").change(function() {
                      d.setFontFamily(this.value)
                  }), e("#seg_type").change(function() {
                      d.setSegType(e(this).val())
                  }), e("#text").keyup(function() {
                      d.setTextContent(this.value)
                  }), e("#image_url").change(function() {
                      he(this.value)
                  }), e("#link_url").change(function() {
                      this.value.length ? d.setLinkURL(this.value) : d.removeHyperlink()
                  }), e("#g_title").change(function() {
                      d.setGroupTitle(this.value)
                  }), e(".attr_changer").change(function() {
                      var t = this.getAttribute("data-attr"),
                          n = this.value,
                          o = svgedit.units.isValidUnit(t, n, K);
                      if (!o) return e.alert(uiStrings.notification.invalidAttrValGiven), this.value = K.getAttribute(t), !1;
                      if ("id" !== t && "class" !== t)
                          if (isNaN(n)) n = d.convertToNum(t, n);
                          else if ("px" !== curConfig.baseUnit) {
                          var i = svgedit.units.getTypeMap();
                          (K[t] || "pathedit" === d.getMode() || "x" === t || "y" === t) && (n *= i[curConfig.baseUnit])
                      }
                      if ("id" === t) {
                          var a = K;
                          d.clearSelection(), a.id = n, d.addToSelection([a], !0)
                      } else d.changeSelectedAttribute(t, n), a = K, d.clearSelection(), d.addToSelection([a], !0);
                      this.blur()
                  }), e("#palette").mouseover(function() {
                      var t = e('<input type="hidden">');
                      e(this).append(t), t.focus().remove()
                  }), e(".palette_item").mousedown(function(t) {
                      var n, o = t.shiftKey || 2 === t.button ? "stroke" : "fill",
                          i = e(this).data("rgb");
                      "none" === i || "transparent" === i || "initial" === i ? (i = "none", n = new e.jGraduate.Paint) : n = new e.jGraduate.Paint({
                          alpha: 100,
                          solidColor: i.substr(1)
                      }), Z[o].setPaint(n), d.setColor(o, i), "none" !== i && 1 !== d.getPaintOpacity(o) && d.setPaintOpacity(o, 1), u.changeColor && u.changeColor(o, i), _e()
                  }).bind("contextmenu", function(e) {
                      e.preventDefault()
                  }), e("#toggle_stroke_tools").on("click", function() {
                      e("#tools_bottom").toggleClass("expanded")
                  }),
                  function() {
                      var t = null,
                          n = null,
                          o = G[0],
                          i = !1,
                          a = !1;
                      e("#svgcanvas").bind("mousemove mouseup", function(e) {
                          if (!1 !== i) return o.scrollLeft -= e.clientX - t, o.scrollTop -= e.clientY - n, t = e.clientX, n = e.clientY, "mouseup" === e.type && (i = !1), !1
                      }).mousedown(function(e) {
                          if (1 === e.button || !0 === a) return i = !0, t = e.clientX, n = e.clientY, !1
                      }), e(window).mouseup(function() {
                          i = !1
                      }), e(document).bind("keydown", "space", function(e) {
                          d.spaceKey = a = !0, e.preventDefault()
                      }).bind("keyup", "space", function(e) {
                          e.preventDefault(), d.spaceKey = a = !1
                      }).bind("keydown", "shift", function(e) {
                          "zoom" === d.getMode() && G.css("cursor", W)
                      }).bind("keyup", "shift", function(e) {
                          "zoom" === d.getMode() && G.css("cursor", H)
                      }), u.setPanning = function(e) {
                          d.spaceKey = a = e
                      }
                  }(),
                  function() {
                      var t = e("#main_icon"),
                          n = e("#main_icon span"),
                          o = e("#main_menu"),
                          i = !1,
                          a = 0,
                          r = !0,
                          l = !1;
                      e(window).mouseup(function(n) {
                          i || (t.removeClass("buttondown"), "INPUT" != n.target.tagName ? o.fadeOut(200) : l || (l = !0, e(n.target).click(function() {
                              o.css("margin-left", "-9999px").show()
                          }))), i = !1
                      }).mousedown(function(t) {
                          var n = e(t.target).closest("div.tools_flyout, .contextMenu").length;
                          n || e(".tools_flyout:visible,.contextMenu").fadeOut(250)
                      }), n.bind("mousedown", function() {
                          t.hasClass("buttondown") ? o.fadeOut(200) : (o.css("margin-left", 0).show(), a || (a = o.height()), o.css("height", 0).animate({
                              height: a
                          }, 200), i = !0), t.toggleClass("buttondown buttonup")
                      }).hover(function() {
                          i = !0
                      }).mouseout(function() {
                          i = !1
                      });
                      var s = e("#main_menu li");
                      s.mouseover(function() {
                          r = "rgba(0, 0, 0, 0)" == e(this).css("background-color"), s.unbind("mouseover"), r && s.mouseover(function() {
                              this.style.backgroundColor = "#FFC"
                          }).mouseout(function() {
                              return this.style.backgroundColor = "transparent", !0
                          })
                      })
                  }(), u.addDropDown = function(t, n, o) {
                      if (0 != e(t).length) {
                          var i = e(t).find("button"),
                              a = e(t).find("ul").attr("id", e(t)[0].id + "-list"),
                              r = !1;
                          o ? e(t).addClass("dropup") : e("#option_lists").append(a), a.find("li").bind("mouseup", n), e(window).mouseup(function(e) {
                              r || (i.removeClass("down"), a.hide()), r = !1
                          }), i.bind("mousedown", function() {
                              if (i.hasClass("down")) a.hide();
                              else {
                                  if (!o) {
                                      var n = e(t).position();
                                      a.css({
                                          top: n.top + 24,
                                          left: n.left - 10
                                      })
                                  }
                                  a.show(), r = !0
                              }
                              i.toggleClass("down")
                          }).hover(function() {
                              r = !0
                          }).mouseout(function() {
                              r = !1
                          })
                      }
                  }, u.addDropDown("#font_family_dropdown", function() {
                      e("#font_family").val(e(this).text()).change()
                  }), u.addDropDown("#opacity_dropdown", function() {
                      if (!e(this).find("div").length) {
                          var t = parseInt(e(this).text().split("%")[0], 10);
                          et(!1, t)
                      }
                  }, !0), e("#opac_slider").slider({
                      start: function() {
                          e("#opacity_dropdown li:not(.special)").hide()
                      },
                      stop: function() {
                          e("#opacity_dropdown li").show(), e(window).mouseup()
                      },
                      slide: function(e, t) {
                          et(t)
                      }
                  }), u.addDropDown("#blur_dropdown", e.noop);
              var ot, it, at = !1;
              e("#blur_slider").slider({
                  max: 10,
                  step: .1,
                  stop: function(t, n) {
                      at = !1, tt(n), e("#blur_dropdown li").show(), e(window).mouseup()
                  },
                  start: function() {
                      at = !0
                  },
                  slide: function(e, t) {
                      tt(t, null, at)
                  }
              }), u.addDropDown("#zoom_dropdown", function() {
                  var t = e(this),
                      n = t.data("val");
                  n ? Te(window, n) : D({
                      value: parseFloat(t.text())
                  })
              }, !0), je("#stroke_linecap", "#linecap_opts", function() {
                  i(this, !0)
              }, {
                  dropUp: !0
              }), je("#stroke_linejoin", "#linejoin_opts", function() {
                  i(this, !0)
              }, {
                  dropUp: !0
              }), je("#tool_position", "#position_opts", function() {
                  var e = this.id.replace("tool_pos", "").charAt(0);
                  d.alignSelectedElements(e, "page")
              }, {
                  multiclick: !0
              }), it = function() {
                  e(ot).blur()
              }, e("#svg_editor").find("button, select, input:not(#text)").focus(function() {
                  ot = this, V = "toolbars", G.mousedown(it)
              }).blur(function() {
                  V = "canvas", G.unbind("mousedown", it), "textedit" == d.getMode() && e("#text").focus()
              });
              var rt = function() {
                      ge("#tool_fhpath") && d.setMode("fhpath")
                  },
                  lt = function() {
                      ge("#tool_line") && d.setMode("line")
                  },
                  st = function() {
                      ge("#tool_square") && d.setMode("square")
                  },
                  ct = function() {
                      ge("#tool_rect") && d.setMode("rect")
                  },
                  ut = function() {
                      ge("#tool_fhrect") && d.setMode("fhrect")
                  },
                  dt = function() {
                      ge("#tool_circle") && d.setMode("circle")
                  },
                  ft = function() {
                      ge("#tool_ellipse") && d.setMode("ellipse")
                  },
                  pt = function() {
                      ge("#tool_fhellipse") && d.setMode("fhellipse")
                  },
                  gt = function() {
                      ge("#tool_image") && d.setMode("image")
                  },
                  vt = function() {
                      ge("#tool_zoom") && (d.setMode("zoom"), G.css("cursor", H))
                  },
                  ht = function(t) {
                      var n = d.getResolution();
                      t = t ? n.zoom * t : 1, e("#zoom").val(100 * t), d.setZoom(t), Ae(), me(!0)
                  },
                  mt = function() {
                      ge("#tool_zoom") && (ht(), Q())
                  },
                  _t = function() {
                      ge("#tool_text") && d.setMode("text")
                  },
                  wt = function() {
                      ge("#tool_path") && d.setMode("path")
                  };
              u.clickExtension = function(e) {
                  d.clickExtension(e)
              }, u.clickZoom = function() {
                  d.setMode("zoom"), G.css("cursor", H)
              }, u.clickToSetMode = function(e) {
                  d.setMode(e)
              }, u.getSvgString = function() {
                  return u.showSaveWarning = !1, d.getSvgString()
              }, u.getSelectedElements = function() {
                  return d.getSelectedElems()
              }, u.setSvgString = function(e) {
                  return d.setSvgString(e)
              }, u.enableGridSnapping = function(e) {
                  curConfig.gridSnapping = e
              }, u.setDocProperty = function(e, t, n, o, i) {
                  return !("fit" != t && !svgedit.units.isValidUnit("width", t)) && !("fit" != n && !svgedit.units.isValidUnit("height", n)) && !!d.setResolution(t, n) && (o || (o = "#ffffff"), !(o && !d.setBackground(o, i)) && void me())
              }, u.alignSelectedElements = function(e) {
                  d.alignSelectedElements(e, "page")
              }, u.setColor = function(e, t, n) {
                  var o = {
                      alpha: t,
                      solidColor: e,
                      type: "solidColor"
                  };
                  Z[n].setPaint(o), d.setPaint(n, o)
              }, u.setStrokeOption = function(e) {
                  i(e, !0)
              }, u.setFilterShadow = function(e) {
                  d.setFilterShadow(e)
              }, u.setFontFamily = function(e) {
                  d.setFontFamily(e)
              }, u.setTextAlign = function(e) {
                  d.setTextAlign(e)
              }, u.clickClearAll = function() {
                  var e = curConfig.dimensions;
                  Q(), d.clear(), d.setResolution(e[0], e[1]), me(!0), ht(), se(), ye(), Ie(), d.runExtensions("onNewDocument")
              }, u.clearSelection = function() {
                  d.clearSelection()
              }, u.selectOnly = function(e, t) {
                  d.selectOnly(e, t)
              }, u.setMarker = function(e, t) {}, u.setSvgImageToAdd = function(e) {
                  d.setGoodSvgImageContent(e)
              }, u.setUrlImageToAdd = function(e) {
                  console.log("url", e), d.setGoodImage(e), u.promptImgURLcallback = e
              }, u.getShapes = function() {
                  return u.shapesGrps
              }, u.runExtension = function(e, t, ...n) {
                  return d.runExtension(e, t, n)
              }, u.makeHyperlink = function(e) {
                  e && d.makeHyperlink(e)
              }, u.lockSelection = function(e) {
                  d.lockSelection(e)
              }, u.renameSvgExtensionId = function(e) {
                  let t = e.id.substring(0, e.id.indexOf("_"));
                  var n = d.getNextId().replace("svg_", t + "_");
                  return e.content = e.content.split(e.id).join(n), n
              }, u.renameAllSvgExtensionId = function(t, n) {
                  var o = {
                      content: t,
                      id: ""
                  };
                  return e.each(u.currentExtensionsPrefixIdType, function(e, i) {
                      for (var a = 'id=\\"' + i, r = o.content.indexOf(a); r > 0;) {
                          idend = o.content.indexOf('\\"', r + a.length), o.id = o.content.substring(r, idend);
                          var l = o.id.replace('id=\\"', "");
                          if (-1 === n.indexOf(l)) {
                              var s = u.renameSvgExtensionId(o);
                              n.push(s.replace('id=\\"', ""))
                          }
                          r = t.indexOf(a, r + 1)
                      }
                  }), t = o.content, t
              }, u.resetZoom = function() {
                  D({
                      value: 100
                  })
              }, u.refreshCanvas = function() {
                  me(!0)
              }, u.resetUndoStack = function() {
                  d.undoMgr.resetUndoStack()
              };
              var yt = function() {
                      if (null != K || Y) {
                          var e = d.deleteSelectedElements();
                          null != a && a(e)
                      }
                  },
                  bt = function() {
                      (null != K || Y) && d.cutSelectedElements()
                  },
                  Ct = function() {
                      (null != K || Y) && d.copySelectedElements()
                  },
                  xt = function() {
                      var e = d.getZoom(),
                          t = (G[0].scrollLeft + G.width() / 2) / e - d.contentW,
                          n = (G[0].scrollTop + G.height() / 2) / e - d.contentH;
                      d.pasteElements("point", t, n)
                  },
                  kt = function() {
                      null != K && d.moveToTopSelectedElement()
                  },
                  St = function() {
                      null != K && d.moveToBottomSelectedElement()
                  },
                  Et = function(e) {
                      null != K && d.moveUpDownSelected(e)
                  },
                  Ft = function() {
                      null != K && d.convertToPath()
                  },
                  Pt = function() {
                      null != K && U.reorient()
                  },
                  At = function(e, t) {
                      if (null != K || Y) {
                          if (curConfig.gridSnapping) {
                              var n = d.getZoom() * curConfig.snappingStep;
                              e *= n, t *= n
                          }
                          d.moveSelectedElements(e, t)
                      }
                  },
                  Tt = function() {
                      e("#tool_node_link").toggleClass("push_button_pressed tool_button");
                      var t = e("#tool_node_link").hasClass("push_button_pressed");
                      U.linkControlPoints(t)
                  },
                  Lt = function() {
                      U.getNodePoint() && U.clonePathNode()
                  },
                  Dt = function() {
                      U.getNodePoint() && U.deletePathNode()
                  },
                  It = function() {
                      var t = e("#tool_add_subpath"),
                          n = !t.hasClass("push_button_pressed");
                      t.toggleClass("push_button_pressed tool_button"), U.addSubPath(n)
                  },
                  Nt = function() {
                      U.opencloseSubPath()
                  },
                  Bt = function() {
                      d.cycleElement(1)
                  },
                  Ot = function() {
                      d.cycleElement(0)
                  },
                  Ut = function(t, n) {
                      if (null != K && !Y) {
                          t || (n *= -1);
                          var o = parseFloat(e("#angle").val()) + n;
                          d.setRotationAngle(o), ye()
                      }
                  };
              clickClear = function() {
                  var t = curConfig.dimensions;
                  e.confirm(uiStrings.notification.QwantToClear, function(e) {
                      e && (Q(), d.clear(), d.setResolution(t[0], t[1]), me(!0), ht(), se(), ye(), Ie(), d.runExtensions("onNewDocument"))
                  })
              };
              var Rt = function() {
                      return d.setBold(!d.getBold()), ye(), !1
                  },
                  Mt = function() {
                      return d.setItalic(!d.getItalic()), ye(), !1
                  },
                  Gt = function() {
                      var t = {
                          images: e.pref("img_save"),
                          round_digits: 6
                      };
                      d.save(t)
                  },
                  zt = function() {
                      e.select("Select an image type for export: ", ["PNG", "JPEG", "BMP", "WEBP", "PDF"], function(t) {
                          function n() {
                              var e = uiStrings.notification.loadingImage;
                              "new" === curConfig.exportWindowType && u.exportWindowCt++, o = curConfig.canvasName + u.exportWindowCt, j = window.open("data:text/html;charset=utf-8," + encodeURIComponent("<title>" + e + "</title><h1>" + e + "</h1>"), o)
                          }
                          var o;
                          if (t)
                              if ("PDF" === t) customExportPDF || n(), d.exportPDF(o);
                              else {
                                  customExportImage || n();
                                  var i = parseInt(e("#image-slider").val(), 10) / 100;
                                  d.rasterExport(t, i, o)
                              }
                      }, function() {
                          var t = e(this);
                          "JPEG" === t.val() || "WEBP" === t.val() ? e("#image-slider").length || e('<div><label>Quality: <input id="image-slider" type="range" min="1" max="100" value="92" /></label></div>').appendTo(t.parent()) : e("#image-slider").parent().remove()
                      })
                  },
                  jt = function() {
                      d.open()
                  },
                  Ht = function() {},
                  Wt = function() {
                      R.getUndoStackSize() > 0 && (R.undo(), se())
                  },
                  Vt = function() {
                      R.getRedoStackSize() > 0 && (R.redo(), se())
                  },
                  Xt = function() {
                      Y ? d.groupSelectedElements() : K && d.ungroupSelectedElement(), u.onGroupChanged && u.onGroupChanged(K)
                  },
                  Zt = function() {
                      d.copySelectedElements(), d.pasteElements("point", 20, 20)
                  },
                  qt = function() {
                      var t = this.id.replace("tool_align", "").charAt(0);
                      d.alignSelectedElements(t, e("#align_relative_to").val())
                  },
                  Qt = function() {
                      var e = this.id.replace("tool_divide", "").charAt(0);
                      d.divideSelectedElements(e)
                  },
                  Kt = function() {
                      if (e("#tool_wireframe").toggleClass("push_button_pressed tool_button"), G.toggleClass("wireframe"), !L) {
                          var t = e("#wireframe_rules");
                          t.length ? t.empty() : t = e('<style id="wireframe_rules"></style>').appendTo("head"), be()
                      }
                  };
              e("#svg_docprops_container, #svg_prefs_container").draggable({
                  cancel: "button,fieldset",
                  containment: "window"
              });
              var Yt, Jt, $t, en = function() {
                      if (!ne) {
                          ne = !0, e("#image_save_opts input").val([e.pref("img_save")]);
                          var t = d.getResolution();
                          "px" !== curConfig.baseUnit && (t.w = svgedit.units.convertUnit(t.w) + curConfig.baseUnit, t.h = svgedit.units.convertUnit(t.h) + curConfig.baseUnit), e("#canvas_width").val(t.w), e("#canvas_height").val(t.h), e("#canvas_title").val(d.getDocumentTitle()), e("#svg_docprops").show()
                      }
                  },
                  tn = function() {
                      if (!oe) {
                          oe = !0, e("#main_menu").hide();
                          var t = e("#bg_blocks div"),
                              n = "cur_background",
                              o = curPrefs.bkgd_color,
                              i = e.pref("bkgd_url");
                          t.each(function() {
                              var t = e(this),
                                  i = t.css("background-color") == o;
                              t.toggleClass(n, i), i && e("#canvas_bg_url").removeClass(n)
                          }), o || t.eq(0).addClass(n), i && e("#canvas_bg_url").val(i), e("#grid_snapping_on").prop("checked", curConfig.gridSnapping), e("#grid_snapping_step").attr("value", curConfig.snappingStep), e("#grid_color").attr("value", curConfig.gridColor), e("#svg_prefs").show()
                      }
                  },
                  nn = function() {
                      e("#svg_source_editor").hide(), te = !1, e("#svg_source_textarea").blur()
                  },
                  on = function() {
                      if (te) {
                          var t = function() {
                              d.clearSelection(), nn(), ht(), se(), Ce(), Ie()
                          };
                          d.setSvgString(e("#svg_source_textarea").val()) ? t() : e.confirm(uiStrings.notification.QerrorsRevertToSource, function(e) {
                              if (!e) return !1;
                              t()
                          }), Q()
                      }
                  },
                  an = function() {
                      e("#svg_docprops").hide(), e("#canvas_width,#canvas_height").removeAttr("disabled"), e("#resolution")[0].selectedIndex = 0, e("#image_save_opts input").val([e.pref("img_save")]), ne = !1
                  },
                  rn = function() {
                      e("#svg_prefs").hide(), oe = !1
                  },
                  ln = function() {
                      var t = e("#canvas_title").val();
                      Ce(t), d.setDocumentTitle(t);
                      var n = e("#canvas_width"),
                          o = n.val(),
                          i = e("#canvas_height"),
                          a = i.val();
                      return "fit" == o || svgedit.units.isValidUnit("width", o) ? (n.parent().removeClass("error"), "fit" == a || svgedit.units.isValidUnit("height", a) ? (i.parent().removeClass("error"), d.setResolution(o, a) ? (e.pref("img_save", e("#image_save_opts :checked").val()), me(), void an()) : (e.alert(uiStrings.notification.noContentToFitTo), !1)) : (e.alert(uiStrings.notification.invalidAttrValGiven), i.parent().addClass("error"), !1)) : (e.alert(uiStrings.notification.invalidAttrValGiven), n.parent().addClass("error"), !1)
                  },
                  sn = u.savePreferences = function() {
                      var t = e("#bg_blocks div.cur_background").css("background-color") || "#FFF";
                      r(t, e("#canvas_bg_url").val());
                      var n = e("#lang_select").val();
                      n !== e.pref("lang") && u.putLocale(n, F), ze(e("#iconsize").val()), curConfig.gridSnapping = e("#grid_snapping_on")[0].checked, curConfig.snappingStep = e("#grid_snapping_step").val(), curConfig.gridColor = e("#grid_color").val(), curConfig.showRulers = e("#show_rulers")[0].checked, e("#rulers").toggle(curConfig.showRulers), curConfig.showRulers && s(), curConfig.baseUnit = e("#base_unit").val(), d.setConfig(curConfig), me(), rn()
                  },
                  cn = e.noop,
                  un = function() {
                      e("#dialog_box").hide(), te || ne || oe ? (te ? X !== e("#svg_source_textarea").val() ? e.confirm(uiStrings.notification.QignoreSourceChanges, function(e) {
                          e && nn()
                      }) : nn() : ne ? an() : oe && rn(), cn()) : ie && d.leaveContext()
                  },
                  dn = {
                      width: e(window).width(),
                      height: e(window).height()
                  };
              if (svgedit.browser.isIE() && (cn = function() {
                      0 === G[0].scrollLeft && 0 === G[0].scrollTop && (G[0].scrollLeft = N.left, G[0].scrollTop = N.top)
                  }, N = {
                      left: G[0].scrollLeft,
                      top: G[0].scrollTop
                  }, e(window).resize(cn), u.ready(function() {
                      setTimeout(function() {
                          cn()
                      }, 500)
                  }), G.scroll(function() {
                      N = {
                          left: G[0].scrollLeft,
                          top: G[0].scrollTop
                      }
                  })), e(window).resize(function(t) {
                      e.each(dn, function(t, n) {
                          var o = e(window)[t]();
                          G[0]["scroll" + ("width" === t ? "Left" : "Top")] -= (o - n) / 2, dn[t] = o
                      }), Oe()
                  }), G.scroll(function() {
                      0 != e("#ruler_x").length && (e("#ruler_x")[0].scrollLeft = G[0].scrollLeft), 0 != e("#ruler_y").length && (e("#ruler_y")[0].scrollTop = G[0].scrollTop)
                  }), e("#url_notice").click(function() {
                      e.alert(this.title)
                  }), e("#change_image_url").click(l), Yt = ["clear", "open", "save", "source", "delete", "delete_multi", "paste", "clone", "clone_multi", "move_top", "move_bottom"], Jt = "", $t = "tool_button_current", e.each(Yt, function(e, t) {
                      Jt += (e ? "," : "") + "#tool_" + t
                  }), e(Jt).mousedown(function() {
                      e(this).addClass($t)
                  }).bind("mousedown mouseout", function() {
                      e(this).removeClass($t)
                  }), e("#tool_undo, #tool_redo").mousedown(function() {
                      e(this).hasClass("disabled") || e(this).addClass($t)
                  }).bind("mousedown mouseout", function() {
                      e(this).removeClass($t)
                  }), svgedit.browser.isMac() && !window.opera) {
                  var fn = ["tool_clear", "tool_save", "tool_source", "tool_undo", "tool_redo", "tool_clone"];
                  for (q = fn.length; q--;) {
                      var pn = document.getElementById(fn[q]);
                      if (pn) {
                          var gn = pn.title,
                              vn = gn.indexOf("Ctrl+");
                          pn.title = [gn.substr(0, vn), "Cmd+", gn.substr(vn + 5)].join("")
                      }
                  }
              }
              var hn = function(t) {
                      var n = "stroke_color" == t.attr("id") ? "stroke" : "fill",
                          o = Z[n].paint,
                          i = "stroke" == n ? "Pick a Stroke Paint and Opacity" : "Pick a Fill Paint and Opacity",
                          a = t.offset();
                      e("#color_picker").draggable({
                          cancel: ".jGraduate_tabs, .jGraduate_colPick, .jGraduate_gradPick, .jPicker",
                          containment: "window"
                      }).css(curConfig.colorPickerCSS || {
                          left: a.left - 140,
                          bottom: 40
                      }).jGraduate({
                          paint: o,
                          window: {
                              pickerTitle: i
                          },
                          images: {
                              clientPath: curConfig.jGraduatePath
                          },
                          newstop: "inverse"
                      }, function(t) {
                          o = new e.jGraduate.Paint(t), Z[n].setPaint(o), d.setPaint(n, o), e("#color_picker").hide()
                      }, function() {
                          e("#color_picker").hide()
                      })
                  },
                  mn = function(t, n) {
                      var o, i, a = curConfig["fill" === n ? "initFill" : "initStroke"],
                          r = (new DOMParser).parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><rect width="16.5" height="16.5"\t\t\t\t\tfill="#' + a.color + '" opacity="' + a.opacity + '"/>\t\t\t\t\t<defs><linearGradient id="gradbox_"/></defs></svg>', "text/xml"),
                          l = r.documentElement;
                      l = e(t)[0].appendChild(document.importNode(l, !0)), l.setAttribute("width", 16.5), this.rect = l.firstChild, this.defs = l.getElementsByTagName("defs")[0], this.grad = this.defs.firstChild, this.paint = new e.jGraduate.Paint({
                          solidColor: a.color
                      }), this.type = n, this.setPaint = function(e, t) {
                          this.paint = e;
                          var n = "none",
                              a = e.type,
                              r = e.alpha / 100;
                          switch (a) {
                              case "solidColor":
                                  n = "none" != e[a] ? "#" + e[a] : e[a];
                                  break;
                              case "linearGradient":
                              case "radialGradient":
                                  this.defs.removeChild(this.grad), this.grad = this.defs.appendChild(e[a]);
                                  var l = this.grad.id = "gradbox_" + this.type;
                                  n = "url(#" + l + ")"
                          }
                          this.rect.setAttribute("fill", n), this.rect.setAttribute("opacity", r), t && (d.setColor(this.type, o, !0), d.setPaintOpacity(this.type, i, !0))
                      }, this.update = function(e) {
                          if (K) {
                              var t, n, a = this.type;
                              switch (K.tagName) {
                                  case "use":
                                  case "image":
                                  case "foreignObject":
                                      return;
                                  case "g":
                                  case "a":
                                      var r = null,
                                          l = K.getElementsByTagName("*");
                                      for (t = 0, n = l.length; t < n; t++) {
                                          var s = l[t],
                                              c = s.getAttribute(a);
                                          if (0 === t) r = c;
                                          else if (r !== c) {
                                              r = null;
                                              break
                                          }
                                      }
                                      if (null === r) return void(o = null);
                                      o = r, i = 1;
                                      break;
                                  default:
                                      i = parseFloat(K.getAttribute(a + "-opacity")), isNaN(i) && (i = 1);
                                      var u = "fill" === a ? "black" : "none";
                                      o = K.getAttribute(a) || u
                              }
                              e && (d.setColor(a, o, !0), d.setPaintOpacity(a, i, !0)), i *= 100;
                              var f = Ve(o, i, a);
                              this.setPaint(f)
                          }
                      }, this.prep = function() {
                          var t = this.paint.type;
                          switch (t) {
                              case "linearGradient":
                              case "radialGradient":
                                  var o = new e.jGraduate.Paint({
                                      copy: this.paint
                                  });
                                  d.setPaint(n, o)
                          }
                      }
                  };
              Z.fill = new mn("#fill_color", "fill"), Z.stroke = new mn("#stroke_color", "stroke"), e("#stroke_width").val(curConfig.initStroke.width), e("#group_opacity").val(100 * curConfig.initOpacity);
              var _n = Z.fill.rect.cloneNode(!1);
              _n.setAttribute("style", "vector-effect:non-scaling-stroke"), L = "non-scaling-stroke" === _n.style.vectorEffect, _n.removeAttribute("style");
              var wn, yn, bn = Z.fill.rect.ownerDocument,
                  Cn = bn.createElementNS(svgedit.NS.SVG, "feGaussianBlur");
              void 0 === Cn.stdDeviationX && e("#tool_blur").hide(), e(Cn).remove(), wn = "-" + Me.toLowerCase() + "-zoom-", yn = wn + "in", G.css("cursor", yn), G.css("cursor") === yn && (H = yn, W = wn + "out"), G.css("cursor", "auto"), e("#fill_color, #tool_fill .icon_label").click(function() {
                  hn(e("#fill_color")), _e()
              }), e("#stroke_color, #tool_stroke .icon_label").click(function() {
                  hn(e("#stroke_color")), _e()
              }), e("#group_opacityLabel").click(function() {
                  e("#opacity_dropdown button").mousedown(), e(window).mouseup()
              }), e("#zoomLabel").click(function() {
                  e("#zoom_dropdown button").mousedown(), e(window).mouseup()
              }), e("#tool_move_top").mousedown(function(t) {
                  e("#tools_stacking").show()
              }), e(".layer_button").mousedown(function() {
                  e(this).addClass("layer_buttonpressed")
              }).mouseout(function() {
                  e(this).removeClass("layer_buttonpressed")
              }).mouseup(function() {
                  e(this).removeClass("layer_buttonpressed")
              }), e(".push_button").mousedown(function() {
                  e(this).hasClass("disabled") || e(this).addClass("push_button_pressed").removeClass("push_button")
              }).mouseout(function() {
                  e(this).removeClass("push_button_pressed").addClass("push_button")
              }).mouseup(function() {
                  e(this).removeClass("push_button_pressed").addClass("push_button")
              }), e("#layer_new").click(function() {
                  var t, n = d.getCurrentDrawing().getNumLayers();
                  do {
                      t = uiStrings.layers.layer + " " + ++n
                  } while (d.getCurrentDrawing().hasLayer(t));
                  e.prompt(uiStrings.notification.enterUniqueLayerName, t, function(t) {
                      t && (d.getCurrentDrawing().hasLayer(t) ? e.alert(uiStrings.notification.dupeLayerName) : (d.createLayer(t), ye(), se()))
                  })
              }), e("#layer_delete").click(_), e("#layer_up").click(function() {
                  b(-1)
              }), e("#layer_down").click(function() {
                  b(1)
              }), e("#layer_rename").click(function() {
                  var t = e("#layerlist tr.layersel td.layername").text();
                  e.prompt(uiStrings.notification.enterNewLayerName, "", function(n) {
                      n && (t == n || d.getCurrentDrawing().hasLayer(n) ? e.alert(uiStrings.notification.layerHasThatName) : (d.renameCurrentLayer(n), se()))
                  })
              });
              var xn = 300,
                  kn = 150,
                  Sn = -1,
                  En = !1,
                  Fn = !1,
                  Pn = function(t) {
                      var n = e("#ruler_x");
                      e("#sidepanels").width("+=" + t), e("#layerpanel").width("+=" + t), n.css("right", parseInt(n.css("right"), 10) + t), G.css("right", parseInt(G.css("right"), 10) + t), d.runExtensions("workareaResized")
                  },
                  An = function(t) {
                      if (Fn && -1 != Sn) {
                          En = !0;
                          var n = Sn - t.pageX,
                              o = e("#sidepanels").width();
                          o + n > xn ? (n = xn - o, o = xn) : o + n < 2 && (n = 2 - o, o = 2), 0 != n && (Sn -= n, Pn(n))
                      }
                  },
                  Tn = function(t) {
                      var n = e("#sidepanels").width(),
                          o = (n > 2 || t ? 2 : kn) - n;
                      Pn(o)
                  };
              e("#sidepanel_handle").mousedown(function(t) {
                  Sn = t.pageX, e(window).mousemove(An), Fn = !1, setTimeout(function() {
                      Fn = !0
                  }, 20)
              }).mouseup(function(e) {
                  En || Tn(), Sn = -1, En = !1
              }), e(window).mouseup(function() {
                  Sn = -1, En = !1, e("#svg_editor").unbind("mousemove", An)
              }), se();
              var Ln, Dn, In = function() {
                  G.css("line-height", G.height() + "px")
              };
              e(window).bind("load resize", In), e("#resolution").change(function() {
                  var t = e("#canvas_width,#canvas_height");
                  if (this.selectedIndex)
                      if ("content" == this.value) t.val("fit").attr("disabled", "disabled");
                      else {
                          var n = this.value.split("x");
                          e("#canvas_width").val(n[0]), e("#canvas_height").val(n[1]), t.removeAttr("disabled")
                      }
                  else "fit" == e("#canvas_width").val() && t.removeAttr("disabled").val(100)
              }), e("input,select").attr("autocomplete", "off"), Ln = [{
                  sel: "#tool_select",
                  fn: ve,
                  evt: "click",
                  key: ["V", !0]
              }, {
                  sel: "#tool_fhpath",
                  fn: rt,
                  evt: "click",
                  key: ["Q", !0]
              }, {
                  sel: "#tool_line",
                  fn: lt,
                  evt: "click",
                  key: ["L", !0]
              }, {
                  sel: "#tool_rect",
                  fn: ct,
                  evt: "mouseup",
                  key: ["R", !0],
                  parent: "#tools_rect",
                  icon: "rect"
              }, {
                  sel: "#tool_square",
                  fn: st,
                  evt: "mouseup",
                  parent: "#tools_rect",
                  icon: "square"
              }, {
                  sel: "#tool_fhrect",
                  fn: ut,
                  evt: "mouseup",
                  parent: "#tools_rect",
                  icon: "fh_rect"
              }, {
                  sel: "#tool_ellipse",
                  fn: ft,
                  evt: "mouseup",
                  key: ["E", !0],
                  parent: "#tools_ellipse",
                  icon: "ellipse"
              }, {
                  sel: "#tool_circle",
                  fn: dt,
                  evt: "mouseup",
                  parent: "#tools_ellipse",
                  icon: "circle"
              }, {
                  sel: "#tool_fhellipse",
                  fn: pt,
                  evt: "mouseup",
                  parent: "#tools_ellipse",
                  icon: "fh_ellipse"
              }, {
                  sel: "#tool_path",
                  fn: wt,
                  evt: "click",
                  key: ["P", !0]
              }, {
                  sel: "#tool_text",
                  fn: _t,
                  evt: "click",
                  key: ["T", !0]
              }, {
                  sel: "#tool_image",
                  fn: gt,
                  evt: "mouseup"
              }, {
                  sel: "#tool_zoom",
                  fn: vt,
                  evt: "mouseup",
                  key: ["Z", !0]
              }, {
                  sel: "#tool_clear",
                  fn: clickClear,
                  evt: "mouseup",
                  key: ["N", !0]
              }, {
                  sel: "#tool_save",
                  fn: function() {
                      te ? on() : Gt()
                  },
                  evt: "mouseup",
                  key: ["S", !0]
              }, {
                  sel: "#tool_export",
                  fn: zt,
                  evt: "mouseup"
              }, {
                  sel: "#tool_open",
                  fn: jt,
                  evt: "mouseup",
                  key: ["O", !0]
              }, {
                  sel: "#tool_import",
                  fn: Ht,
                  evt: "mouseup"
              }, {
                  sel: "#tool_source",
                  fn: ce,
                  evt: "click",
                  key: ["U", !0]
              }, {
                  sel: "#tool_wireframe",
                  fn: Kt,
                  evt: "click",
                  key: ["F", !0]
              }, {
                  sel: "#tool_source_save",
                  fn: on,
                  evt: "click"
              }, {
                  sel: "#tool_docprops_save",
                  fn: ln,
                  evt: "click"
              }, {
                  sel: "#tool_docprops",
                  fn: en,
                  evt: "mouseup"
              }, {
                  sel: "#tool_prefs_save",
                  fn: sn,
                  evt: "click"
              }, {
                  sel: "#tool_prefs_option",
                  fn: function() {
                      return tn(), !1
                  },
                  evt: "mouseup"
              }, {
                  sel: "#tool_delete,#tool_delete_multi",
                  fn: yt,
                  evt: "click",
                  key: ["del/backspace", !0]
              }, {
                  sel: "#tool_reorient",
                  fn: Pt,
                  evt: "click"
              }, {
                  sel: "#tool_node_link",
                  fn: Tt,
                  evt: "click"
              }, {
                  sel: "#tool_node_clone",
                  fn: Lt,
                  evt: "click"
              }, {
                  sel: "#tool_node_delete",
                  fn: Dt,
                  evt: "click"
              }, {
                  sel: "#tool_openclose_path",
                  fn: Nt,
                  evt: "click"
              }, {
                  sel: "#tool_add_subpath",
                  fn: It,
                  evt: "click"
              }, {
                  sel: "#tool_move_top",
                  fn: kt,
                  evt: "click",
                  key: "ctrl+shift+]"
              }, {
                  sel: "#tool_move_bottom",
                  fn: St,
                  evt: "click",
                  key: "ctrl+shift+["
              }, {
                  sel: "#tool_topath",
                  fn: Ft,
                  evt: "click"
              }, {
                  sel: "#tool_undo",
                  fn: Wt,
                  evt: "click",
                  key: ["ctrl+Z", !0]
              }, {
                  sel: "#tool_redo",
                  fn: Vt,
                  evt: "click",
                  key: ["ctrl+Y", !0]
              }, {
                  sel: "#tool_clone,#tool_clone_multi",
                  fn: Zt,
                  evt: "click",
                  key: ["ctrl+D", !0]
              }, {
                  sel: "#tool_group_elements",
                  fn: Xt,
                  evt: "click",
                  key: ["ctrl+G", !0]
              }, {
                  sel: "#tool_ungroup",
                  fn: Xt,
                  evt: "click"
              }, {
                  sel: "#tool_unlink_use",
                  fn: Xt,
                  evt: "click"
              }, {
                  sel: "[id^=tool_align]",
                  fn: qt,
                  evt: "click"
              }, {
                  sel: "[id^=tool_divide]",
                  fn: Qt,
                  evt: "click"
              }, {
                  sel: "#tool_bold",
                  fn: Rt,
                  evt: "mousedown"
              }, {
                  sel: "#tool_italic",
                  fn: Mt,
                  evt: "mousedown"
              }, {
                  sel: "#sidepanel_handle",
                  fn: Tn,
                  key: ["X"]
              }, {
                  sel: "#copy_save_done",
                  fn: un,
                  evt: "click"
              }, {
                  key: "ctrl+left",
                  fn: function() {
                      Ut(0, 1)
                  }
              }, {
                  key: "ctrl+right",
                  fn: function() {
                      Ut(1, 1)
                  }
              }, {
                  key: "ctrl+shift+left",
                  fn: function() {
                      Ut(0, 5)
                  }
              }, {
                  key: "ctrl+shift+right",
                  fn: function() {
                      Ut(1, 5)
                  }
              }, {
                  key: "shift+O",
                  fn: Ot
              }, {
                  key: "shift+P",
                  fn: Bt
              }, {
                  key: [O + "up", !0],
                  fn: function() {
                      ht(2)
                  }
              }, {
                  key: [O + "down", !0],
                  fn: function() {
                      ht(.5)
                  }
              }, {
                  key: [O + "]", !0],
                  fn: function() {
                      Et("Up")
                  }
              }, {
                  key: [O + "[", !0],
                  fn: function() {
                      Et("Down")
                  }
              }, {
                  key: ["up", !0],
                  fn: function() {
                      At(0, -1)
                  }
              }, {
                  key: ["down", !0],
                  fn: function() {
                      At(0, 1)
                  }
              }, {
                  key: ["left", !0],
                  fn: function() {
                      At(-1, 0)
                  }
              }, {
                  key: ["right", !0],
                  fn: function() {
                      At(1, 0)
                  }
              }, {
                  key: "shift+up",
                  fn: function() {
                      At(0, -10)
                  }
              }, {
                  key: "shift+down",
                  fn: function() {
                      At(0, 10)
                  }
              }, {
                  key: "shift+left",
                  fn: function() {
                      At(-10, 0)
                  }
              }, {
                  key: "shift+right",
                  fn: function() {
                      At(10, 0)
                  }
              }, {
                  key: O + "A",
                  fn: function() {
                      d.selectAllInCurrentLayer()
                  }
              }, {
                  key: O + "z",
                  fn: Wt
              }, {
                  key: O + "shift+z",
                  fn: Vt
              }, {
                  key: O + "y",
                  fn: Vt
              }, {
                  key: O + "x",
                  fn: bt
              }, {
                  key: O + "c",
                  fn: Ct
              }, {
                  key: O + "v",
                  fn: xt
              }], Dn = {
                  "4/Shift+4": "#tools_rect_show",
                  "5/Shift+5": "#tools_ellipse_show"
              }, I = {
                  setAll: function() {
                      var t = {};
                      e.each(Ln, function(n, o) {
                          var i;
                          if (o.sel) {
                              if (i = e(o.sel), 0 == i.length) return !0;
                              if (o.evt && (svgedit.browser.isTouch() && "click" === o.evt && (o.evt = "mousedown"), i[o.evt](o.fn)), o.parent && 0 != e(o.parent + "_show").length) {
                                  var a = e(o.parent);
                                  a.length || (a = Re(o.parent.substr(1))), a.append(i), e.isArray(t[o.parent]) || (t[o.parent] = []), t[o.parent].push(o)
                              }
                          }
                          if (o.key) {
                              var r, l = o.fn,
                                  s = !1;
                              if (e.isArray(o.key) ? (r = o.key[0], o.key.length > 1 && (s = o.key[1]), o.key.length > 2 && o.key[2]) : r = o.key, r += "", e.each(r.split("/"), function(t, n) {
                                      e(document).bind("keydown", n, function(e) {
                                          return l(), s && e.preventDefault(), !1
                                      })
                                  }), o.sel && !o.hidekey && i.attr("title")) {
                                  var c = i.attr("title").split("[")[0] + " (" + r + ")";
                                  Dn[r] = o.sel, i.parents("#main_menu").length || i.attr("title", c)
                              }
                          }
                      }), Ue(t), e(".attr_changer, #image_url").bind("keydown", "return", function(t) {
                          e(this).change(),
                              t.preventDefault()
                      }), e(window).bind("keydown", "tab", function(e) {
                          "canvas" === V && (e.preventDefault(), Bt())
                      }).bind("keydown", "shift+tab", function(e) {
                          "canvas" === V && (e.preventDefault(), Ot())
                      }), e("#tool_zoom").dblclick(mt)
                  },
                  setTitles: function() {
                      e.each(Dn, function(t, n) {
                          var o = e(n).parents("#main_menu").length;
                          e(n).each(function() {
                              var n;
                              n = o ? e(this).text().split(" [")[0] : this.title.split(" [")[0];
                              var i = "";
                              e.each(t.split("/"), function(e, t) {
                                  var n = t.split("+"),
                                      o = "";
                                  n.length > 1 && (o = n[0] + "+", t = n[1]), i += (e ? "/" : "") + o + (uiStrings["key_" + t] || t)
                              }), o ? this.lastChild.textContent = n + " [" + i + "]" : this.title = n + " [" + i + "]"
                          })
                      })
                  },
                  getButtonData: function(t) {
                      var n;
                      return e.each(Ln, function(e, o) {
                          o.sel === t && (n = o)
                      }), n
                  }
              }, I.setAll(), u.ready(function() {
                  var t, n = curConfig.initTool,
                      o = e("#tools_left, #svg_editor .tools_flyout"),
                      i = o.find("#tool_" + n),
                      a = o.find("#" + n);
                  t = i.length ? i : a.length ? a : e("#tool_select"), t.click().mouseup(), curConfig.wireframe && e("#tool_wireframe").click(), curConfig.showlayers && Tn(), e("#rulers").toggle(!!curConfig.showRulers), curConfig.showRulers && (e("#show_rulers")[0].checked = !0), curConfig.baseUnit && e("#base_unit").val(curConfig.baseUnit), curConfig.gridSnapping && (e("#grid_snapping_on")[0].checked = !0), curConfig.snappingStep && e("#grid_snapping_step").val(curConfig.snappingStep), curConfig.gridColor && e("#grid_color").val(curConfig.gridColor)
              }), e("#rect_rx").SpinButton({
                  min: 0,
                  max: 1e3,
                  callback: Ke
              }), e("#stroke_width").SpinButton({
                  min: 0,
                  max: 99,
                  smallStep: .1,
                  callback: Je
              }), e("#angle").SpinButton({
                  min: -180,
                  max: 180,
                  step: 5,
                  callback: $e
              }), e("#font_size").SpinButton({
                  min: .001,
                  stepfunc: C,
                  callback: Ye
              }), e("#group_opacity").SpinButton({
                  min: 0,
                  max: 100,
                  step: 5,
                  callback: et
              }), e("#blur").SpinButton({
                  min: 0,
                  max: 10,
                  step: .1,
                  callback: tt
              }), e("#zoom").SpinButton({
                  min: .001,
                  max: 1e4,
                  step: 50,
                  stepfunc: x,
                  callback: D
              }).val(100 * d.getZoom()), e("#workarea").contextMenu({
                  menu: "cmenu_canvas",
                  inSpeed: 0
              }, function(e, t, n) {
                  switch (e) {
                      case "interactivity":
                      case "editBindOfTags":
                          break;
                      case "delete":
                          yt();
                          break;
                      case "deselect":
                          var o = d.getMode();
                          d.clearSelection(), d.setMode(o);
                          break;
                      case "cut":
                          bt();
                          break;
                      case "copy":
                          Ct();
                          break;
                      case "paste":
                          d.pasteElements();
                          break;
                      case "paste_in_place":
                          d.pasteElements("in_place");
                          break;
                      case "group":
                      case "group_elements":
                          d.groupSelectedElements();
                          break;
                      case "ungroup":
                          d.ungroupSelectedElement();
                          break;
                      case "move_front":
                          kt();
                          break;
                      case "move_up":
                          Et("Up");
                          break;
                      case "move_down":
                          Et("Down");
                          break;
                      case "move_back":
                          St();
                          break;
                      default:
                          svgedit.contextmenu && svgedit.contextmenu.hasCustomHandler(e) && svgedit.contextmenu.getCustomHandler(e).call()
                  }
                  d.clipBoard.length && z.enableContextMenuItems("#paste,#paste_in_place")
              });
              var Nn = function(e, t, n) {
                  switch (e) {
                      case "dupe":
                          w();
                          break;
                      case "delete":
                          _();
                          break;
                      case "merge_down":
                          y();
                          break;
                      case "merge_all":
                          d.mergeAllLayers(), ye(), se()
                  }
              };
              if (e("#layerlist").contextMenu({
                      menu: "cmenu_layers",
                      inSpeed: 0
                  }, Nn), e("#layer_moreopts").contextMenu({
                      menu: "cmenu_layers",
                      inSpeed: 0,
                      allowLeft: !0
                  }, Nn), e(".contextMenu li").mousedown(function(e) {
                      e.preventDefault()
                  }), e("#cmenu_canvas li").disableContextMenu(), z.enableContextMenuItems("#delete,#deselect,#cut,#copy"), window.addEventListener("beforeunload", function(e) {
                      if (0 === R.getUndoStackSize() && (u.showSaveWarning = !1), !curConfig.no_save_warning && u.showSaveWarning) return e.returnValue = uiStrings.notification.unsavedChanges, uiStrings.notification.unsavedChanges
                  }, !1), u.openPrep = function(t) {
                      e("#main_menu").hide(), 0 === R.getUndoStackSize() ? t(!0) : e.confirm(uiStrings.notification.QwantToOpen, t)
                  }, window.FileReader) {
                  var Bn = function(t) {
                      e.process_cancel(uiStrings.notification.loadingImage), t.stopPropagation(), t.preventDefault(), e("#workarea").removeAttr("style"), e("#main_menu").hide();
                      var n, o = "drop" == t.type ? t.dataTransfer.files[0] : this.files[0];
                      o ? -1 != o.type.indexOf("image") && (-1 != o.type.indexOf("svg") ? (n = new FileReader, n.onloadend = function(t) {
                          d.importSvgString(t.target.result, !0), e("#dialog_box").hide()
                      }, n.readAsText(o)) : (n = new FileReader, n.onloadend = function(t) {
                          var n = function(n, o) {
                                  var i = d.addSvgElementFromJson({
                                      element: "image",
                                      attr: {
                                          x: 0,
                                          y: 0,
                                          width: n,
                                          height: o,
                                          id: d.getNextId(),
                                          style: "pointer-events:inherit"
                                      }
                                  });
                                  d.setHref(i, t.target.result), d.selectOnly([i]), d.alignSelectedElements("m", "page"), d.alignSelectedElements("c", "page"), ye(), e("#dialog_box").hide()
                              },
                              o = 100,
                              i = 100,
                              a = new Image;
                          a.src = t.target.result, a.style.opacity = 0, a.onload = function() {
                              o = a.offsetWidth, i = a.offsetHeight, n(o, i)
                          }
                      }, n.readAsDataURL(o))) : e("#dialog_box").hide()
                  };
                  G[0].addEventListener("dragenter", k, !1), G[0].addEventListener("dragover", S, !1), G[0].addEventListener("dragleave", E, !1), G[0].addEventListener("drop", Bn, !1);
                  var On = e('<input type="file">').change(function() {
                      var t = this;
                      u.openPrep(function(n) {
                          if (n && (d.clear(), 1 === t.files.length)) {
                              e.process_cancel(uiStrings.notification.loadingImage);
                              var o = new FileReader;
                              o.onloadend = function(e) {
                                  c(e.target.result), me()
                              }, o.readAsText(t.files[0])
                          }
                      })
                  });
                  e("#tool_open").show().prepend(On);
                  var Un = e('<input type="file">').change(Bn);
                  e("#tool_import").show().prepend(Un)
              }
              me(!0), e(function() {
                  window.svgCanvas = d, d.ready = u.ready, d.setSpecialsIds(g, v)
              }), u.setLang = function(t, n) {
                  if (u.langChanged = !0, e.pref("lang", t), e("#lang_select").val(t), n) {
                      var o = e("#layerlist tr.layersel td.layername").text(),
                          i = o == uiStrings.common.layer + " 1";
                      if (e.extend(uiStrings, n), d.setUiStrings(n), I.setTitles(), i && (d.renameCurrentLayer(uiStrings.common.layer + " 1"), se()), He.length)
                          for (; He.length;) {
                              var a = He.shift();
                              a.langReady({
                                  lang: t,
                                  uiStrings: uiStrings
                              })
                          } else d.runExtensions("langReady", {
                              lang: t,
                              uiStrings: uiStrings
                          });
                      d.runExtensions("langChanged", t), Be();
                      var r = {
                          "#stroke_color": "#tool_stroke .icon_label, #tool_stroke .color_block",
                          "#fill_color": "#tool_fill label, #tool_fill .color_block",
                          "#linejoin_miter": "#cur_linejoin",
                          "#linecap_butt": "#cur_linecap"
                      };
                      e.each(r, function(t, n) {
                          e(n).attr("title", e(t)[0].title)
                      }), e("#multiselected_panel div[id^=tool_align]").each(function() {
                          e("#tool_pos" + this.id.substr(10))[0].title = this.title
                      })
                  }
              }, d && d.setColor("fill", "#FFFFFF"), h.takePil() && (A(), T(function() {
                  u.currentExtensionsInteractivityType = d.getExtensionMember("getClassId"), u.currentExtensionsPrefixIdType = d.getExtensionMember("getPrefixId")
              }))
          }, u.ready = function(e) {
              isReady ? e() : callbacks.push(e)
          }, u.runCallbacks = function() {
              e.each(callbacks, function() {
                  this()
              }), isReady = !0
          }, u.loadFromString = function(e) {
              u.ready(function() {
                  c(e)
              })
          }, u.disableUI = function(e) {}, u.loadFromURL = function(t, n) {
              n || (n = {});
              var o = n.cache,
                  i = n.callback;
              u.ready(function() {
                  e.ajax({
                      url: t,
                      dataType: "text",
                      cache: !!o,
                      beforeSend: function() {
                          e.process_cancel(uiStrings.notification.loadingImage)
                      },
                      success: function(e) {
                          c(e, i)
                      },
                      error: function(t, n, o) {
                          404 != t.status && t.responseText ? c(t.responseText, i) : e.alert(uiStrings.notification.URLloadFail + ": \n" + o, i)
                      },
                      complete: function() {
                          e("#dialog_box").hide()
                      }
                  })
              })
          }, u.loadFromDataURI = function(e) {
              u.ready(function() {
                  var t = !1,
                      n = e.match(/^data:image\/svg\+xml;base64,/);
                  n ? t = !0 : n = e.match(/^data:image\/svg\+xml(?:;(?:utf8)?)?,/), n && (n = n[0]);
                  var o = e.slice(n.length);
                  c(t ? h.decode64(o) : decodeURIComponent(o))
              })
          }, u.addExtension = function() {
              var e = arguments;
              d && (d.addExtension.apply(this, e), u && u.extensionLoadedCallback && u.extensionLoadedCallback(e[0], e))
          }, u
      }(jQuery)
  }
