  svgedit.recalculate || (svgedit.recalculate = {});
  var t, e = svgedit.NS;
  svgedit.recalculate.init = function(e) {
      t = e
  }, svgedit.recalculate.updateClipPath = function(e, r, a) {
      var s = getRefElem(e).firstChild,
          i = svgedit.transformlist.getTransformList(s),
          m = t.getSVGRoot().createSVGTransform();
      m.setTranslate(r, a), i.appendItem(m), svgedit.recalculate.recalculateDimensions(s)
  }, svgedit.recalculate.recalculateDimensions = function(r) {
      if (null == r) return null;
      if ("svg" == r.nodeName && navigator.userAgent.indexOf("Firefox/20") >= 0) return null;
      var a, s = t.getSVGRoot(),
          i = svgedit.transformlist.getTransformList(r);
      if (i && i.numberOfItems > 0) {
          for (a = i.numberOfItems; a--;) {
              var m = i.getItem(a);
              0 === m.type ? i.removeItem(a) : 1 === m.type ? svgedit.math.isIdentity(m.matrix) && i.removeItem(a) : 4 === m.type && 0 === m.angle && i.removeItem(a)
          }
          if (1 === i.numberOfItems && svgedit.utilities.getRotationAngle(r)) return null
      }
      if (!i || 0 == i.numberOfItems) return r.setAttribute("transform", ""), r.removeAttribute("transform"), null;
      if (i) {
          a = i.numberOfItems;
          for (var n = []; a--;) {
              var m = i.getItem(a);
              1 === m.type ? n.push([m.matrix, a]) : n.length && (n = [])
          }
          if (2 === n.length) {
              var o = s.createSVGTransformFromMatrix(svgedit.math.matrixMultiply(n[1][0], n[0][0]));
              i.removeItem(n[0][1]), i.removeItem(n[1][1]), i.insertItemBefore(o, n[1][1])
          }
          if (a = i.numberOfItems, a >= 2 && 1 === i.getItem(a - 2).type && 2 === i.getItem(a - 1).type) {
              var f = s.createSVGTransform(),
                  v = svgedit.math.matrixMultiply(i.getItem(a - 2).matrix, i.getItem(a - 1).matrix);
              f.setMatrix(v), i.removeItem(a - 2), i.removeItem(a - 2), i.appendItem(f)
          }
      }
      switch (r.tagName) {
          case "line":
          case "polyline":
          case "polygon":
          case "path":
              break;
          default:
              if (1 === i.numberOfItems && 1 === i.getItem(0).type || 2 === i.numberOfItems && 1 === i.getItem(0).type && 4 === i.getItem(0).type) return null
      }
      var g = $(r).data("gsvg"),
          l = new svgedit.history.BatchCommand("Transform"),
          d = {},
          u = null,
          c = [];
      switch (r.tagName) {
          case "line":
              c = ["x1", "y1", "x2", "y2"];
              break;
          case "circle":
              c = ["cx", "cy", "r"];
              break;
          case "ellipse":
              c = ["cx", "cy", "rx", "ry"];
              break;
          case "foreignObject":
          case "rect":
          case "image":
              c = ["width", "height", "x", "y"];
              break;
          case "use":
          case "text":
          case "tspan":
              c = ["x", "y"];
              break;
          case "polygon":
          case "polyline":
              u = {}, u.points = r.getAttribute("points");
              var p = r.points,
                  I = p.numberOfItems;
              d.points = new Array(I);
              var x;
              for (x = 0; x < I; ++x) {
                  var h = p.getItem(x);
                  d.points[x] = {
                      x: h.x,
                      y: h.y
                  }
              }
              break;
          case "path":
              u = {}, u.d = r.getAttribute("d"), d.d = r.getAttribute("d")
      }
      if (c.length ? (d = $(r).attr(c), $.each(d, function(t, e) {
              d[t] = svgedit.units.convertToNum(t, e)
          })) : g && (d = {
              x: $(g).attr("x") || 0,
              y: $(g).attr("y") || 0
          }), null == u && (u = $.extend(!0, {}, d), $.each(u, function(t, e) {
              u[t] = svgedit.units.convertToNum(t, e)
          })), u.transform = t.getStartTransform() || "", "g" == r.tagName && !g || "a" == r.tagName) {
          var T = svgedit.utilities.getBBox(r),
              y = {
                  x: T.x + T.width / 2,
                  y: T.y + T.height / 2
              },
              b = svgedit.math.transformPoint(T.x + T.width / 2, T.y + T.height / 2, svgedit.math.transformListToTransform(i).matrix),
              v = s.createSVGMatrix(),
              S = svgedit.utilities.getRotationAngle(r);
          if (S) {
              var M = S * Math.PI / 180;
              if (Math.abs(M) > 1e-10) var O = Math.sin(M) / (1 - Math.cos(M));
              else var O = 2 / M;
              var x;
              for (x = 0; x < i.numberOfItems; ++x) {
                  var m = i.getItem(x);
                  if (4 == m.type) {
                      var A = m.matrix;
                      y.y = (O * A.e + A.f) / 2, y.x = (A.e - O * A.f) / 2, i.removeItem(x);
                      break
                  }
              }
          }
          var G = 0,
              V = 0,
              L = 0,
              N = i.numberOfItems;
          if (N) var B = i.getItem(0).matrix;
          if (N >= 3 && 3 == i.getItem(N - 2).type && 2 == i.getItem(N - 3).type && 2 == i.getItem(N - 1).type) {
              L = 3;
              for (var R = i.getItem(N - 3).matrix, w = i.getItem(N - 2).matrix, k = i.getItem(N - 1).matrix, C = r.childNodes, D = C.length; D--;) {
                  var E = C.item(D);
                  if (G = 0, V = 0, 1 == E.nodeType) {
                      var P = svgedit.transformlist.getTransformList(E);
                      if (!P) continue;
                      var v = svgedit.math.transformListToTransform(P).matrix,
                          j = svgedit.utilities.getRotationAngle(E),
                          F = t.getStartTransform(),
                          U = [];
                      if (t.setStartTransform(E.getAttribute("transform")), j || svgedit.math.hasMatrixTransform(P)) {
                          var H = s.createSVGTransform();
                          H.setMatrix(svgedit.math.matrixMultiply(R, w, k, v)), P.clear(), P.appendItem(H), U.push(H)
                      } else {
                          var W = svgedit.math.matrixMultiply(v.inverse(), k, v),
                              q = s.createSVGMatrix();
                          q.e = -W.e, q.f = -W.f;
                          var z = svgedit.math.matrixMultiply(q.inverse(), v.inverse(), R, w, k, v, W.inverse()),
                              J = s.createSVGTransform(),
                              K = s.createSVGTransform(),
                              Q = s.createSVGTransform();
                          J.setTranslate(W.e, W.f), K.setScale(z.a, z.d), Q.setTranslate(q.e, q.f), P.appendItem(Q), P.appendItem(K), P.appendItem(J), U.push(Q), U.push(K), U.push(J)
                      }
                      l.addSubCommand(svgedit.recalculate.recalculateDimensions(E)), t.setStartTransform(F)
                  }
              }
              i.removeItem(N - 1), i.removeItem(N - 2), i.removeItem(N - 3)
          } else if (N >= 3 && 1 == i.getItem(N - 1).type) {
              L = 3, v = svgedit.math.transformListToTransform(i).matrix;
              var H = s.createSVGTransform();
              H.setMatrix(v), i.clear(), i.appendItem(H)
          } else if ((1 == N || N > 1 && 3 != i.getItem(1).type) && 2 == i.getItem(0).type) {
              L = 2;
              var X = svgedit.math.transformListToTransform(i).matrix;
              i.removeItem(0);
              var Y = svgedit.math.transformListToTransform(i).matrix.inverse(),
                  Z = svgedit.math.matrixMultiply(Y, X);
              if (G = Z.e, V = Z.f, 0 != G || 0 != V) {
                  for (var C = r.childNodes, D = C.length, _ = []; D--;) {
                      var E = C.item(D);
                      if (1 == E.nodeType) {
                          if (E.getAttribute("clip-path")) {
                              var tt = E.getAttribute("clip-path");
                              _.indexOf(tt) === -1 && (svgedit.recalculate.updateClipPath(tt, G, V), _.push(tt))
                          }
                          var F = t.getStartTransform();
                          t.setStartTransform(E.getAttribute("transform"));
                          var P = svgedit.transformlist.getTransformList(E);
                          if (P) {
                              var et = s.createSVGTransform();
                              et.setTranslate(G, V), P.numberOfItems ? P.insertItemBefore(et, 0) : P.appendItem(et), l.addSubCommand(svgedit.recalculate.recalculateDimensions(E));
                              for (var rt = r.getElementsByTagNameNS(e.SVG, "use"), at = "#" + E.id, st = rt.length; st--;) {
                                  var it = rt.item(st);
                                  if (at == svgedit.utilities.getHref(it)) {
                                      var mt = s.createSVGTransform();
                                      mt.setTranslate(-G, -V), svgedit.transformlist.getTransformList(it).insertItemBefore(mt, 0), l.addSubCommand(svgedit.recalculate.recalculateDimensions(it))
                                  }
                              }
                              t.setStartTransform(F)
                          }
                      }
                  }
                  _ = [], t.setStartTransform(F)
              }
          } else {
              if (1 != N || 1 != i.getItem(0).type || S) {
                  if (S) {
                      var nt = s.createSVGTransform();
                      nt.setRotate(S, b.x, b.y), i.numberOfItems ? i.insertItemBefore(nt, 0) : i.appendItem(nt)
                  }
                  return 0 == i.numberOfItems && r.removeAttribute("transform"), null
              }
              L = 1;
              for (var v = i.getItem(0).matrix, C = r.childNodes, D = C.length; D--;) {
                  var E = C.item(D);
                  if (1 == E.nodeType) {
                      var F = t.getStartTransform();
                      t.setStartTransform(E.getAttribute("transform"));
                      var P = svgedit.transformlist.getTransformList(E);
                      if (!P) continue;
                      var ot = svgedit.math.matrixMultiply(v, svgedit.math.transformListToTransform(P).matrix),
                          ft = s.createSVGTransform();
                      ft.setMatrix(ot), P.clear(), P.appendItem(ft, 0), l.addSubCommand(svgedit.recalculate.recalculateDimensions(E)), t.setStartTransform(F);
                      var vt = E.getAttribute("stroke-width");
                      if ("none" !== E.getAttribute("stroke") && !isNaN(vt)) {
                          var gt = (Math.abs(ot.a) + Math.abs(ot.d)) / 2;
                          E.setAttribute("stroke-width", vt * gt)
                      }
                  }
              }
              i.clear()
          }
          if (2 == L) {
              if (S) {
                  b = {
                      x: y.x + B.e,
                      y: y.y + B.f
                  };
                  var nt = s.createSVGTransform();
                  nt.setRotate(S, b.x, b.y), i.numberOfItems ? i.insertItemBefore(nt, 0) : i.appendItem(nt)
              }
          } else if (3 == L) {
              var v = svgedit.math.transformListToTransform(i).matrix,
                  lt = s.createSVGTransform();
              lt.setRotate(S, y.x, y.y);
              var dt = lt.matrix,
                  ut = s.createSVGTransform();
              ut.setRotate(S, b.x, b.y);
              var ct = ut.matrix.inverse(),
                  pt = v.inverse(),
                  It = svgedit.math.matrixMultiply(pt, ct, dt, v);
              if (G = It.e, V = It.f, 0 != G || 0 != V)
                  for (var C = r.childNodes, D = C.length; D--;) {
                      var E = C.item(D);
                      if (1 == E.nodeType) {
                          var F = t.getStartTransform();
                          t.setStartTransform(E.getAttribute("transform"));
                          var P = svgedit.transformlist.getTransformList(E),
                              et = s.createSVGTransform();
                          et.setTranslate(G, V), P.numberOfItems ? P.insertItemBefore(et, 0) : P.appendItem(et), l.addSubCommand(svgedit.recalculate.recalculateDimensions(E)), t.setStartTransform(F)
                      }
                  }
              S && (i.numberOfItems ? i.insertItemBefore(ut, 0) : i.appendItem(ut))
          }
      } else {
          var T = svgedit.utilities.getBBox(r);
          if (!T && "path" != r.tagName) return null;
          var v = s.createSVGMatrix(),
              j = svgedit.utilities.getRotationAngle(r);
          if (j) {
              var y = {
                      x: T.x + T.width / 2,
                      y: T.y + T.height / 2
                  },
                  b = svgedit.math.transformPoint(T.x + T.width / 2, T.y + T.height / 2, svgedit.math.transformListToTransform(i).matrix),
                  M = j * Math.PI / 180;
              if (Math.abs(M) > 1e-10) var O = Math.sin(M) / (1 - Math.cos(M));
              else var O = 2 / M;
              for (var x = 0; x < i.numberOfItems; ++x) {
                  var m = i.getItem(x);
                  if (4 == m.type) {
                      var A = m.matrix;
                      y.y = (O * A.e + A.f) / 2, y.x = (A.e - O * A.f) / 2, i.removeItem(x);
                      break
                  }
              }
          }
          var L = 0,
              N = i.numberOfItems;
          if (!svgedit.browser.isWebkit()) {
              var xt = r.getAttribute("fill");
              if (xt && 0 === xt.indexOf("url(")) {
                  var ht = getRefElem(xt),
                      Tt = "pattern";
                  ht.tagName !== Tt && (Tt = "gradient");
                  var yt = ht.getAttribute(Tt + "Units");
                  if ("userSpaceOnUse" === yt) {
                      v = svgedit.math.transformListToTransform(i).matrix;
                      var bt = svgedit.transformlist.getTransformList(ht),
                          St = svgedit.math.transformListToTransform(bt).matrix;
                      v = svgedit.math.matrixMultiply(v, St);
                      var Mt = "matrix(" + [v.a, v.b, v.c, v.d, v.e, v.f].join(",") + ")";
                      ht.setAttribute(Tt + "Transform", Mt)
                  }
              }
          }
          if (N >= 3 && 3 == i.getItem(N - 2).type && 2 == i.getItem(N - 3).type && 2 == i.getItem(N - 1).type) L = 3, v = svgedit.math.transformListToTransform(i, N - 3, N - 1).matrix, i.removeItem(N - 1), i.removeItem(N - 2), i.removeItem(N - 3);
          else if (4 == N && 1 == i.getItem(N - 1).type) {
              L = 3, v = svgedit.math.transformListToTransform(i).matrix;
              var H = s.createSVGTransform();
              H.setMatrix(v), i.clear(), i.appendItem(H), v = s.createSVGMatrix()
          } else if ((1 == N || N > 1 && 3 != i.getItem(1).type) && 2 == i.getItem(0).type) {
              L = 2;
              var Ot = i.getItem(0).matrix,
                  At = svgedit.math.transformListToTransform(i, 1).matrix,
                  Gt = At.inverse();
              v = svgedit.math.matrixMultiply(Gt, Ot, At), i.removeItem(0)
          } else {
              if (1 != N || 1 != i.getItem(0).type || j) {
                  if (L = 4, j) {
                      var nt = s.createSVGTransform();
                      nt.setRotate(j, b.x, b.y), i.numberOfItems ? i.insertItemBefore(nt, 0) : i.appendItem(nt)
                  }
                  return 0 == i.numberOfItems && r.removeAttribute("transform"), null
              }
              switch (v = svgedit.math.transformListToTransform(i).matrix, r.tagName) {
                  case "line":
                      d = $(r).attr(["x1", "y1", "x2", "y2"]);
                  case "polyline":
                  case "polygon":
                      if (d.points = r.getAttribute("points"), d.points) {
                          var p = r.points,
                              I = p.numberOfItems;
                          d.points = new Array(I);
                          for (var x = 0; x < I; ++x) {
                              var h = p.getItem(x);
                              d.points[x] = {
                                  x: h.x,
                                  y: h.y
                              }
                          }
                      }
                  case "path":
                      d.d = r.getAttribute("d"), L = 1, i.clear()
              }
          }
          if (1 != L && 2 != L && 3 != L || svgedit.coords.remapElement(r, d, v), 2 == L) {
              if (j) {
                  svgedit.math.hasMatrixTransform(i) || (b = {
                      x: y.x + v.e,
                      y: y.y + v.f
                  });
                  var nt = s.createSVGTransform();
                  nt.setRotate(j, b.x, b.y), i.numberOfItems ? i.insertItemBefore(nt, 0) : i.appendItem(nt)
              }
              if ("text" == r.tagName)
                  for (var C = r.childNodes, D = C.length; D--;) {
                      var E = C.item(D);
                      if ("tspan" == E.tagName) {
                          var Vt = {
                              x: $(E).attr("x") || 0,
                              y: $(E).attr("y") || 0
                          };
                          svgedit.coords.remapElement(E, Vt, v)
                      }
                  }
          } else if (3 == L && j) {
              var v = svgedit.math.transformListToTransform(i).matrix,
                  lt = s.createSVGTransform();
              lt.setRotate(j, y.x, y.y);
              var dt = lt.matrix,
                  ut = s.createSVGTransform();
              ut.setRotate(j, b.x, b.y);
              var ct = ut.matrix.inverse(),
                  pt = v.inverse(),
                  It = svgedit.math.matrixMultiply(pt, ct, dt, v);
              svgedit.coords.remapElement(r, d, It), j && (i.numberOfItems ? i.insertItemBefore(ut, 0) : i.appendItem(ut))
          }
      }
      return 0 == i.numberOfItems && r.removeAttribute("transform"), l.addSubCommand(new svgedit.history.ChangeElementCommand(r, u)), l
  }
})();
(function() {
  "use strict";
  var n, t, i, e, o, r, h;
