  svgedit.path || (svgedit.path = {});
  var u = svgedit.NS,
      l = {
          pathNodeTooltip: "Drag node to move it. Double-click node to change segment type",
          pathCtrlPtTooltip: "Drag control point to adjust curve properties"
      },
      a = {
          2: ["x", "y"],
          4: ["x", "y"],
          6: ["x", "y", "x1", "y1", "x2", "y2"],
          8: ["x", "y", "x1", "y1"],
          10: ["x", "y", "r1", "r2", "angle", "largeArcFlag", "sweepFlag"],
          12: ["x"],
          14: ["y"],
          16: ["x", "y", "x2", "y2"],
          18: ["x", "y"]
      },
      s = [],
      c = !0,
      f = {};
  svgedit.path.setLinkControlPoints = function(n) {
      c = n
  };
  svgedit.path.path = null;
  n = null;
  svgedit.path.init = function(t) {
      n = t;
      s = [0, "ClosePath"];
      $.each(["Moveto", "Lineto", "CurvetoCubic", "CurvetoQuadratic", "Arc", "LinetoHorizontal", "LinetoVertical", "CurvetoCubicSmooth", "CurvetoQuadraticSmooth"], function(n, t) {
          s.push(t + "Abs");
          s.push(t + "Rel")
      })
  };
  svgedit.path.insertItemBefore = function(n, t, i) {
      var u = n.pathSegList,
          f, e, r, o;
      if (svgedit.browser.supportsPathInsertItemBefore()) {
          u.insertItemBefore(t, i);
          return
      }
      for (f = u.numberOfItems, e = [], r = 0; r < f; r++) o = u.getItem(r), e.push(o);
      for (u.clear(), r = 0; r < f; r++) r == i && u.appendItem(t), u.appendItem(e[r])
  };
  svgedit.path.ptObjToArr = function(n, t) {
      for (var r = a[n], f = r.length, u = [], i = 0; i < f; i++) u[i] = t[r[i]];
      return u
  };
  svgedit.path.getGripPt = function(t, i) {
      var r = {
              x: i ? i.x : t.item.x,
              y: i ? i.y : t.item.y
          },
          u = t.path,
          f;
      return u.matrix && (f = svgedit.math.transformPoint(r.x, r.y, u.matrix), r = f), r.x *= n.getCurrentZoom(), r.y *= n.getCurrentZoom(), r
  };
  svgedit.path.getPointFromGrip = function(t, i) {
      var r = {
          x: t.x,
          y: t.y
      };
      return i.matrix && (t = svgedit.math.transformPoint(r.x, r.y, i.imatrix), r.x = t.x, r.y = t.y), r.x /= n.getCurrentZoom(), r.y /= n.getCurrentZoom(), r
  };
  svgedit.path.addPointGrip = function(n, t, i) {
      var e = svgedit.path.getGripContainer(),
          r = svgedit.utilities.getElem("pathpointgrip_" + n),
          f;
      return r || (r = document.createElementNS(u.SVG, "circle"), svgedit.utilities.assignAttributes(r, {
          id: "pathpointgrip_" + n,
          display: "none",
          r: 4,
          fill: "#0FF",
          stroke: "#00F",
          "stroke-width": 2,
          cursor: "move",
          style: "pointer-events:all",
          "xlink:title": l.pathNodeTooltip
      }), r = e.appendChild(r), f = $("#pathpointgrip_" + n), f.dblclick(function() {
          svgedit.path.path && svgedit.path.path.setSegType()
      })), t && i && svgedit.utilities.assignAttributes(r, {
          cx: t,
          cy: i,
          display: "inline"
      }), r
  };
  svgedit.path.getGripContainer = function() {
      var n = svgedit.utilities.getElem("pathpointgrip_container"),
          t;
      return n || (t = svgedit.utilities.getElem("selectorParentGroup"), n = t.appendChild(document.createElementNS(u.SVG, "g")), n.id = "pathpointgrip_container"), n
  };
  svgedit.path.addCtrlGrip = function(n) {
      var t = svgedit.utilities.getElem("ctrlpointgrip_" + n);
      return t ? t : (t = document.createElementNS(u.SVG, "circle"), svgedit.utilities.assignAttributes(t, {
          id: "ctrlpointgrip_" + n,
          display: "none",
          r: 4,
          fill: "#0FF",
          stroke: "#55F",
          "stroke-width": 1,
          cursor: "move",
          style: "pointer-events:all",
          "xlink:title": l.pathCtrlPtTooltip
      }), svgedit.path.getGripContainer().appendChild(t), t)
  };
  svgedit.path.getCtrlLine = function(n) {
      var t = svgedit.utilities.getElem("ctrlLine_" + n);
      return t ? t : (t = document.createElementNS(u.SVG, "line"), svgedit.utilities.assignAttributes(t, {
          id: "ctrlLine_" + n,
          stroke: "#555",
          "stroke-width": 1,
          style: "pointer-events:none"
      }), svgedit.path.getGripContainer().appendChild(t), t)
  };
  svgedit.path.getPointGrip = function(n, t) {
      var u = n.index,
          r = svgedit.path.addPointGrip(u),
          i;
      return t && (i = svgedit.path.getGripPt(n), svgedit.utilities.assignAttributes(r, {
          cx: i.x,
          cy: i.y,
          display: "inline"
      })), r
  };
  svgedit.path.getControlPoints = function(n) {
      var i = n.item,
          e = n.index,
          f;
      if (!("x1" in i) || !("x2" in i)) return null;
      for (var r = {}, a = svgedit.path.getGripContainer(), l = svgedit.path.path.segs[e - 1].item, o = [l, i], t = 1; t < 3; t++) {
          var s = e + "c" + t,
              h = r["c" + t + "_line"] = svgedit.path.getCtrlLine(s),
              u = svgedit.path.getGripPt(n, {
                  x: i["x" + t],
                  y: i["y" + t]
              }),
              c = svgedit.path.getGripPt(n, {
                  x: o[t - 1].x,
                  y: o[t - 1].y
              });
          svgedit.utilities.assignAttributes(h, {
              x1: u.x,
              y1: u.y,
              x2: c.x,
              y2: c.y,
              display: "inline"
          });
          r["c" + t + "_line"] = h;
          f = r["c" + t] = svgedit.path.addCtrlGrip(s);
          svgedit.utilities.assignAttributes(f, {
              cx: u.x,
              cy: u.y,
              display: "inline"
          });
          r["c" + t] = f
      }
      return r
  };
  svgedit.path.replacePathSeg = function(n, t, i, r) {
      var e = r || svgedit.path.path.elem,
          a = "createSVGPathSeg" + s[n],
          o = e[a].apply(e, i),
          l;
      if (svgedit.browser.supportsPathReplaceItem()) e.pathSegList.replaceItem(o, t);
      else {
          for (var f = e.pathSegList, h = f.numberOfItems, c = [], u = 0; u < h; u++) l = f.getItem(u), c.push(l);
          for (f.clear(), u = 0; u < h; u++) u == t ? f.appendItem(o) : f.appendItem(c[u])
      }
  };
  svgedit.path.getSegSelector = function(n, t) {
      var s = n.index,
          i = svgedit.utilities.getElem("segline_" + s),
          h, o, e, r, f;
      if (i || (h = svgedit.path.getGripContainer(), i = document.createElementNS(u.SVG, "path"), svgedit.utilities.assignAttributes(i, {
              id: "segline_" + s,
              display: "none",
              fill: "none",
              stroke: "#0FF",
              "stroke-width": 2,
              style: "pointer-events:none",
              d: "M0,0 0,0"
          }), h.appendChild(i)), t) {
          if (o = n.prev, !o) return i.setAttribute("display", "none"), i;
          for (e = svgedit.path.getGripPt(o), svgedit.path.replacePathSeg(2, 0, [e.x, e.y], i), r = svgedit.path.ptObjToArr(n.type, n.item, !0), f = 0; f < r.length; f += 2) e = svgedit.path.getGripPt(n, {
              x: r[f],
              y: r[f + 1]
          }), r[f] = e.x, r[f + 1] = e.y;
          svgedit.path.replacePathSeg(n.type, 1, r, i)
      }
      return i
  };
  svgedit.path.smoothControlPoints = function(t, i, r) {
      var s = t.x - r.x,
          h = t.y - r.y,
          c = i.x - r.x,
          l = i.y - r.y,
          o, u, a, v;
      if ((s != 0 || h != 0) && (c != 0 || l != 0)) {
          var f = Math.atan2(h, s),
              e = Math.atan2(l, c),
              w = Math.sqrt(s * s + h * h),
              b = Math.sqrt(c * c + l * l),
              y = n.getSVGRoot().createSVGPoint(),
              p = n.getSVGRoot().createSVGPoint();
          return f < 0 && (f += 2 * Math.PI), e < 0 && (e += 2 * Math.PI), o = Math.abs(f - e), u = Math.abs(Math.PI - o) / 2, f - e > 0 ? (a = o < Math.PI ? f + u : f - u, v = o < Math.PI ? e - u : e + u) : (a = o < Math.PI ? f - u : f + u, v = o < Math.PI ? e + u : e - u), y.x = w * Math.cos(a) + r.x, y.y = w * Math.sin(a) + r.y, p.x = b * Math.cos(v) + r.x, p.y = b * Math.sin(v) + r.y, [y, p]
      }
      return undefined
  };
  svgedit.path.Segment = function(n, t) {
      this.selected = !1;
      this.index = n;
      this.item = t;
      this.type = t.pathSegType;
      this.ctrlpts = [];
      this.ptgrip = null;
      this.segsel = null
  };
  svgedit.path.Segment.prototype.showCtrlPts = function(n) {
      for (var t in this.ctrlpts) this.ctrlpts.hasOwnProperty(t) && this.ctrlpts[t].setAttribute("display", n ? "inline" : "none")
  };
  svgedit.path.Segment.prototype.selectCtrls = function(n) {
      $("#ctrlpointgrip_" + this.index + "c1, #ctrlpointgrip_" + this.index + "c2").attr("fill", n ? "#0FF" : "#EEE")
  };
  svgedit.path.Segment.prototype.show = function(n) {
      this.ptgrip && (this.ptgrip.setAttribute("display", n ? "inline" : "none"), this.segsel.setAttribute("display", n ? "inline" : "none"), this.showCtrlPts(n))
  };
  svgedit.path.Segment.prototype.select = function(n) {
      this.ptgrip && (this.ptgrip.setAttribute("stroke", n ? "#0FF" : "#00F"), this.segsel.setAttribute("display", n ? "inline" : "none"), this.ctrlpts && this.selectCtrls(n), this.selected = n)
  };
  svgedit.path.Segment.prototype.addGrip = function() {
      this.ptgrip = svgedit.path.getPointGrip(this, !0);
      this.ctrlpts = svgedit.path.getControlPoints(this, !0);
      this.segsel = svgedit.path.getSegSelector(this, !0)
  };
  svgedit.path.Segment.prototype.update = function(n) {
      if (this.ptgrip) {
          var t = svgedit.path.getGripPt(this);
          svgedit.utilities.assignAttributes(this.ptgrip, {
              cx: t.x,
              cy: t.y
          });
          svgedit.path.getSegSelector(this, !0);
          this.ctrlpts && (n && (this.item = svgedit.path.path.elem.pathSegList.getItem(this.index), this.type = this.item.pathSegType), svgedit.path.getControlPoints(this))
      }
  };
  svgedit.path.Segment.prototype.move = function(n, t) {
      var f, u = this.item,
          i = $.extend({}, u),
          r, e, o;
      f = this.ctrlpts ? [i.x += n, i.y += t, i.x1, i.y1, i.x2 += n, i.y2 += t] : [i.x += n, i.y += t];
      svgedit.path.replacePathSeg(this.type, this.index, f);
      this.next && this.next.ctrlpts && (r = this.next.item, e = [r.x, r.y, r.x1 += n, r.y1 += t, r.x2, r.y2], svgedit.path.replacePathSeg(this.next.type, this.next.index, e));
      this.mate && (u = this.mate.item, o = [u.x += n, u.y += t], svgedit.path.replacePathSeg(this.mate.type, this.mate.index, o));
      this.update(!0);
      this.next && this.next.update(!0)
  };
  svgedit.path.Segment.prototype.setLinked = function(n) {
      var t, u, r, f, i, e;
      if (n == 2) {
          if (u = 1, t = this.next, !t) return;
          r = this.item
      } else {
          if (u = 2, t = this.prev, !t) return;
          r = t.item
      }
      f = t.item;
      i = $.extend({}, f);
      i["x" + u] = r.x + (r.x - this.item["x" + n]);
      i["y" + u] = r.y + (r.y - this.item["y" + n]);
      e = [i.x, i.y, i.x1, i.y1, i.x2, i.y2];
      svgedit.path.replacePathSeg(t.type, t.index, e);
      t.update(!0)
  };
  svgedit.path.Segment.prototype.moveCtrl = function(n, t, i) {
      var f = this.item,
          r = $.extend({}, f),
          u;
      r["x" + n] += t;
      r["y" + n] += i;
      u = [r.x, r.y, r.x1, r.y1, r.x2, r.y2];
      svgedit.path.replacePathSeg(this.type, this.index, u);
      this.update(!0)
  };
  svgedit.path.Segment.prototype.setType = function(n, t) {
      svgedit.path.replacePathSeg(n, this.index, t);
      this.type = n;
      this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
      this.showCtrlPts(n === 6);
      this.ctrlpts = svgedit.path.getControlPoints(this);
      this.update(!0)
  };
  svgedit.path.Path = function(n) {
      if (!n || n.tagName !== "path") throw "svgedit.path.Path constructed without a <path> element";
      this.elem = n;
      this.segs = [];
      this.selected_pts = [];
      svgedit.path.path = this;
      this.init()
  };
  svgedit.path.Path.prototype.init = function() {
      var o, e, n, h, s, i, u;
      for ($(svgedit.path.getGripContainer()).find("*").each(function() {
              $(this).attr("display", "none")
          }), o = this.elem.pathSegList, e = o.numberOfItems, this.segs = [], this.selected_pts = [], this.first_seg = null, n = 0; n < e; n++) h = o.getItem(n), s = new svgedit.path.Segment(n, h), s.path = this, this.segs.push(s);
      for (i = this.segs, u = null, n = 0; n < e; n++) {
          var t = i[n],
              f = n + 1 >= e ? null : i[n + 1],
              c = n - 1 < 0 ? null : i[n - 1],
              r;
          t.type === 2 ? (c && c.type !== 1 && (r = i[u], r.next = i[u + 1], r.next.prev = r, r.addGrip()), u = n) : f && f.type === 1 ? (t.next = i[u + 1], t.next.prev = t, t.mate = i[u], t.addGrip(), this.first_seg == null && (this.first_seg = t)) : f ? t.type !== 1 && (t.addGrip(), f && f.type !== 2 && (t.next = f, t.next.prev = t)) : t.type !== 1 && (r = i[u], r.next = i[u + 1], r.next.prev = r, r.addGrip(), t.addGrip(), this.first_seg || (this.first_seg = i[u]))
      }
      return this
  };
  svgedit.path.Path.prototype.eachSeg = function(n) {
      for (var r = this.segs.length, i, t = 0; t < r; t++)
          if (i = n.call(this.segs[t], t), i === !1) break
  };
  svgedit.path.Path.prototype.addSeg = function(n) {
      var t = this.segs[n],
          i, f, r, u, w;
      if (t.prev) {
          i = t.prev;
          switch (t.item.pathSegType) {
              case 4:
                  r = (t.item.x + i.item.x) / 2;
                  u = (t.item.y + i.item.y) / 2;
                  f = this.elem.createSVGPathSegLinetoAbs(r, u);
                  break;
              case 6:
                  var e = (i.item.x + t.item.x1) / 2,
                      o = (t.item.x1 + t.item.x2) / 2,
                      s = (t.item.x2 + t.item.x) / 2,
                      h = (e + o) / 2,
                      c = (o + s) / 2;
                  r = (h + c) / 2;
                  var l = (i.item.y + t.item.y1) / 2,
                      a = (t.item.y1 + t.item.y2) / 2,
                      v = (t.item.y2 + t.item.y) / 2,
                      y = (l + a) / 2,
                      p = (a + v) / 2;
                  u = (y + p) / 2;
                  f = this.elem.createSVGPathSegCurvetoCubicAbs(r, u, e, l, h, y);
                  w = [t.item.x, t.item.y, c, p, s, v];
                  svgedit.path.replacePathSeg(t.type, n, w)
          }
          svgedit.path.insertItemBefore(this.elem, f, n)
      }
  };
  svgedit.path.Path.prototype.deleteSeg = function(n) {
      var t = this.segs[n],
          u = this.elem.pathSegList,
          i, r, f;
      t.show(!1);
      i = t.next;
      t.mate ? (r = [i.item.x, i.item.y], svgedit.path.replacePathSeg(2, i.index, r), svgedit.path.replacePathSeg(4, t.index, r), u.removeItem(t.mate.index)) : t.prev ? u.removeItem(n) : (f = t.item, r = [i.item.x, i.item.y], svgedit.path.replacePathSeg(2, t.next.index, r), u.removeItem(n))
  };
  svgedit.path.Path.prototype.subpathIsClosed = function(n) {
      var t = !1;
      return svgedit.path.path.eachSeg(function(i) {
          return i <= n ? !0 : this.type === 2 ? !1 : this.type === 1 ? (t = !0, !1) : void 0
      }), t
  };
  svgedit.path.Path.prototype.removePtFromSelection = function(n) {
      var t = this.selected_pts.indexOf(n);
      t != -1 && (this.segs[n].select(!1), this.selected_pts.splice(t, 1))
  };
  svgedit.path.Path.prototype.clearSelection = function() {
      this.eachSeg(function() {
          this.select(!1)
      });
      this.selected_pts = []
  };
  svgedit.path.Path.prototype.storeD = function() {
      this.last_d = this.elem.getAttribute("d")
  };
  svgedit.path.Path.prototype.show = function(n) {
      return this.eachSeg(function() {
          this.show(n)
      }), n && this.selectPt(this.first_seg.index), this
  };
  svgedit.path.Path.prototype.movePts = function(n, t) {
      for (var i = this.selected_pts.length, r; i--;) r = this.segs[this.selected_pts[i]], r.move(n, t)
  };
  svgedit.path.Path.prototype.moveCtrl = function(n, t) {
      var i = this.segs[this.selected_pts[0]];
      i.moveCtrl(this.dragctrl, n, t);
      c && i.setLinked(this.dragctrl)
  };
  svgedit.path.Path.prototype.setSegType = function(n) {
      var e, s, h, u;
      for (this.storeD(), e = this.selected_pts.length; e--;) {
          var y = this.selected_pts[e],
              t = this.segs[y],
              o = t.prev;
          if (o) {
              n || (s = "Toggle Path Segment Type", h = t.type, n = h == 6 ? 4 : 6);
              n = Number(n);
              var i = t.item.x,
                  r = t.item.y,
                  c = o.item.x,
                  l = o.item.y,
                  f;
              switch (n) {
                  case 6:
                      if (t.olditem) u = t.olditem, f = [i, r, u.x1, u.y1, u.x2, u.y2];
                      else {
                          var a = i - c,
                              v = r - l,
                              p = c + a / 3,
                              w = l + v / 3,
                              b = i - a / 3,
                              k = r - v / 3;
                          f = [i, r, p, w, b, k]
                      }
                      break;
                  case 4:
                      f = [i, r];
                      t.olditem = t.item
              }
              t.setType(n, f)
          }
      }
      svgedit.path.path.endChanges(s)
  };
  svgedit.path.Path.prototype.selectPt = function(n, t) {
      this.clearSelection();
      n == null && this.eachSeg(function(t) {
          this.prev && (n = t)
      });
      this.addPtsToSelection(n);
      t && (this.dragctrl = t, c && this.segs[n].setLinked(t))
  };
  svgedit.path.Path.prototype.update = function() {
      var n = this.elem;
      return svgedit.utilities.getRotationAngle(n) ? (this.matrix = svgedit.math.getMatrix(n), this.imatrix = this.matrix.inverse()) : (this.matrix = null, this.imatrix = null), this.eachSeg(function(t) {
          this.item = n.pathSegList.getItem(t);
          this.update()
      }), this
  };
  svgedit.path.getPath_ = function(n) {
      var t = f[n.id];
      return t || (t = f[n.id] = new svgedit.path.Path(n)), t
  };
  svgedit.path.removePath_ = function(n) {
      n in f && delete f[n]
  };
  h = function(n, u) {
      var f = n - e,
          s = u - o,
          h = Math.sqrt(f * f + s * s),
          c = Math.atan2(s, f) + r;
      return f = h * Math.cos(c) + e, s = h * Math.sin(c) + o, f -= t, s -= i, h = Math.sqrt(f * f + s * s), c = Math.atan2(s, f) - r, {
          x: h * Math.cos(c) + t,
          y: h * Math.sin(c) + i
      }
  };
  svgedit.path.recalcRotatedPath = function() {
      var f = svgedit.path.path.elem,
          u, s, y, c, n, p, w, l, b, k, d, tt;
      if (r = svgedit.utilities.getRotationAngle(f, !0), r) {
          u = svgedit.utilities.getBBox(f);
          s = svgedit.path.path.oldbbox;
          e = s.x + s.width / 2;
          o = s.y + s.height / 2;
          t = u.x + u.width / 2;
          i = u.y + u.height / 2;
          var a = t - e,
              v = i - o,
              g = Math.sqrt(a * a + v * v),
              nt = Math.atan2(v, a) + r;
          for (t = g * Math.cos(nt) + e, i = g * Math.sin(nt) + o, y = f.pathSegList, c = y.numberOfItems; c;)(c -= 1, n = y.getItem(c), p = n.pathSegType, p != 1) && (w = h(n.x, n.y), l = [w.x, w.y], n.x1 != null && n.x2 != null && (b = h(n.x1, n.y1), k = h(n.x2, n.y2), l.splice(l.length, 0, b.x, b.y, k.x, k.y)), svgedit.path.replacePathSeg(p, c, l));
          u = svgedit.utilities.getBBox(f);
          d = svgroot.createSVGTransform();
          tt = svgedit.transformlist.getTransformList(f);
          d.setRotate(r * 180 / Math.PI, t, i);
          tt.replaceItem(d, 0)
      }
  };
  svgedit.path.clearData = function() {
      f = {}
  }
})();
var mydraw = function() {
  "use strict";
  return {
      initDraw: function() {
          svgedit.draw || (svgedit.draw = {});
          var e = svgedit.NS,
              t = "a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use".split(","),
              r = {
                  LET_DOCUMENT_DECIDE: 0,
                  ALWAYS_RANDOMIZE: 1,
                  NEVER_RANDOMIZE: 2
              },
              i = r.LET_DOCUMENT_DECIDE;
          svgedit.draw.Layer = function(e, t) {
              this.name_ = e, this.group_ = t
          }, svgedit.draw.Layer.prototype.getName = function() {
              return this.name_
          }, svgedit.draw.Layer.prototype.getGroup = function() {
              return this.group_
          }, svgedit.draw.randomizeIds = function(e, t) {
              i = !1 === e ? r.NEVER_RANDOMIZE : r.ALWAYS_RANDOMIZE, i != r.ALWAYS_RANDOMIZE || t.getNonce() ? i == r.NEVER_RANDOMIZE && t.getNonce() && t.clearNonce() : t.setNonce(Math.floor(100001 * Math.random()))
          }, svgedit.draw.Drawing = function(t, n) {
              if (!t || !t.tagName || !t.namespaceURI || "svg" != t.tagName || t.namespaceURI != e.SVG) throw "Error: draw.Drawing instance initialized without a <svg> element";
              this.svgElem_ = t, this.obj_num = 0, this.idPrefix = n || "svg_", this.releasedNums = [], this.all_layers = [], this.current_layer = null, this.nonce_ = "";
              var a = this.svgElem_.getAttributeNS(e.SE, "nonce");
              a && i != r.NEVER_RANDOMIZE ? this.nonce_ = a : i == r.ALWAYS_RANDOMIZE && this.setNonce(Math.floor(100001 * Math.random()))
          }, svgedit.draw.Drawing.prototype.getElem_ = function(e) {
              return this.svgElem_.querySelector ? this.svgElem_.querySelector("#" + e) : $(this.svgElem_).find("[id=" + e + "]")[0]
          }, svgedit.draw.Drawing.prototype.getSvgElem = function() {
              return this.svgElem_
          }, svgedit.draw.Drawing.prototype.getNonce = function() {
              return this.nonce_
          }, svgedit.draw.Drawing.prototype.setNonce = function(t) {
              this.svgElem_.setAttributeNS(e.XMLNS, "xmlns:se", e.SE), this.svgElem_.setAttributeNS(e.SE, "se:nonce", t), this.nonce_ = t
          }, svgedit.draw.Drawing.prototype.clearNonce = function() {
              this.nonce_ = ""
          }, svgedit.draw.Drawing.prototype.getId = function() {
              return this.nonce_ ? this.idPrefix + this.nonce_ + "_" + this.obj_num : this.idPrefix + this.obj_num
          }, svgedit.draw.Drawing.prototype.getNextId = function() {
              var e, t, r = "";
              for (e = 0; e < 16; e++) t = 16 * Math.random() | 0, 8 == e && (r += "-"), r += (12 == e ? 4 : 16 == e ? 3 & t | 8 : t).toString(16);
              this.obj_num = r;
              var i = this.getId();
              return i
          }, svgedit.draw.Drawing.prototype.releaseId = function(e) {
              var t = this.idPrefix + (this.nonce_ ? this.nonce_ + "_" : "");
              if ("string" != typeof e || 0 !== e.indexOf(t)) return !1;
              var r = parseInt(e.substr(t.length), 10);
              return !("number" != typeof r || r <= 0 || -1 != this.releasedNums.indexOf(r)) && (this.releasedNums.push(r), !0)
          }, svgedit.draw.Drawing.prototype.getNumLayers = function() {
              return this.all_layers.length
          }, svgedit.draw.Drawing.prototype.hasLayer = function(e) {
              var t;
              for (t = 0; t < this.getNumLayers(); t++)
                  if (this.all_layers[t][0] == e) return !0;
              return !1
          }, svgedit.draw.Drawing.prototype.getLayerName = function(e) {
              return e >= 0 && e < this.getNumLayers() ? this.all_layers[e][0] : ""
          }, svgedit.draw.Drawing.prototype.getCurrentLayer = function() {
              return this.current_layer
          }, svgedit.draw.Drawing.prototype.getCurrentLayerName = function() {
              var e;
              for (e = 0; e < this.getNumLayers(); ++e)
                  if (this.all_layers[e][1] == this.current_layer) return this.getLayerName(e);
              return ""
          }, svgedit.draw.Drawing.prototype.setCurrentLayer = function(e) {
              var t;
              for (t = 0; t < this.getNumLayers(); ++t)
                  if (e == this.getLayerName(t)) return this.current_layer != this.all_layers[t][1] && (this.current_layer.setAttribute("style", "pointer-events:none"), this.current_layer = this.all_layers[t][1], this.current_layer.setAttribute("style", "pointer-events:all")), !0;
              return !1
          }, svgedit.draw.Drawing.prototype.deleteCurrentLayer = function() {
              if (this.current_layer && this.getNumLayers() > 1) {
                  var e = this.current_layer.parentNode,
                      t = (this.current_layer.nextSibling, e.removeChild(this.current_layer));
                  return this.identifyLayers(), t
              }
              return null
          }, svgedit.draw.Drawing.prototype.identifyLayers = function() {
              this.all_layers = [];
              var r, i = this.svgElem_.childNodes.length,
                  n = [],
                  a = [],
                  s = null,
                  o = !1;
              for (r = 0; r < i; ++r) {
                  var l = this.svgElem_.childNodes.item(r);
                  if (l && 1 == l.nodeType)
                      if ("g" == l.tagName) {
                          o = !0;
                          var u = $("title", l).text();
                          !u && svgedit.browser.isOpera() && l.querySelectorAll && (u = $(l.querySelectorAll("title")).text()), u ? (a.push(u), this.all_layers.push([u, l]), s = l, svgedit.utilities.walkTree(l, function(e) {
                              e.parentNode && "foreignObject" === e.parentNode.nodeName || e.setAttribute("style", "pointer-events:inherit")
                          }), s.setAttribute("style", "pointer-events:none")) : n.push(l)
                      } else if (~t.indexOf(l.nodeName)) {
                      svgedit.utilities.getBBox(l);
                      n.push(l)
                  }
              }
              var g = this.svgElem_.ownerDocument;
              if (n.length > 0 || !o) {
                  for (r = 1; a.indexOf("Layer " + r) >= 0;) r++;
                  var d = "Layer " + r;
                  s = g.createElementNS(e.SVG, "g");
                  var y, h = g.createElementNS(e.SVG, "title");
                  for (h.textContent = d, s.appendChild(h), y = 0; y < n.length; ++y) s.appendChild(n[y]);
                  this.svgElem_.appendChild(s), this.all_layers.push([d, s])
              }
              svgedit.utilities.walkTree(s, function(e) {
                  e.parentNode && "foreignObject" === e.parentNode.nodeName || e.setAttribute("style", "pointer-events:inherit")
              }), this.current_layer = s, this.current_layer.setAttribute("style", "pointer-events:all")
          }, svgedit.draw.Drawing.prototype.createLayer = function(t) {
              var r = this.svgElem_.ownerDocument,
                  i = r.createElementNS(e.SVG, "g"),
                  n = r.createElementNS(e.SVG, "title");
              return n.textContent = t, i.appendChild(n), this.svgElem_.appendChild(i), this.identifyLayers(), i
          }, svgedit.draw.Drawing.prototype.getLayerVisibility = function(e) {
              var t, r = null;
              for (t = 0; t < this.getNumLayers(); ++t)
                  if (this.getLayerName(t) == e) {
                      r = this.all_layers[t][1];
                      break
                  } return !!r && "none" !== r.getAttribute("display")
          }, svgedit.draw.Drawing.prototype.setLayerVisibility = function(e, t) {
              if ("boolean" != typeof t) return null;
              var r, i = null;
              for (r = 0; r < this.getNumLayers(); ++r)
                  if (this.getLayerName(r) == e) {
                      i = this.all_layers[r][1];
                      break
                  } if (!i) return null;
              var n = i.getAttribute("display");
              return n || (n = "inline"), i.setAttribute("display", t ? "inline" : "none"), i
          }, svgedit.draw.Drawing.prototype.getLayerOpacity = function(e) {
              var t;
              for (t = 0; t < this.getNumLayers(); ++t)
                  if (this.getLayerName(t) == e) {
                      var r = this.all_layers[t][1],
                          i = r.getAttribute("opacity");
                      return i || (i = "1.0"), parseFloat(i)
                  } return null
          }, svgedit.draw.Drawing.prototype.setLayerOpacity = function(e, t) {
              var r;
              if (!("number" != typeof t || t < 0 || t > 1))
                  for (r = 0; r < this.getNumLayers(); ++r)
                      if (this.getLayerName(r) == e) {
                          var i = this.all_layers[r][1];
                          i.setAttribute("opacity", t);
                          break
                      }
          }
      }
  }
}();
var svgedit = svgedit || {};
(function() {
  window.initContextmenu = function() {
      var n = this;
      svgedit.contextmenu || (svgedit.contextmenu = {}), n.contextMenuExtensions = {};
      var e = function(n) {
              return n && n.id && n.label && n.action && "function" == typeof n.action
          },
          t = function(t) {
              return e(t) ? t.id in n.contextMenuExtensions ? void console.error('Cannot add extension "' + t.id + '", an extension by that name already exists"') : (console.log("Registed contextmenu item: {id:" + t.id + ", label:" + t.label + "}"), void(n.contextMenuExtensions[t.id] = t)) : void console.error("Menu items must be defined and have at least properties: id, label, action, where action must be a function")
          },
          o = function(e) {
              return n.contextMenuExtensions[e] && !0
          },
          i = function(e) {
              return n.contextMenuExtensions[e].action
          },
          s = function(n) {};
      svgEditor.ready(function() {
          var n;
          for (n in contextMenuExtensions) s(contextMenuExtensions[n])
      }), svgedit.contextmenu.resetCustomMenus = function() {
          n.contextMenuExtensions = {}
      }, svgedit.contextmenu.add = t, svgedit.contextmenu.hasCustomHandler = o, svgedit.contextmenu.getCustomHandler = i
  }
})();
var mysvgcanvas = {
  initSvgCanvas: function(e) {
      window.console || (window.console = {}, window.console.log = function(e) {}, window.console.dir = function(e) {}), window.opera && (window.console.log = function(e) {
          opera.postError(e)
      }, window.console.dir = function(e) {})
  }
};
$.SvgCanvas = function(e, t) {
  function i() {
      ke();
      var e = [],
          t = {
              feGaussianBlur: Z.exportNoBlur,
              foreignObject: Z.exportNoforeignObject,
              "[stroke-dasharray]": Z.exportNoDashArray
          },
          i = $(m);
      return "font" in $("<canvas>")[0].getContext("2d") || (t.text = Z.exportNoText), $.each(t, function(t, r) {
          i.find(t).length && e.push(r)
      }), e
  }

  function r(e, t) {
      var i, r = svgedit.utilities.getBBox(e);
      for (i = 0; i < 2; i++) {
          var n = 0 === i ? "fill" : "stroke",
              a = e.getAttribute(n);
          if (a && 0 === a.indexOf("url(")) {
              var s = svgedit.utilities.getRefElem(a);
              if ("linearGradient" === s.tagName) {
                  var o = s.getAttribute("x1") || 0,
                      l = s.getAttribute("y1") || 0,
                      d = s.getAttribute("x2") || 1,
                      u = s.getAttribute("y2") || 0;
                  o = r.width * o + r.x, l = r.height * l + r.y, d = r.width * d + r.x, u = r.height * u + r.y;
                  var g = svgedit.math.transformPoint(o, l, t),
                      h = svgedit.math.transformPoint(d, u, t),
                      m = {};
                  m.x1 = (g.x - r.x) / r.width, m.y1 = (g.y - r.y) / r.height, m.x2 = (h.x - r.x) / r.width, m.y2 = (h.y - r.y) / r.height;
                  var c = s.cloneNode(!0);
                  $(c).attr(m), c.id = he(), svgedit.utilities.findDefs().appendChild(c), e.setAttribute(n, "url(#" + c.id + ")")
              }
          }
      }
  }
  var n = svgedit.NS,
      a = {
          show_outside_canvas: !0,
          selectNew: !0,
          dimensions: [640, 480]
      };
  t && $.extend(a, t);
  var s = a.dimensions,
      o = this,
      l = [],
      d = !1,
      u = new Date(17578008e5),
      g = e.ownerDocument,
      h = g.importNode(svgedit.utilities.text2xml('<svg id="svgroot" xmlns="' + n.SVG + '" xlinkns="' + n.XLINK + '" width="' + s[0] + '" height="' + s[1] + '" x="' + s[0] + '" y="' + s[1] + '" overflow="visible"><defs><filter id="canvashadow" filterUnits="objectBoundingBox"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feOffset in="blur" dx="5" dy="5" result="offsetBlur"/><feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs></svg>').documentElement, !0);
  e.appendChild(h);
  var m = g.createElementNS(n.SVG, "svg"),
      c = o.clearSvgContentElement = function() {
          for (; m.firstChild;) m.removeChild(m.firstChild);
          $(m).attr({
              id: "svgcontent",
              width: s[0],
              height: s[1],
              x: s[0],
              y: s[1],
              overflow: a.show_outside_canvas ? "visible" : "hidden",
              xmlns: n.SVG,
              "xmlns:se": n.SE,
              "xmlns:xlink": n.XLINK
          }).appendTo(h);
          var e = g.createComment(" Created with wux-editor ");
          m.appendChild(e)
      };
  c();
  var v = "svg_";
  o.setIdPrefix = function(e) {
      v = e
  }, o.current_drawing_ = new svgedit.draw.Drawing(m, v);
  var f = o.getCurrentDrawing = function() {
          return o.current_drawing_
      },
      p = 1,
      b = null,
      S = {
          shape: {
              fill: ("none" == a.initFill.color ? "" : "#") + a.initFill.color,
              fill_paint: null,
              fill_opacity: a.initFill.opacity,
              stroke: "#" + a.initStroke.color,
              stroke_paint: null,
              stroke_opacity: a.initStroke.opacity,
              stroke_width: a.initStroke.width,
              stroke_dasharray: "none",
              stroke_linejoin: "miter",
              stroke_linecap: "butt",
              opacity: a.initOpacity
          }
      };
  S.text = $.extend(!0, {}, S.shape), $.extend(S.text, {
      fill: "#000000",
      stroke_width: 0,
      font_size: 14,
      font_family: "sans-serif",
      text_anchor: "middle"
  });
  var C = S.shape,
      w = new Array(1),
      _ = this.addSvgElementFromJson = function(e) {
          var t = svgedit.utilities.getElem(e.attr.id),
              i = f().getCurrentLayer();
          return t && e.element != t.tagName && (i.removeChild(t), t = null), t || (t = g.createElementNS(n.SVG, e.element), i && (b || i).appendChild(t)), e.curStyles && svgedit.utilities.assignAttributes(t, {
              fill: C.fill,
              stroke: C.stroke,
              "stroke-width": C.stroke_width,
              "stroke-dasharray": C.stroke_dasharray,
              "stroke-linejoin": C.stroke_linejoin,
              "stroke-linecap": C.stroke_linecap,
              "stroke-opacity": C.stroke_opacity,
              "fill-opacity": C.fill_opacity,
              opacity: C.opacity / 2,
              style: "pointer-events:inherit"
          }, 100), svgedit.utilities.assignAttributes(t, e.attr, 100), svgedit.utilities.cleanupElement(t), t
      },
      N = this.addSvgGroupFromJson = function(e) {
          var t = svgedit.utilities.getElem(e.id),
              i = f().getCurrentLayer();
          t && e.group != t.tagName && (i.removeChild(t), t = null), t || (t = g.createElementNS(n.SVG, e.group), t.setAttribute("id", e.id), t.setAttribute("type", e.type), i && (b || i).appendChild(t));
          for (var r = 0; r < e.elements.length; r++) {
              var a = g.createElementNS(n.SVG, e.elements[r].type);
              if (svgedit.utilities.assignAttributes(a, {
                      "stroke-width": C.stroke_width,
                      "stroke-dasharray": C.stroke_dasharray,
                      "stroke-linejoin": C.stroke_linejoin,
                      "stroke-linecap": C.stroke_linecap,
                      style: "pointer-events:inherit"
                  }, 100), svgedit.utilities.assignAttributes(a, e.elements[r].attr), "text" === e.elements[r].type) a.textContent = e.elements[r].content;
              else if ("foreignObject" === e.elements[r].type) {
                  var s = e.elements[r].content;
                  if (s)
                      for (var o = 0; o < s.length; o++) {
                          var l = document.createElement(s[o].tag);
                          if (l.tagName = l.tagName.toLowerCase(), "select" === l.tagName.toLowerCase()) {
                              var d = document.createElement("option");
                              d.setAttribute("test", " "), l.appendChild(d)
                          } else "button" === l.tagName.toLowerCase() ? l.innerHTML = "button" : "span" === l.tagName.toLowerCase() && (s[o].value && (l.innerHTML = s[o].value), s[o].attr && svgedit.utilities.assignAttributes(l, s[o].attr));
                          svgedit.utilities.assignAttributes(l, s[o].attr), s[o].style && l.setAttribute("style", s[o].style), "input" === l.tagName.toLowerCase() && (l.style.backgroundColor = C.fill, l.style.color = C.stroke), a.appendChild(l)
                      }
              }
              t.appendChild(a)
          }
          return e.curStyles && svgedit.utilities.assignAttributes(t, {
              fill: C.fill,
              stroke: C.stroke,
              "stroke-width": C.stroke_width,
              "stroke-dasharray": C.stroke_dasharray,
              "stroke-linejoin": C.stroke_linejoin,
              "stroke-linecap": C.stroke_linecap,
              style: "pointer-events:inherit"
          }, 100), svgedit.utilities.assignAttributes(t, e.attr, 100), svgedit.utilities.cleanupElement(t), V("onGaugeAdded", {
              id: e.id,
              type: e.type
          }), t
      },
      A = (o.getTransformList = svgedit.transformlist.getTransformList, svgedit.math.transformPoint),
      k = o.matrixMultiply = svgedit.math.matrixMultiply,
      E = o.hasMatrixTransform = svgedit.math.hasMatrixTransform,
      B = o.transformListToTransform = svgedit.math.transformListToTransform;
  svgedit.math.snapToAngle, svgedit.math.getMatrix;
  svgedit.units.init({
      getBaseUnit: function() {
          return a.baseUnit
      },
      getElement: svgedit.utilities.getElem,
      getHeight: function() {
          return m.getAttribute("height") / p
      },
      getWidth: function() {
          return m.getAttribute("width") / p
      },
      getRoundDigits: function() {
