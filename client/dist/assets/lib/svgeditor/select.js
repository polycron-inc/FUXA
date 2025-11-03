          svgedit.select || (svgedit.select = {});
          var s = svgedit.browser.isTouch() ? 10 : 4;
          svgedit.select.Selector = function(t, r) {
              this.id = t, this.selectedElement = r, this.locked = !0, this.selectorGroup = e.createSVGElement({
                  element: "g",
                  attr: {
                      id: "selectorGroup" + this.id
                  }
              }), this.selectorRect = this.selectorGroup.appendChild(e.createSVGElement({
                  element: "path",
                  attr: {
                      id: "selectedBox" + this.id,
                      fill: "none",
                      stroke: "#9ebdff",
                      "stroke-width": "1",
                      style: "pointer-events:none"
                  }
              })), this.gripCoords = {
                  nw: null,
                  n: null,
                  ne: null,
                  e: null,
                  se: null,
                  s: null,
                  sw: null,
                  w: null
              }, this.reset(this.selectedElement)
          }, svgedit.select.Selector.prototype.reset = function(e) {
              this.locked = !0, this.selectedElement = e, this.resize(), this.selectorGroup.setAttribute("display", "inline")
          }, svgedit.select.Selector.prototype.updateGripCursors = function(e) {
              var t, s = [],
                  i = Math.round(e / 45);
              for (t in i < 0 && (i += 8), r.selectorGrips) s.push(t);
              for (; i > 0;) s.push(s.shift()), i--;
              var o = 0;
              for (t in r.selectorGrips) r.selectorGrips[t].setAttribute("style", "cursor:" + s[o] + "-resize"), o++
          }, svgedit.select.Selector.prototype.showGrips = function(e) {
              var t = e ? "inline" : "none";
              r.selectorGripsGroup.setAttribute("display", t);
              var s = this.selectedElement;
              this.hasGrips = e, s && e && (this.selectorGroup.appendChild(r.selectorGripsGroup), this.updateGripCursors(svgedit.utilities.getRotationAngle(s)))
          }, svgedit.select.Selector.prototype.resize = function() {
              var t = this.selectorRect,
                  i = r,
                  o = i.selectorGrips,
                  l = this.selectedElement,
                  n = l.getAttribute("stroke-width"),
                  a = e.currentZoom(),
                  c = 1 / a;
              "none" === l.getAttribute("stroke") || isNaN(n) || (c += n / 2);
              var d = l.tagName;
              "text" === d && (c += 2 / a);
              var h = svgedit.transformlist.getTransformList(l),
                  p = svgedit.math.transformListToTransform(h).matrix;
              p.e *= a, p.f *= a;
              var u = svgedit.utilities.getBBox(l);
              if ("g" === d && !$.data(l, "gsvg")) {
                  var g = e.getStrokedBBox(l.childNodes);
                  g && (u = g)
              }
              var G = u.x,
                  v = u.y,
                  f = u.width,
                  b = u.height;
              u = {
                  x: G,
                  y: v,
                  width: f,
                  height: b
              }, c *= a;
              var m = svgedit.math.transformBox(G * a, v * a, f * a, b * a, p),
                  y = m.aabox,
                  x = y.x - c,
                  w = y.y - c,
                  S = y.width + 2 * c,
                  k = y.height + 2 * c,
                  C = x + S / 2,
                  B = w + k / 2,
                  M = svgedit.utilities.getRotationAngle(l);
              if (M) {
                  var A = e.svgRoot().createSVGTransform();
                  A.setRotate(-M, C, B);
                  var E = A.matrix;
                  m.tl = svgedit.math.transformPoint(m.tl.x, m.tl.y, E), m.tr = svgedit.math.transformPoint(m.tr.x, m.tr.y, E), m.bl = svgedit.math.transformPoint(m.bl.x, m.bl.y, E), m.br = svgedit.math.transformPoint(m.br.x, m.br.y, E);
                  var P = m.tl,
                      R = P.x,
                      V = P.y,
                      N = P.x,
                      z = P.y,
                      F = Math.min,
                      T = Math.max;
                  R = F(R, F(m.tr.x, F(m.bl.x, m.br.x))) - c, V = F(V, F(m.tr.y, F(m.bl.y, m.br.y))) - c, N = T(N, T(m.tr.x, T(m.bl.x, m.br.x))) + c, z = T(z, T(m.tr.y, T(m.bl.y, m.br.y))) + c, x = R, w = V, S = N - R, k = z - V
              }
              var _ = e.svgRoot().suspendRedraw(100),
                  L = "M" + x + "," + w + " L" + (x + S) + "," + w + " " + (x + S) + "," + (w + k) + " " + x + "," + (w + k) + "z";
              t.setAttribute("d", L);
              var j, W = M ? "rotate(" + [M, C, B].join(",") + ")" : "";
              for (j in this.selectorGroup.setAttribute("transform", W), this.gripCoords = {
                      nw: [x, w],
                      ne: [x + S, w],
                      sw: [x, w + k],
                      se: [x + S, w + k],
                      n: [x + S / 2, w],
                      w: [x, w + k / 2],
                      e: [x + S, w + k / 2],
                      s: [x + S / 2, w + k]
                  }, this.gripCoords) {
                  var q = this.gripCoords[j];
                  o[j].setAttribute("x", q[0] - 3), o[j].setAttribute("y", q[1] - 3)
              }
              i.rotateGripConnector.setAttribute("x1", x + S / 2), i.rotateGripConnector.setAttribute("y1", w), i.rotateGripConnector.setAttribute("x2", x + S / 2), i.rotateGripConnector.setAttribute("y2", w - 5 * s), i.rotateGrip.setAttribute("cx", x + S / 2), i.rotateGrip.setAttribute("cy", w - 5 * s), e.svgRoot().unsuspendRedraw(_)
          }, svgedit.select.SelectorManager = function() {
              this.selectorParentGroup = null, this.rubberBandBox = null, this.selectors = [], this.selectorMap = {}, this.selectorGrips = {
                  nw: null,
                  n: null,
                  ne: null,
                  e: null,
                  se: null,
                  s: null,
                  sw: null,
                  w: null
              }, this.selectorGripsGroup = null, this.rotateGripConnector = null, this.rotateGrip = null, this.initGroup()
          }, svgedit.select.SelectorManager.prototype.initGroup = function() {
              var r;
              for (r in this.selectorParentGroup && this.selectorParentGroup.parentNode && this.selectorParentGroup.parentNode.removeChild(this.selectorParentGroup), this.selectorParentGroup = e.createSVGElement({
                      element: "g",
                      attr: {
                          id: "selectorParentGroup"
                      }
                  }), this.selectorGripsGroup = e.createSVGElement({
                      element: "g",
                      attr: {
                          display: "none"
                      }
                  }), this.selectorParentGroup.appendChild(this.selectorGripsGroup), e.svgRoot().appendChild(this.selectorParentGroup), this.selectorMap = {}, this.selectors = [], this.rubberBandBox = null, this.selectorGrips) {
                  var i = e.createSVGElement({
                      element: "rect",
                      attr: {
                          id: "selectorGrip_resize_" + r,
                          width: 6,
                          height: 6,
                          "stroke-width": 1,
                          stroke: "#9ebdff",
                          fill: "#FFF",
                          style: "cursor:" + r + "-resize",
                          "pointer-events": "all"
                      }
                  });
                  $.data(i, "dir", r), $.data(i, "type", "resize"), this.selectorGrips[r] = this.selectorGripsGroup.appendChild(i)
              }
              if (this.rotateGripConnector = this.selectorGripsGroup.appendChild(e.createSVGElement({
                      element: "line",
                      attr: {
                          id: "selectorGrip_rotateconnector",
                          stroke: "#9ebdff",
                          "stroke-width": "1"
                      }
                  })), this.rotateGrip = this.selectorGripsGroup.appendChild(e.createSVGElement({
                      element: "circle",
                      attr: {
                          id: "selectorGrip_rotate",
                          fill: "lime",
                          r: s,
                          stroke: "#9ebdff",
                          "stroke-width": 1
                      }
                  })), $.data(this.rotateGrip, "type", "rotate"), !$("#canvasBackground").length) {
                  var o = t.dimensions,
                      l = e.createSVGElement({
                          element: "svg",
                          attr: {
                              id: "canvasBackground",
                              width: o[0],
                              height: o[1],
                              x: 0,
                              y: 0,
                              overflow: svgedit.browser.isWebkit() ? "none" : "visible",
                              style: "pointer-events:none"
                          }
                      }),
                      n = e.createSVGElement({
                          element: "rect",
                          attr: {
                              width: "100%",
                              height: "100%",
                              x: 0,
                              y: 0,
                              "stroke-width": 1,
                              stroke: "#000",
                              fill: "#FFF",
                              style: "pointer-events:none"
                          }
                      });
                  l.appendChild(n), e.svgRoot().insertBefore(l, e.svgContent())
              }
          }, svgedit.select.SelectorManager.prototype.requestSelector = function(e) {
              if (null == e) return null;
              var t, r = this.selectors.length;
              if ("object" == typeof this.selectorMap[e.id]) return this.selectorMap[e.id].locked = !0, this.selectorMap[e.id];
              for (t = 0; t < r; ++t)
                  if (this.selectors[t] && !this.selectors[t].locked) return this.selectors[t].locked = !0, this.selectors[t].reset(e), this.selectorMap[e.id] = this.selectors[t], this.selectors[t];
              return this.selectors[r] = new svgedit.select.Selector(r, e), this.selectorParentGroup.appendChild(this.selectors[r].selectorGroup), this.selectorMap[e.id] = this.selectors[r], this.selectors[r]
          }, svgedit.select.SelectorManager.prototype.releaseSelector = function(e) {
              if (null != e) {
                  var t, r = this.selectors.length,
                      s = this.selectorMap[e.id];
                  for (t = 0; t < r; ++t)
                      if (this.selectors[t] && this.selectors[t] == s) {
                          0 == s.locked && console.log("WARNING! selector was released but was already unlocked"), delete this.selectorMap[e.id], s.locked = !1, s.selectedElement = null, s.showGrips(!1);
                          try {
                              s.selectorGroup.setAttribute("display", "none")
                          } catch (e) {}
                          break
                      }
              }
          }, svgedit.select.SelectorManager.prototype.getRubberBandBox = function() {
              return this.rubberBandBox || (this.rubberBandBox = this.selectorParentGroup.appendChild(e.createSVGElement({
                  element: "rect",
                  attr: {
                      id: "selectorRubberBand",
                      fill: "#22C",
                      "fill-opacity": .15,
                      stroke: "#22C",
                      "stroke-width": .5,
                      display: "none",
                      style: "pointer-events:none"
                  }
              }))), this.rubberBandBox
          }, svgedit.select.init = function(s, i) {
              t = s, e = i, r = new svgedit.select.SelectorManager
          }, svgedit.select.getSelectorManager = function() {
              return r
          }
      }
  }
}();
var svgedit = svgedit || {};
(function() {
