  svgedit.coords || (svgedit.coords = {});
  var t = [0, "z", "M", "m", "L", "l", "C", "c", "Q", "q", "A", "a", "H", "h", "V", "v", "S", "s", "T", "t"],
      n = null;
  svgedit.coords.init = function(t) {
      n = t
  };
  svgedit.coords.remapElement = function(i, r, u) {
      for (var v, h = function(n, t) {
              return svgedit.math.transformPoint(n, t, u)
          }, p = function(n) {
              return u.a * n
          }, w = function(n) {
              return u.d * n
          }, kt = n.getGridSnapping() && i.parentNode.parentNode.localName === "svg", tt = function() {
              var n;
              if (kt)
                  for (n in r) r[n] = svgedit.utilities.snapToGrid(r[n]);
              svgedit.utilities.assignAttributes(i, r, 1e3, !0)
          }, it = svgedit.utilities.getBBox(i), rt, lt, o, at, vt, yt, pt, b, y, k, ft, et, d, s, a, g, c, ot, st, f, ht, ct, nt, wt, bt, l, e = 0; e < 2; e++) v = e === 0 ? "fill" : "stroke", rt = i.getAttribute(v), rt && rt.indexOf("url(") === 0 && (u.a < 0 || u.d < 0) && (lt = svgedit.utilities.getRefElem(rt), o = lt.cloneNode(!0), u.a < 0 && (at = o.getAttribute("x1"), vt = o.getAttribute("x2"), o.setAttribute("x1", -(at - 1)), o.setAttribute("x2", -(vt - 1))), u.d < 0 && (yt = o.getAttribute("y1"), pt = o.getAttribute("y2"), o.setAttribute("y1", -(yt - 1)), o.setAttribute("y2", -(pt - 1))), o.id = n.getDrawing().getNextId(), svgedit.utilities.findDefs().appendChild(o), i.setAttribute(v, "url(#" + o.id + ")"));
      b = i.tagName;
      (b === "g" || b === "text" || b == "tspan" || b === "use") && (u.a == 1 && u.b == 0 && u.c == 0 && u.d == 1 && (u.e != 0 || u.f != 0) ? (ft = svgedit.math.transformListToTransform(i).matrix, et = svgedit.math.matrixMultiply(ft.inverse(), u, ft), r.x = parseFloat(r.x) + et.e, r.y = parseFloat(r.y) + et.f) : (y = svgedit.transformlist.getTransformList(i), k = svgroot.createSVGTransform(), k.setMatrix(svgedit.math.matrixMultiply(svgedit.math.transformListToTransform(y).matrix, u)), y.clear(), y.appendItem(k)));
      switch (b) {
          case "foreignObject":
          case "rect":
          case "image":
              b === "image" && (u.a < 0 || u.d < 0) ? (y = svgedit.transformlist.getTransformList(i), k = svgroot.createSVGTransform(), k.setMatrix(svgedit.math.matrixMultiply(svgedit.math.transformListToTransform(y).matrix, u)), y.clear(), y.appendItem(k)) : (a = h(r.x, r.y), r.width = p(r.width), r.height = w(r.height), r.x = a.x + Math.min(0, r.width), r.y = a.y + Math.min(0, r.height), r.width = Math.abs(r.width), r.height = Math.abs(r.height));
              tt();
              break;
          case "ellipse":
              d = h(r.cx, r.cy);
              r.cx = d.x;
              r.cy = d.y;
              r.rx = p(r.rx);
              r.ry = w(r.ry);
              r.rx = Math.abs(r.rx);
              r.ry = Math.abs(r.ry);
              tt();
              break;
          case "circle":
              d = h(r.cx, r.cy);
              r.cx = d.x;
              r.cy = d.y;
              var ut = svgedit.math.transformBox(it.x, it.y, it.width, it.height, u),
                  dt = ut.tr.x - ut.tl.x,
                  gt = ut.bl.y - ut.tl.y;
              r.r = Math.min(dt / 2, gt / 2);
              r.r && (r.r = Math.abs(r.r));
              tt();
              break;
          case "line":
              a = h(r.x1, r.y1);
              g = h(r.x2, r.y2);
              r.x1 = a.x;
              r.y1 = a.y;
              r.x2 = g.x;
              r.y2 = g.y;
          case "text":
          case "tspan":
          case "use":
              tt();
              break;
          case "g":
              ot = $(i).data("gsvg");
              ot && svgedit.utilities.assignAttributes(ot, r, 1e3, !0);
              break;
          case "polyline":
          case "polygon":
              for (c = r.points.length, e = 0; e < c; ++e) s = r.points[e], s = h(s.x, s.y), r.points[e].x = s.x, r.points[e].y = s.y;
              for (c = r.points.length, st = "", e = 0; e < c; ++e) s = r.points[e], st += s.x + "," + s.y + " ";
              i.setAttribute("points", st);
              break;
          case "path":
              for (ht = i.pathSegList, c = ht.numberOfItems, r.d = [], e = 0; e < c; ++e) f = ht.getItem(e), r.d[e] = {
                  type: f.pathSegType,
                  x: f.x,
                  y: f.y,
                  x1: f.x1,
                  y1: f.y1,
                  x2: f.x2,
                  y2: f.y2,
                  r1: f.r1,
                  r2: f.r2,
                  angle: f.angle,
                  largeArcFlag: f.largeArcFlag,
                  sweepFlag: f.sweepFlag
              };
              for (c = r.d.length, ct = r.d[0], nt = h(ct.x, ct.y), r.d[0].x = nt.x, r.d[0].y = nt.y, e = 1; e < c; ++e) f = r.d[e], v = f.type, v % 2 == 0 ? (wt = f.x != undefined ? f.x : nt.x, bt = f.y != undefined ? f.y : nt.y, s = h(wt, bt), a = h(f.x1, f.y1), g = h(f.x2, f.y2), f.x = s.x, f.y = s.y, f.x1 = a.x, f.y1 = a.y, f.x2 = g.x, f.y2 = g.y, f.r1 = p(f.r1), f.r2 = w(f.r2)) : (f.x = p(f.x), f.y = w(f.y), f.x1 = p(f.x1), f.y1 = w(f.y1), f.x2 = p(f.x2), f.y2 = w(f.y2), f.r1 = p(f.r1), f.r2 = w(f.r2));
              for (l = "", c = r.d.length, e = 0; e < c; ++e) {
                  f = r.d[e];
                  v = f.type;
                  l += t[v];
                  switch (v) {
                      case 13:
                      case 12:
                          l += f.x + " ";
                          break;
                      case 15:
                      case 14:
                          l += f.y + " ";
                          break;
                      case 3:
                      case 5:
                      case 19:
                      case 2:
                      case 4:
                      case 18:
                          l += f.x + "," + f.y + " ";
                          break;
                      case 7:
                      case 6:
                          l += f.x1 + "," + f.y1 + " " + f.x2 + "," + f.y2 + " " + f.x + "," + f.y + " ";
                          break;
                      case 9:
                      case 8:
                          l += f.x1 + "," + f.y1 + " " + f.x + "," + f.y + " ";
                          break;
                      case 11:
                      case 10:
                          l += f.r1 + "," + f.r2 + " " + f.angle + " " + +f.largeArcFlag + " " + +f.sweepFlag + " " + f.x + "," + f.y + " ";
                          break;
                      case 17:
                      case 16:
                          l += f.x2 + "," + f.y2 + " " + f.x + "," + f.y + " "
                  }
              }
              i.setAttribute("d", l)
      }
  }
})();
var myselect = function() {
  "use strict";
  return {
      initSelect: function() {
          var e, t, r;
